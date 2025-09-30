import { firestore } from "@/config/firebase";
import { ResponseType, UserDataType } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";


export const updateUser = async (
  uid: string,
  updateData: UserDataType
):  Promise<ResponseType> => {
  try {

    if(updateData.image && updateData.image.uri){
      const imageUpdateRes = await uploadFileToCloudinary(updateData.image.uri, 'users');
      if(!imageUpdateRes.success){
        return{success:false, msg: imageUpdateRes.msg || "Gagal Upload Foto"}
      }
      updateData.image = imageUpdateRes.data;
    }
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, updateData)

    return{ success: true, msg: "Berhasil Edit Data"}
  } catch (error: any) {
    console.log('Error update user :', error)
    return {success: false, msg: error?.massage}
  }
}