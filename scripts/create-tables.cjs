const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function createTables() {
  // POSTGRES_URL_NON_POOLING を使用（直接接続用）
  const connectionString = process.env.POSTGRES_URL_NON_POOLING
    || process.env.POSTGRES_URL
    || process.env.DATABASE_URL;

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    console.log('\nCreating videos table...');

    // Create videos table
    await client.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        year INTEGER,
        motion_style VARCHAR(50) NOT NULL,
        aspect_ratio VARCHAR(10) NOT NULL,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Videos table created successfully');

    // Create index on user_id
    console.log('\nCreating index on user_id...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_id ON videos(user_id)');
    console.log('✓ Index on user_id created successfully');

    // Create index on created_at
    console.log('\nCreating index on created_at...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_created_at ON videos(created_at)');
    console.log('✓ Index on created_at created successfully');

    console.log('\n✅ All tables and indexes created successfully!');

    // Verify table creation
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'videos'
    `);

    if (result.rows.length > 0) {
      console.log('\n📋 Table verified: videos table exists');

      // Get column information
      const columns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'videos'
        ORDER BY ordinal_position
      `);

      console.log('\n📊 Table structure:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✓ Database connection closed');
  }
}

createTables();
