import { firestore } from "@/config/firebase";
import { ResponseType, WalletType } from "@/types";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";

export const createOrUpdateWallet = async (
   walletData: Partial<WalletType>
): Promise<ResponseType> => {
  try {
    let walletToSave = {...walletData};

    if (walletData.image && typeof walletData.image !== 'string') {
      // hanya upload kalau image adalah object (bukan string URL lama)
      const imageUpdateRes = await uploadFileToCloudinary(walletData.image.uri, 'wallets');
      if (!imageUpdateRes.success) {
        return {
          success: false,
          msg: imageUpdateRes.msg || "Failed to upload wallet icon"
        }
      }
      walletToSave.image = imageUpdateRes.data;
    }

    if(!walletData?.id){
      // new Wallet
      walletToSave.amount = 0;
      walletToSave.totalIncome = 0;
      walletToSave.totalExpenses = 0;
      walletToSave.created = new Date();
    }

    const walletRef = walletData?.id 
    ? doc(firestore, 'wallets',walletData?.id)
    : doc(collection(firestore, 'wallets'));

    await setDoc(walletRef, walletToSave, {merge: true}) 
    return { success: true, data: {...walletToSave, id:walletRef.id}};
  } catch (error: any) {
    console.log("Error create or update wallet: ", error)
    return { success:false, msg: error.message}
  }
}

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    await deleteDoc(walletRef);

    return { success: true, msg: "Wallet deleted successfully" };
  } catch (err: unknown) {
    console.log("error deleting wallet", err);

    const message =
      err instanceof Error ? err.message : "Unknown error deleting wallet";

    return { success: false, msg: message };
  }
};