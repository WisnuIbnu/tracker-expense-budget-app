import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { ResponseType } from "@/types";
import axios from 'axios';

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadFileToCloudinary = async (
  fileUri: string,
  folderName: string
): Promise<ResponseType> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'file.jpg'
    } as any);

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folderName);

    const response = await axios.post(CLOUDINARY_API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('upload image result:', response.data);
    return { success: true, data: response.data.secure_url };
  } catch (error: any) {
    console.log('got error when upload file', error);
    return { success: false, msg: error.message || 'Could not upload file' };
  }
};


export const getProfileImage = (file: any) => {
  if (file && typeof file === 'string') {
    return { uri: file }; // pastikan object {uri}
  }
  if (file && typeof file === 'object' && file.url) {
    return { uri: file.url };
  }

  return require('../assets/images/defaultAvatar.png');
};
