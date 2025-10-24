import type { AspectRatio, VideoModel } from '../types';

/**
 * Converts a File object to a base64 encoded string, without the data URI prefix.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:image/jpeg;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Generates a video via the API endpoint, saving it to Blob and Postgres
 */
export const generateAndSaveVideo = async (
  userId: string,
  title: string,
  year: number | undefined,
  motionStyle: string,
  imageFile: File,
  aspectRatio: AspectRatio,
  prompt: string,
  videoModel: VideoModel
): Promise<string> => {
  const imageBase64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type;

  const response = await fetch('/api/generate-video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      title,
      year,
      motionStyle,
      imageBase64,
      mimeType,
      aspectRatio,
      prompt,
      videoModel,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate video');
  }

  const data = await response.json();
  return data.videoUrl;
};
