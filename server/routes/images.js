import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'umn-discover-secret-key';
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

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

router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    if (!type || !['avatar', 'banner'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "avatar" or "banner"'
      });
    }

    const currentUser = await pool.query(
      `SELECT ${type}_url FROM users WHERE id = $1`,
      [userId]
    );

    let oldPublicId = null;
    if (currentUser.rows[0] && currentUser.rows[0][`${type}_url`]) {
      oldPublicId = extractPublicId(currentUser.rows[0][`${type}_url`]);
    }

    const transformations = type === 'avatar' 
      ? {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto:good',
          fetch_format: 'auto'
        }
      : {
          width: 1200,
          height: 400,
          crop: 'fill',
          quality: 'auto:good',
          fetch_format: 'auto'
        };

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `umn-discover/${type}s`,
      transformation: transformations,
      public_id_prefix: `${userId}_${type}`
    });

    const updateQuery = `UPDATE users SET ${type}_url = $1 WHERE id = $2 RETURNING ${type}_url`;
    const updateResult = await pool.query(updateQuery, [result.secure_url, userId]);

    if (oldPublicId) {
      try {
        await deleteFromCloudinary(oldPublicId);
      } catch (deleteError) {
        console.warn('Failed to delete old image from Cloudinary:', deleteError);
      }
    }

    res.json({
      success: true,
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        type: type
      },
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

router.get('/user/:identifier/images', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let result = await pool.query(
      'SELECT id, username, avatar_url, banner_url FROM users WHERE LOWER(username) = LOWER($1)',
      [identifier]
    );

    if (result.rows.length === 0 && !isNaN(identifier)) {
      result = await pool.query(
        'SELECT id, username, avatar_url, banner_url FROM users WHERE id = $1',
        [parseInt(identifier)]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        userId: user.id,
        username: user.username,
        avatarUrl: user.avatar_url,
        bannerUrl: user.banner_url
      }
    });

  } catch (error) {
    console.error('Get user images error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user images'
    });
  }
});

router.delete('/user/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.userId;

    if (!['avatar', 'banner'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "avatar" or "banner"'
      });
    }

    const currentUser = await pool.query(
      `SELECT ${type}_url FROM users WHERE id = $1`,
      [userId]
    );

    if (!currentUser.rows[0] || !currentUser.rows[0][`${type}_url`]) {
      return res.status(404).json({
        success: false,
        error: `No ${type} image found`
      });
    }

    const imageUrl = currentUser.rows[0][`${type}_url`];
    const publicId = extractPublicId(imageUrl);

    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    const updateQuery = `UPDATE users SET ${type}_url = NULL WHERE id = $1`;
    await pool.query(updateQuery, [userId]);

    res.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

router.put('/user/:type', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    if (!['avatar', 'banner'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "avatar" or "banner"'
      });
    }

    const currentUser = await pool.query(
      `SELECT ${type}_url FROM users WHERE id = $1`,
      [userId]
    );

    let oldPublicId = null;
    if (currentUser.rows[0] && currentUser.rows[0][`${type}_url`]) {
      oldPublicId = extractPublicId(currentUser.rows[0][`${type}_url`]);
    }

    const transformations = type === 'avatar' 
      ? {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto:good',
          fetch_format: 'auto'
        }
      : {
          width: 1200,
          height: 400,
          crop: 'fill',
          quality: 'auto:good',
          fetch_format: 'auto'
        };

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `umn-discover/${type}s`,
      transformation: transformations,
      public_id_prefix: `${userId}_${type}`
    });

    const updateQuery = `UPDATE users SET ${type}_url = $1 WHERE id = $2 RETURNING ${type}_url`;
    const updateResult = await pool.query(updateQuery, [result.secure_url, userId]);

    if (oldPublicId) {
      try {
        await deleteFromCloudinary(oldPublicId);
      } catch (deleteError) {
        console.warn('Failed to delete old image from Cloudinary:', deleteError);
      }
    }

    res.json({
      success: true,
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        type: type
      },
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`
    });

  } catch (error) {
    console.error('Replace image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to replace image'
    });
  }
});

export default router;