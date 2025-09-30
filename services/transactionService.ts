import { firestore } from "@/config/firebase";
import { colors } from "@/constants/theme";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { getLast12Months, getLast7Days, getYearsRange } from "@/utils/common";
import { scale } from "@/utils/styling";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";
import { checkExpenseLimitAndNotify } from './notificationService';
import { createOrUpdateWallet } from "./walletService";

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
) : Promise<ResponseType> => {
     try {
      
      const { id, type, walletId, amount, image} = transactionData;
      if(!amount || amount<=0 || !walletId || !type){
        return{ success: false, msg: "Data Transaksi Salah"}
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

      if (type === 'expense') { 
          await checkExpenseLimitAndNotify(); 
      }

      if (image && typeof image !== 'string') {
          const imageUpdateRes = await uploadFileToCloudinary(image.uri, 'transactions');
          if (!imageUpdateRes.success) {
              return { success: false, msg: imageUpdateRes.msg || "Gagal Upload" };
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
      return { success: false, msg: "Dompet yang dipilih tidak memiliki saldo yang cukup"}
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

    if(newTransactionType === "expense"){
    // if user tries to convert income to expense  on the same wallet or if user try to increase the expense amount and dont balance amount
      if(oldTransaction.walletId === newWalletId && revertedWalletAmount < newTransactionAmount){
        return { success: false, msg: "Dompet yang dipilih tidak memiliki saldo yang cukup"};
      }

      if(newWallet.amount! < newTransactionAmount){
        return { success: false, msg: "Dompet yang dipilih tidak memiliki saldo yang cukup"};
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
      return { success: false, msg: "Kamu tidak dapat menghapus transaksi ini"}
    }

    await createOrUpdateWallet({
      id: wallletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount
    });

    await deleteDoc(transactionRef);
    
    if (transcationData?.type === 'expense') { 
        await checkExpenseLimitAndNotify(); 
    }

    return { success: true}
  } catch (err: any) {
    console.log("error updateing wallet for new transaction", err)
    return { success: false}
  }
}

export const fetchWeeklyStats = async (
   uid: string
) : Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const transactionQuery = query(
      collection(db, 'transactions'),
      where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(transactionQuery);
    const weeklyData = getLast7Days();
    const transactions: TransactionType[] = [];

    // mapping (foreach)
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp).toDate().toISOString().split("T")[0];

      const dataData = weeklyData.find((day) => day.date === transactionDate);

      if(dataData){
        if(transaction.type === "income"){
          dataData.income += transaction.amount;
        } else if(transaction.type === 'expense') {
          dataData.expense += transaction.amount;
        }
      }
    });

    // take each day and creates two entries in an array
    const stats = weeklyData.flatMap((day)=>[
        {
          value: day.income,
          label: day.day,
          spacing: scale(4),
          labelWidth: scale(30),
          frontColor: colors.primary,
        },
        {
          value: day.expense,
          frontColor: colors.rose,
        }
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions,
      }
    }
    
  } catch (err: any) {
    console.log("error fetching weekly stats: ", err)
    return { success: false,
    msg: "Failed to fetch weekly transactions"
    }
  }
}

export const fetchMonthlyStats = async (
   uid: string
) : Promise<ResponseType> => {
  try {
    const db = firestore;
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(today.getMonth() - 12) ;

    const transactionQuery = query(
      collection(db, 'transactions'),
      where("date", ">=", Timestamp.fromDate(twelveMonthsAgo)),
      where("date", "<=", Timestamp.fromDate(today)),
      where("uid", "==", uid),
      orderBy("date", "desc"),
    );

    const querySnapshot = await getDocs(transactionQuery);
    const monthlyData = getLast12Months();
    const transactions: TransactionType[] = [];

    // mapping (foreach)
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const transactionDate = (transaction.date as Timestamp).toDate();
      const monthName = transactionDate.toLocaleDateString("default", {
        month: 'short'
      });

      const shortYear = transactionDate.getFullYear().toString().slice(-2);
      const monthData = monthlyData.find(
        (month) => month.month === `${monthName} ${shortYear}`
      );

      if(monthData){
        if(transaction.type === "income"){
          monthData.income += transaction.amount;
        } else if(transaction.type === 'expense') {
          monthData.expense += transaction.amount;
        }
      }
    });

    // take each day and creates two entries in an array
    const stats = monthlyData.flatMap((month)=>[
        {
          value: month.income,
          label: month.month,
          spacing: scale(4),
          labelWidth: scale(46),
          frontColor: colors.primary,
        },
        {
          value: month.expense,
          frontColor: colors.rose,
        }
    ]);
    return {
      success: true,
      data: {
        stats,
        transactions,
      }
    }
    
  } catch (err: any) {
    console.log("error fetching monthly stats: ", err)
    return { success: false,
      msg: "Failed to fetch monthly transactions"
    }
  }
}

export const fetchYearlyStats = async (
   uid: string
) : Promise<ResponseType> => {
  try {
    const db = firestore;

    const transactionQuery = query(
      collection(db, 'transactions'),
      orderBy("date", "desc"),
      where("uid", "==", uid)
    );

    const querySnapshot = await getDocs(transactionQuery);
    const transactions: TransactionType[] = [];

    const firstTransaction = querySnapshot.docs.reduce((earliest, doc) =>{
      const transactionDate = doc.data().date.toDate();
      return transactionDate < earliest ? transactionDate: earliest;
    }, new Date());

    const firstYear = firstTransaction.getFullYear();
    const currentYear = new Date().getFullYear();

    const yearlyData = getYearsRange(firstYear, currentYear);


    // mapping (foreach)
    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType;
      transaction.id = doc.id;
      transactions.push(transaction);

      const transactionYear = (transaction.date as Timestamp).toDate().getFullYear();

      const yearData = yearlyData.find(
        (item: any) => item.year === transactionYear.toString()
      );


      if(yearData){
        if(transaction.type === "income"){
          yearData.income += transaction.amount;
        } else if(transaction.type === 'expense') {
          yearData.expense += transaction.amount;
        }
      }
    });

    // take each day and creates two entries in an array
    const stats = yearlyData.flatMap((year : any)=>[
        {
          value: year.income,
          label: year.year,
          spacing: scale(4),
          labelWidth: scale(35),
          frontColor: colors.primary,
        },
        {
          value: year.expense,
          frontColor: colors.rose,
        }
    ]);

    return {
      success: true,
      data: {
        stats,
        transactions,
      }
    }
    
  } catch (err: any) {
    console.log("error fetching weekly stats: ", err)
    return { success: false,
      msg: "Failed to fetch yeatly transactions"
    }
  }
}