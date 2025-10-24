import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { del } from '@vercel/blob';

/**
 * Vercel Serverless Function to delete a video
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId, userId } = req.body;

    if (!videoId || !userId) {
      return res.status(400).json({ error: 'Missing videoId or userId' });
    }

    // First, verify ownership and get video URL
    const videoResult = await sql`
      SELECT id, user_id, video_url
      FROM videos
      WHERE id = ${videoId}
    `;

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoResult.rows[0];

    // Check ownership
    if (video.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this video' });
    }

    // Delete from Vercel Blob
    try {
      await del(video.video_url);
      console.log('Deleted video from Blob:', video.video_url);
    } catch (blobError) {
      console.error('Error deleting from Blob (continuing anyway):', blobError);
      // Continue even if Blob deletion fails
    }

    // Delete from Postgres
    await sql`
      DELETE FROM videos
      WHERE id = ${videoId}
    `;

    console.log('Deleted video from Postgres:', videoId);

    return res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in delete-video handler:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
