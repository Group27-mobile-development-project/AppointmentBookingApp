// components/pickAndUploadImage.js
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';

const pickAndUploadImage = async (pathInStorage, onSuccess) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    alert('Permission required to access media library');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    base64: true,
    quality: 0.7,
  });

  if (!result.canceled && result.assets.length > 0) {
    const asset = result.assets[0];
    const base64DataUrl = `data:image/jpeg;base64,${asset.base64}`;

    try {
      const imageRef = ref(storage, pathInStorage);
      await uploadString(imageRef, base64DataUrl, 'data_url');
      const url = await getDownloadURL(imageRef);
      onSuccess(url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please try again.');
    }
  }
};

export default pickAndUploadImage;
