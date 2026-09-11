export const IMAGE_UNAVAILABLE = '/image-unavailable.svg';

const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const getIssueImage = (path) => {
  if (!path) {
    return IMAGE_UNAVAILABLE;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // The database stores the server-side filesystem path. Extract the portion
  // below its images directory so this works for both local Windows paths and
  // Render's /var/data/images persistent disk.
  const normalizedPath = path.replace(/\\/g, '/');
  const imagesMarker = '/images/';
  const markerIndex = normalizedPath.toLowerCase().indexOf(imagesMarker);
  if (markerIndex !== -1) {
    const relativePath = normalizedPath.slice(markerIndex + imagesMarker.length);
    const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
    return `${apiBaseUrl}/images/${encodedPath}`;
  }

  return path;
};
