import { useState } from 'react';

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadPhoto = async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/service-requests/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload photo');
      }

      const data = await response.json();
      setProgress(100);
      return data.url;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiplePhotos = async (files: File[]): Promise<string[]> => {
    setUploading(true);
    const urls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadPhoto(files[i]);
        urls.push(url);
        setProgress(((i + 1) / files.length) * 100);
      }
      return urls;
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadPhoto,
    uploadMultiplePhotos,
    uploading,
    progress,
  };
}
