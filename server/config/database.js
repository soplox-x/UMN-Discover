import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });
const { Pool } = pg;

const useMockAccount = process.env.ACCOUNT === 'false';

let pool;

if (!useMockAccount) {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
  });
} else {
  console.log('Database disabled due to mock account mode');
  pool = {
    query: async (...args) => {
      console.log('[MOCK DB] Ignored query:', args[0]);
      return { rows: [] };
    }
  };
}

export const initializeDatabase = async () => {
  if (useMockAccount) {
    console.log('Skipping database initialization in mock mode');
    return;
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        google_id VARCHAR(255) UNIQUE,
        display_name VARCHAR(255),
        bio TEXT,
        avatar_url VARCHAR(500),
        banner_url VARCHAR(500),
        following_count INTEGER DEFAULT 0,
        followers_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const passwordColumnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'password_hash'
      );
    `);

    if (passwordColumnExists.rows[0].exists) {
      await pool.query(`ALTER TABLE users DROP COLUMN password_hash`);
      console.log('Removed password_hash column');
    }

    const googleIdExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'google_id'
      );
    `);

    if (!googleIdExists.rows[0].exists) {
      await pool.query(`ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE`);
      console.log('Added google_id column');
    }

    const displayNameExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'display_name'
      );
    `);

    if (!displayNameExists.rows[0].exists) {
      await pool.query(`ALTER TABLE users ADD COLUMN display_name VARCHAR(255)`);
      console.log('Added display_name column');
    }

    const bioColumnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'bio'
      );
    `);

    if (!bioColumnExists.rows[0].exists) {
      await pool.query(`ALTER TABLE users ADD COLUMN bio TEXT`);
    }

    const avatarColumnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'avatar_url'
      );
    `);

    if (!avatarColumnExists.rows[0].exists) {
      await pool.query(`ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)`);
    }
    const bannerColumnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'banner_url'
      );
    `);
    if (!bannerColumnExists.rows[0].exists) {
      await pool.query(`ALTER TABLE users ADD COLUMN banner_url VARCHAR(500)`);
      console.log('Added banner_url column');
    }
    const socialColumns = [
      'youtube_url',
      'spotify_url', 
      'facebook_url',
      'discord_username',
      'twitter_url',
      'instagram_url',
      'linkedin_url',
      'github_url'
    ];

    for (const column of socialColumns) {
      const columnExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = $1
        );
      `, [column]);

      if (!columnExists.rows[0].exists) {
        const columnType = column === 'discord_username' ? 'VARCHAR(255)' : 'VARCHAR(500)';
        await pool.query(`ALTER TABLE users ADD COLUMN ${column} ${columnType}`);
        console.log(`Added ${column} column`);
      }
    }
    const imageColumns = ['avatar_url', 'banner_url'];
    for (const column of imageColumns) {
      const columnInfo = await pool.query(`
        SELECT data_type, character_maximum_length 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = $1
      `, [column]);
      
      if (columnInfo.rows.length > 0) {
        const { data_type, character_maximum_length } = columnInfo.rows[0];
        if (data_type === 'character varying' && character_maximum_length < 500) {
          await pool.query(`ALTER TABLE users ALTER COLUMN ${column} TYPE VARCHAR(500)`);
          console.log(`Updated ${column} column to VARCHAR(500)`);
        }
      }
    }

    const followingCountExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'following_count'
      );
    `);

    if (!followingCountExists.rows[0].exists) {
      await pool.query(`ALTER TABLE users ADD COLUMN following_count INTEGER DEFAULT 0`);
      console.log('Added following_count column');
    }
    const followersCountExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'followers_count'
      );
    `);

    if (!followersCountExists.rows[0].exists) {
      await pool.query(`ALTER TABLE users ADD COLUMN followers_count INTEGER DEFAULT 0`);
      console.log('Added followers_count column');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      )
    `);

    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'posts'
      );
    `);

    if (tableExists.rows[0].exists) {
      const groupIdExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'posts'
          AND column_name = 'group_id'
        );
      `);

      if (groupIdExists.rows[0].exists) {
        await pool.query(`ALTER TABLE posts DROP COLUMN group_id`);
      }

      const postTypeExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'posts'
          AND column_name = 'post_type'
        );
      `);

      if (postTypeExists.rows[0].exists) {
        await pool.query(`ALTER TABLE posts DROP COLUMN post_type`);
      }
    } else {
      await pool.query(`
        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          image_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`DROP TABLE IF EXISTS group_memberships CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS groups CASCADE`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('professor', 'course')),
        target_id VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        location VARCHAR(255),
        is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, review_type, target_id)
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_target 
      ON reviews(review_type, target_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_user 
      ON reviews(user_id)
    `);

    console.log('Database initialized successfully with Google OAuth support and profile enhancements');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export default pool;