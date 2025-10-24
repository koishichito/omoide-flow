import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@vercel/postgres';

/**
 * Vercel Serverless Function to get user's videos
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = createClient();
  await client.connect();

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid userId parameter' });
    }

    // Create table if it doesn't exist
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

    // Get videos for the user
    const result = await client.query(
      `SELECT id, user_id, title, year, motion_style, aspect_ratio, video_url, created_at
       FROM videos
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      videos: result.rows,
    });
  } catch (error: any) {
    console.error('Error in get-videos handler:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  } finally {
    await client.end();
  }
}
