export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 

export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; 

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;