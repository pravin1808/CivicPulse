export const IMAGE_UNAVAILABLE = '/image-unavailable.svg';

/**
 * Universal, storage-agnostic image resolver.
 * Renders any valid web URL (Cloudinary, S3, external CDN, etc.),
 * relative server path, or fallback placeholder.
 */
export const getIssueImage = (path) => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return IMAGE_UNAVAILABLE;
  }

  const cleanPath = path.trim();

  // Full web URL (Cloudinary, AWS S3, external CDN, etc.)
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // Relative server path
  if (cleanPath.startsWith('/')) {
    return cleanPath;
  }

  // Legacy local Windows path backwards-compatibility (for previously seeded/local rows)
  if (cleanPath.startsWith('D:\\Images\\')) {
    const relativePath = cleanPath.slice('D:\\Images\\'.length);
    return `/images/${relativePath.split(/[/\\]+/).map(encodeURIComponent).join('/')}`;
  }

  return cleanPath;
};
