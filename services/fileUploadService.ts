import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * Standard non-tracking upload.
 */
export const uploadFile = async (file: File | Blob, path?: string): Promise<string> => {
  if (!path) {
    // Fallback if no path provided
    path = `uploads/misc/${Date.now()}_${(file as File).name || 'unknown'}`;
  }

  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

/**
 * Uploads a file with progress tracking for large assets.
 */
export const uploadFileWithProgress = (
  file: File | Blob, 
  path: string, 
  onProgress: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error("Resumable upload failed:", error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

/**
 * Deletes a file from Firebase Storage using its download URL.
 */
export const deleteFileFromUrl = async (url: string): Promise<void> => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    // Suppress error if file not found or permission denied
  }
};