import { GoogleGenAI } from "@google/genai";
import type { AspectRatio } from "../types";

const POLLING_INTERVAL_MS = 10000; // 10 seconds

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
 * Generates a video from an image file using the Gemini Veo model.
 * @param imageFile The image file to animate.
 * @param prompt The prompt describing the animation.
 * @param aspectRatio The desired aspect ratio of the video.
 * @returns A promise that resolves to an object URL for the generated video.
 */
export const generateVideoFromImage = async (
  imageFile: File,
  prompt: string,
  aspectRatio: AspectRatio
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please select one.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imageBase64 = await fileToBase64(imageFile);

  console.log("Starting video generation with prompt:", prompt);
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: {
      imageBytes: imageBase64,
      mimeType: imageFile.type,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio,
    },
  });

  console.log("Video generation initiated. Operation:", operation);

  // Polling for the result
  while (!operation.done) {
    console.log("Polling for video status...");
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
        console.log("Current operation status:", operation);
    } catch (e) {
        console.error("Error during polling:", e);
        throw new Error("Failed to poll for video generation status.");
    }
  }

  if (operation.error) {
    console.error("Video generation failed:", operation.error);
    throw new Error(operation.error.message || "Video generation failed with an unknown error.");
  }

  // Check for safety filter blocks before looking for the download link
  const raiReasons = (operation.response as any)?.raiMediaFilteredReasons;
  if (raiReasons && Array.isArray(raiReasons) && raiReasons.length > 0) {
    console.error("Video generation blocked by safety filters:", raiReasons);
    const reasonText = raiReasons.join(' ');
    
    // Create a more user-friendly message in Japanese.
    let userMessage: string;
    if (reasonText.toLowerCase().includes('children')) {
        userMessage = `申し訳ありませんが、写実的なお子様が写っている可能性のある画像から動画を生成することはできません。コミュニティの安全を守るための措置です。お手数ですが、別のお写真でお試しください。`;
    } else {
        userMessage = `コンテンツの安全上の理由により、このお写真から動画を生成できませんでした。お手数ですが、別のお写真でお試しください。 (詳細: ${reasonText})`;
    }
    
    throw new Error(userMessage);
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    const responseJson = operation.response ? JSON.stringify(operation.response, null, 2) : "undefined";
    console.error("No download link found in the response:", responseJson);
    throw new Error("ビデオURLを取得できませんでした。生成は完了しましたが、ビデオが作成されなかった可能性があります。コンテンツの制限による場合もあります。");
  }
  
  console.log("Fetching video from:", downloadLink);

  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }

  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};