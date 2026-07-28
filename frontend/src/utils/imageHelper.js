// Fallback high-quality images based on category ID for a beautiful visual experience
const CATEGORY_FALLBACKS = {
  1: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80', // Pothole
  2: 'https://images.unsplash.com/photo-1621259182978-f0931267bb40?auto=format&fit=crop&w=600&q=80', // Sidewalk
  3: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80', // Drainage
  4: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80', // Garbage Accumulation
  5: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80', // Illegal Dumping
  6: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', // Litter
  7: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&w=600&q=80', // Streetlights
  8: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80', // Traffic signals
  9: 'https://images.unsplash.com/photo-1572945281861-68b293f0f115?auto=format&fit=crop&w=600&q=80', // Signage
  10: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=600&q=80', // Water supply
  11: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80', // Electricity
  12: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80', // Sewage
  13: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=600&q=80', // Noise
  14: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80', // Stray Animals
  15: 'https://images.unsplash.com/photo-1532996127610-533169e2457b?auto=format&fit=crop&w=600&q=80', // Air Quality
  16: 'https://images.unsplash.com/photo-1590483736622-39da8af7ff8f?auto=format&fit=crop&w=600&q=80', // Damaged Infrastructure
  17: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', // Tree Trimming
  18: 'https://images.unsplash.com/photo-1597075095400-3aa01e21b712?auto=format&fit=crop&w=600&q=80'  // Graffiti
};

const RESOLVED_FALLBACKS = {
  1: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=600&q=80', // Paved road
  4: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=600&q=80', // Clean street
  7: 'https://images.unsplash.com/photo-1513829096996-51268efd3793?auto=format&fit=crop&w=600&q=80', // Bright streetlight
  10: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80'  // Flowing clean water
};

export const getIssueImage = (path, categoryId, isAfter = false) => {
  if (!path) {
    return isAfter 
      ? (RESOLVED_FALLBACKS[categoryId] || 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=600&q=80')
      : (CATEGORY_FALLBACKS[categoryId] || 'https://images.unsplash.com/photo-1590483736622-39da8af7ff8f?auto=format&fit=crop&w=600&q=80');
  }

  // If path is a local Windows file system path, the browser cannot display it directly.
  // We check if it looks like an absolute path and return a fallback, but we also try to load the URL just in case
  if (path.includes('\\') || path.startsWith('D:')) {
    return isAfter 
      ? (RESOLVED_FALLBACKS[categoryId] || 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=600&q=80')
      : (CATEGORY_FALLBACKS[categoryId] || 'https://images.unsplash.com/photo-1590483736622-39da8af7ff8f?auto=format&fit=crop&w=600&q=80');
  }

  return path;
};
