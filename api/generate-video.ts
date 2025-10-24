import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { GoogleGenAI } from '@google/genai';
import type { AspectRatio } from '../types';

const POLLING_INTERVAL_MS = 10000; // 10 seconds

/**
 * Vercel Serverless Function to generate and save videos
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, title, year, motionStyle, imageBase64, mimeType, aspectRatio, prompt, videoModel } = req.body;

    if (!userId || !title || !motionStyle || !imageBase64 || !mimeType || !aspectRatio || !prompt || !videoModel) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    // Generate video using Gemini
    const ai = new GoogleGenAI({ apiKey });

    console.log('Starting video generation with prompt:', prompt);
    console.log('Using model:', videoModel);

    // Preview models support resolution parameter, stable models don't
    const supportsResolution = videoModel.includes('-preview');

    const config: any = {
      numberOfVideos: 1,
      aspectRatio: aspectRatio as AspectRatio,
    };

    if (supportsResolution) {
      config.resolution = '720p';
    }

    let operation = await ai.models.generateVideos({
      model: videoModel,
      prompt,
      image: {
        imageBytes: imageBase64,
        mimeType,
      },
      config,
    });

    console.log('Video generation initiated. Operation:', operation);

    // Polling for the result
    while (!operation.done) {
      console.log('Polling for video status...');
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
      try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
        console.log('Current operation status:', operation);
      } catch (e) {
        console.error('Error during polling:', e);
        throw new Error('Failed to poll for video generation status.');
      }
    }

    if (operation.error) {
      console.error('Video generation failed:', operation.error);
      throw new Error(operation.error.message || 'Video generation failed with an unknown error.');
    }

    // Check for safety filter blocks
    const raiReasons = (operation.response as any)?.raiMediaFilteredReasons;
    if (raiReasons && Array.isArray(raiReasons) && raiReasons.length > 0) {
      console.error('Video generation blocked by safety filters:', raiReasons);
      const reasonText = raiReasons.join(' ');

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
      const responseJson = operation.response ? JSON.stringify(operation.response, null, 2) : 'undefined';
      console.error('No download link found in the response:', responseJson);
      throw new Error('ビデオURLを取得できませんでした。生成は完了しましたが、ビデオが作成されなかった可能性があります。コンテンツの制限による場合もあります。');
    }

    console.log('Fetching video from:', downloadLink);

    // Download the video
    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();

    // Upload to Vercel Blob
    const filename = `${userId}/${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
    const blob = await put(filename, videoBlob, {
      access: 'public',
      contentType: 'video/mp4',
    });

    console.log('Video uploaded to Blob:', blob.url);

    // Save metadata to Postgres
    const client = createClient();
    await client.connect();

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS videos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          year INTEGER,
          motion_style TEXT NOT NULL,
          aspect_ratio TEXT NOT NULL,
          video_url TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      const result = await client.query(
        `INSERT INTO videos (user_id, title, year, motion_style, aspect_ratio, video_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id, title, year, motion_style, aspect_ratio, video_url, created_at`,
        [userId, title, year || null, motionStyle, aspectRatio, blob.url]
      );

      console.log('Video metadata saved to Postgres:', result.rows[0]);

      return res.status(200).json({
        success: true,
        video: result.rows[0],
        videoUrl: blob.url,
      });
    } finally {
      await client.end();
    }
  } catch (error: any) {
    console.error('Error in generate-video handler:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
