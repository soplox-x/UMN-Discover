import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'umn-app',
  host: 'localhost',
  database: 'umn_discover',
  password: 'umn1234',
  port: 5432,
});

export const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        bio TEXT,
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
    console.log('Removed group-related tables');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export default pool;