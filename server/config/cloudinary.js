import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (buffer, options = {}) => {
  try {
    const {
      folder = 'umn-discover',
      transformation = {},
      resource_type = 'image',
      public_id_prefix = ''
    } = options;
    const defaultTransformation = {
      quality: 'auto:good',
      fetch_format: 'auto',
      ...transformation
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: defaultTransformation,
          resource_type,
          public_id: public_id_prefix ? `${public_id_prefix}_${Date.now()}` : undefined,
          overwrite: true,
          invalidate: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  if (!publicId) return null;
  
  const defaultTransformations = {
    quality: 'auto:good',
    fetch_format: 'auto',
    ...transformations
  };

  return cloudinary.url(publicId, {
    transformation: defaultTransformations
  });
};

export const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;
  
  try {
    const urlParts = cloudinaryUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    let publicIdParts = urlParts.slice(uploadIndex + 1);
    if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }
    const publicIdWithExt = publicIdParts.join('/');
    return publicIdWithExt.replace(/\.[^/.]+$/, '');
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

export default cloudinary;