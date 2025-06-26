import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const JWT_SECRET = 'umn-discover-secret-key';

const imagesDir = path.join(process.cwd(), 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const authenticateTokenOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

router.get('/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.bio,
        u.avatar_url,
        u.created_at,
        COUNT(DISTINCT f1.id) as followers_count,
        COUNT(DISTINCT f2.id) as following_count,
        COUNT(DISTINCT p.id) as posts_count
      FROM users u
      LEFT JOIN user_follows f1 ON u.id = f1.following_id
      LEFT JOIN user_follows f2 ON u.id = f2.follower_id
      LEFT JOIN posts p ON u.id = p.user_id
      WHERE u.username ILIKE $1
      GROUP BY u.id, u.username, u.bio, u.avatar_url, u.created_at
      ORDER BY u.username
      LIMIT 20
    `, [`%${q}%`]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users'
    });
  }
});

router.get('/users/:identifier', authenticateTokenOptional, async (req, res) => {
  try {
    const { identifier } = req.params;
    const currentUserId = req.user?.userId;
    let result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.bio,
        u.avatar_url,
        u.created_at,
        COUNT(DISTINCT f1.id) as followers_count,
        COUNT(DISTINCT f2.id) as following_count,
        COUNT(DISTINCT p.id) as posts_count
      FROM users u
      LEFT JOIN user_follows f1 ON u.id = f1.following_id
      LEFT JOIN user_follows f2 ON u.id = f2.follower_id
      LEFT JOIN posts p ON u.id = p.user_id
      WHERE LOWER(u.username) = LOWER($1)
      GROUP BY u.id, u.username, u.email, u.bio, u.avatar_url, u.created_at
    `, [identifier]);

    if (result.rows.length === 0 && !isNaN(identifier)) {
      console.log('No username match found, trying by ID:', identifier);
      result = await pool.query(`
        SELECT 
          u.id,
          u.username,
          u.email,
          u.bio,
          u.avatar_url,
          u.created_at,
          COUNT(DISTINCT f1.id) as followers_count,
          COUNT(DISTINCT f2.id) as following_count,
          COUNT(DISTINCT p.id) as posts_count
        FROM users u
        LEFT JOIN user_follows f1 ON u.id = f1.following_id
        LEFT JOIN user_follows f2 ON u.id = f2.follower_id
        LEFT JOIN posts p ON u.id = p.user_id
        WHERE u.id = $1
        GROUP BY u.id, u.username, u.email, u.bio, u.avatar_url, u.created_at
      `, [parseInt(identifier)]);
    }

    console.log('Query result rows:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Found user:', result.rows[0].username);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];
    
    let isFollowing = false;
    if (currentUserId && currentUserId != user.id) {
      const followCheck = await pool.query(
        'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [currentUserId, user.id]
      );
      isFollowing = followCheck.rows.length > 0;
    }

    res.json({
      success: true,
      data: {
        ...user,
        is_following: isFollowing,
        is_own_profile: currentUserId == user.id
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

router.get('/users/:identifier/posts', async (req, res) => {
  try {
    const { identifier } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    let userResult = await pool.query(`SELECT id FROM users WHERE LOWER(username) = LOWER($1)`, [identifier]);
    
    if (userResult.rows.length === 0 && !isNaN(identifier)) {
      userResult = await pool.query(`SELECT id FROM users WHERE id = $1`, [parseInt(identifier)]);
    }
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userId = userResult.rows[0].id;
    console.log('Found user ID:', userId);
    
    const result = await pool.query(`
      SELECT 
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.username,
        u.id as user_id,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.user_id = $1
      GROUP BY p.id, u.username, u.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    res.json({
      success: true,
      data: {
        posts: result.rows,
        pagination: {
          page,
          limit,
          hasMore: result.rows.length === limit
        }
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user posts'
    });
  }
});

router.get('/users/:identifier/followers', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    console.log('Fetching followers for user:', identifier);
    let result = await pool.query(`
      SELECT 
        follower.id,
        follower.username,
        follower.bio,
        follower.avatar_url,
        uf.created_at as followed_at
      FROM user_follows uf
      JOIN users u ON uf.following_id = u.id
      JOIN users follower ON uf.follower_id = follower.id
      WHERE LOWER(u.username) = LOWER($1)
      ORDER BY uf.created_at DESC
    `, [identifier]);

    if (result.rows.length === 0 && !isNaN(identifier)) {
      result = await pool.query(`
        SELECT 
          follower.id,
          follower.username,
          follower.bio,
          follower.avatar_url,
          uf.created_at as followed_at
        FROM user_follows uf
        JOIN users u ON uf.following_id = u.id
        JOIN users follower ON uf.follower_id = follower.id
        WHERE u.id = $1
        ORDER BY uf.created_at DESC
      `, [parseInt(identifier)]);
    }

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch followers'
    });
  }
});

router.get('/users/:identifier/following', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let result = await pool.query(`
      SELECT 
        following.id,
        following.username,
        following.bio,
        following.avatar_url,
        uf.created_at as followed_at
      FROM user_follows uf
      JOIN users u ON uf.follower_id = u.id
      JOIN users following ON uf.following_id = following.id
      WHERE LOWER(u.username) = LOWER($1)
      ORDER BY uf.created_at DESC
    `, [identifier]);

    if (result.rows.length === 0 && !isNaN(identifier)) {
      result = await pool.query(`
        SELECT 
          following.id,
          following.username,
          following.bio,
          following.avatar_url,
          uf.created_at as followed_at
        FROM user_follows uf
        JOIN users u ON uf.follower_id = u.id
        JOIN users following ON uf.following_id = following.id
        WHERE u.id = $1
        ORDER BY uf.created_at DESC
      `, [parseInt(identifier)]);
    }

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch following'
    });
  }
});

router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.username,
        u.id as user_id,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count,
        EXISTS(SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = p.id) as user_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE (
        p.user_id IN (
          SELECT following_id FROM user_follows WHERE follower_id = $1
        )
        OR p.user_id = $1
      )
      GROUP BY p.id, u.username, u.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    res.json({
      success: true,
      data: {
        posts: result.rows,
        pagination: {
          page,
          limit,
          hasMore: result.rows.length === limit
        }
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feed'
    });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const result = await pool.query(`
      SELECT 
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.username,
        u.id as user_id,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY p.id, u.username, u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      success: true,
      data: {
        posts: result.rows,
        pagination: {
          page,
          limit,
          hasMore: result.rows.length === limit
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts'
    });
  }
});

router.post('/posts', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Post content is required'
      });
    }

    if (content.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Post content must be less than 200 characters'
      });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/images/${req.file.filename}`;
    }

    const result = await pool.query(`
      INSERT INTO posts (user_id, content, image_url)
      VALUES ($1, $2, $3)
      RETURNING id, content, image_url, created_at
    `, [userId, content.trim(), imageUrl]);

    const post = result.rows[0];
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);

    res.status(201).json({
      success: true,
      data: {
        ...post,
        username: userResult.rows[0].username,
        user_id: userId,
        likes_count: 0,
        comments_count: 0,
        user_liked: false
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
});

router.post('/users/:userId/follow', authenticateToken, async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const followerId = req.user.userId;

    if (followerId == targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot follow yourself'
      });
    }

    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [targetUserId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const followCheck = await pool.query(
      'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, targetUserId]
    );

    if (followCheck.rows.length > 0) {
      await pool.query(
        'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, targetUserId]
      );
      
      res.json({
        success: true,
        following: false,
        message: 'Unfollowed user'
      });
    } else {
      await pool.query(
        'INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2)',
        [followerId, targetUserId]
      );
      res.json({
        success: true,
        following: true,
        message: 'Following user'
      });
    }
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to follow/unfollow user'
    });
  }
});

router.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const existingLike = await pool.query(
      'SELECT id FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (existingLike.rows.length > 0) {
      await pool.query(
        'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      );
    } else {
      await pool.query(
        'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)',
        [userId, postId]
      );
    }

    const likeCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM post_likes WHERE post_id = $1',
      [postId]
    );

    res.json({
      success: true,
      data: {
        liked: existingLike.rows.length === 0,
        likes_count: parseInt(likeCountResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like/unlike post'
    });
  }
});

router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        u.username,
        u.id as user_id
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [postId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments'
    });
  }
});

router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Comment must be less than 500 characters'
      });
    }

    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const result = await pool.query(`
      INSERT INTO comments (user_id, post_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at
    `, [userId, postId, content.trim()]);

    const comment = result.rows[0];
    const userResult = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [userId]
    );

    res.status(201).json({
      success: true,
      data: {
        ...comment,
        username: userResult.rows[0].username,
        user_id: userId
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create comment'
    });
  }
});

export default router;