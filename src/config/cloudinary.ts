export const cloudinaryConfig = {
  cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
  defaultTransform: 'f_auto,q_auto',
} as const;
