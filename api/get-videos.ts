import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './db';

/**
 * Vercel Serverless Function to get user's videos
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid userId parameter' });
    }

    // Get videos for the user
    const result = await sql`
      SELECT id, user_id, title, year, motion_style, aspect_ratio, video_url, created_at
      FROM videos
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return res.status(200).json({
      success: true,
      videos: result.rows,
    });
  } catch (error: any) {
    console.error('Error in get-videos handler:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
