export const IMAGE_UNAVAILABLE = '/image-unavailable.svg';

export const getIssueImage = (path) => {
  if (!path) {
    return IMAGE_UNAVAILABLE;
  }

  if (path.startsWith('D:\\Images\\')) {
    const relativePath = path.slice('D:\\Images\\'.length);
    return `/images/${relativePath.split(/[/\\]+/).map(encodeURIComponent).join('/')}`;
  }

  return path;
};
