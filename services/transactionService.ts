import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";
import { createOrUpdateWallet } from "./walletService";

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
) : Promise<ResponseType> => {
     try {
      
      const { id, type, walletId, amount, image} = transactionData;
      if(!amount || amount<=0 || !walletId || !type){
        return{ success: false, msg: "Invalid transaction data!"}
      }

      if(id){
        const oldTransactionSnapShot = await getDoc(doc(firestore, "transactions", id)
      );
        const oldTransaction = oldTransactionSnapShot.data() as TransactionType;
        const shouldRevertOriginal = 
          oldTransaction.type !== type || 
          oldTransaction.amount !== amount || 
          oldTransaction.walletId === walletId;
          
        if(shouldRevertOriginal){
          let res = await revertAndUpdateWallets(oldTransaction, Number(amount), type, walletId);
          
          if(!res.success) return res;
        }
      } else{
        // update wallet for new transaction
        let res = await updadeWalletForNewTransaction(
          walletId!,
          Number(amount!),
          type
        );
        if(!res.success) return res;
      }

      if (image && typeof image !== 'string') {
          const imageUpdateRes = await uploadFileToCloudinary(image.uri, 'transactions');
          if (!imageUpdateRes.success) {
              return { success: false, msg: imageUpdateRes.msg || "Failed to upload receipt" };
          }
          transactionData.image = imageUpdateRes.data;
      }


      const transactionRef = id 
      ? doc(firestore, "transactions", id) 
      : doc(collection(firestore, "transactions"));

      await setDoc(transactionRef, transactionData, {merge: true});
      return { 
        success: true, data: {...transactionData,id: transactionRef.id
        }
      }
     } catch (err: any) {
      console.log("error creating or updateing transaction", err)
      return { success: false, msg: err.message}
     }
}
const updadeWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string
) => {
  try {
    
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapShot = await getDoc(walletRef);
    if(!walletSnapShot.exists()){
      console.log("error updating wallet for new transaction");
      return { success: false, msg: "Wallet not found"}
    }

    const walletData = walletSnapShot.data() as WalletType;

    if(type === "expense" && walletData.amount! - amount < 0) {
      return { success: false, msg: "Selected wallet dont have enough balance"}
    }

    const updatedType = type === "income" ? "totalIncome" : "totalExpenses";
    const updateWalletAmount 
      = type === "income" 
      ? Number(walletData.amount) + amount 
      : Number(walletData.amount) - amount;

    const updateTotals = type === "income" 
      ? Number(walletData.totalIncome) + amount 
      : Number(walletData.totalExpenses) + amount;

      await updateDoc(walletRef, {
          amount: updateWalletAmount,
          [updatedType] : updateTotals
      });
    return { success: true}
  } catch (err: any) {
    console.log("error updateing wallet for new transaction", err)
    return { success: false, msg: err.message}
  }
}
const revertAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string
) => {
  try {
    
    const originalWalletSnapshot = await getDoc(doc(firestore, "wallets", oldTransaction.walletId));

      const originalWallet = originalWalletSnapshot.data() as WalletType;

      let newWalletSnapshot = await getDoc(doc(firestore,"wallets", newWalletId));

      let newWallet = newWalletSnapshot.data() as WalletType;
      
      const revertType = oldTransaction.type === 'income'? "totalIncome" : 'totalExpenses';

      const revertIncomeExpense: number = 
        oldTransaction.type === 'income' 
          ? -Number(oldTransaction.amount) 
          : Number(oldTransaction.amount);

    const revertedWalletAmount = Number(originalWallet.amount) + revertIncomeExpense;

    const revertedIncomeExpenseAmount = Number(originalWallet[revertType]) - Number(oldTransaction.amount);

    if(newTransactionType){
    // if user tries to convert income to expense  on the same wallet or if user try to increase the expense amount and dont balance amount
      if(oldTransaction.walletId === newWalletId && revertedWalletAmount < newTransactionAmount){
        return { success: false, msg: "The selected wallet dont have enough balance"};
      }

      if(newWallet.amount! < newTransactionAmount){
        return { success: false, msg: "The selected wallet dont have enough balance"};
      }
    }

    await createOrUpdateWallet({
      id: oldTransaction.walletId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount,
    });


    // refetch the new Wallet, to update balance
    newWalletSnapshot = await getDoc(
      doc(firestore, "wallets", newWalletId)
     );

     newWallet = newWalletSnapshot.data() as WalletType;


     const updateType = newTransactionType ==='income' ? "totalIncome": "totalExpenses";


     const updatedWalletAmount: number = 
      newTransactionType ==='income' 
      ? Number(newTransactionAmount) 
      : -Number(newTransactionAmount);

     const newWalletAmount = Number(newWallet.amount) + updatedWalletAmount;

     const newIncomeExpenseAmount = Number(
      newWallet[updateType]! + Number(newTransactionAmount)
    );

    await createOrUpdateWallet({
      id: newWalletId,
      amount: newWalletAmount,
      [updateType] : newIncomeExpenseAmount
    });


    return { success: true}
  } catch (err: any) {
    console.log("error updateing wallet for new transaction", err)
    return { success: false, msg: err.message}
  }
}
export const deleteTransaction = async (
  transactionId: string,
  wallletId: any,
) => {
  try {

    const transactionRef = doc(firestore, "transactions" ,transactionId);
    const trasactionSnapshot = await getDoc(transactionRef);
    
    if(!trasactionSnapshot.exists()){
      return{ success: false, msg: "Trasaction not found!"}
    }

    const transcationData = trasactionSnapshot.data() as TransactionType;

    const transactionType = transcationData?.type;
    const transactionAmount = transcationData?.amount;


    // fetch all wallet to update amount an all total
    const walletSnapshot = await getDoc(doc(firestore, "wallets", wallletId));
    const walletData = walletSnapshot.data() as WalletType;

    const updateType = transactionType === 'income' ? 'totalIncome': 'totalExpenses';

    const newWalletAmount = walletData?.amount! - (transactionType === 'income' ? transactionAmount : -transactionAmount);

    const newIncomeExpenseAmount = walletData[updateType]! -transactionAmount;
    
    if(transactionType === 'expense' && newWalletAmount<0){
      return { success: false, msg: "You cannot delete this transaction"}
    }

    await createOrUpdateWallet({
      id: wallletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount
    });

    await deleteDoc(transactionRef);
    
    return { success: true}
  } catch (err: any) {
    console.log("error updateing wallet for new transaction", err)
    return { success: false}
  }
}