import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
) : Promise<ResponseType> => {
     try {
      
      const { id, type, walletId, amount, image} = transactionData;
      if(!amount || amount<=0 || !walletId || !type){
        return{ success: false, msg: "Invalid transaction data!"}
      }

      if(id){
        // todo: update transaction (exist)
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