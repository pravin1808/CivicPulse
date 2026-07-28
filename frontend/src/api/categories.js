export const DEPARTMENTS = {
  1: 'Public Works & Infrastructure',
  2: 'Sanitation & Waste Management',
  3: 'Traffic, Transit & Transportation',
  4: 'Utilities & Energy',
  5: 'Health, Safety & Environmental Protection',
  6: 'Public Spaces, Parks & Recreation'
};

export const CATEGORIES = {
  1: { name: 'Pothole Repairs & Road Damages', deptId: 1 },
  2: { name: 'Sidewalks & Walkways', deptId: 1 },
  3: { name: 'Drainage & Stormwater', deptId: 1 },
  4: { name: 'Garbage Accumulation', deptId: 2 },
  5: { name: 'Illegal Dumping', deptId: 2 },
  6: { name: 'Litter & Public Bins', deptId: 2 },
  7: { name: 'Streetlights', deptId: 3 },
  8: { name: 'Traffic Signals', deptId: 3 },
  9: { name: 'Signage & Lane Markings', deptId: 3 },
  10: { name: 'Water Supply', deptId: 4 },
  11: { name: 'Electricity & Power Failures', deptId: 4 },
  12: { name: 'Sewage Maintenance', deptId: 4 },
  13: { name: 'Noise Disturbances', deptId: 5 },
  14: { name: 'Stray Animal Control', deptId: 5 },
  15: { name: 'Air & Water Quality', deptId: 5 },
  16: { name: 'Damaged Public Infrastructure', deptId: 6 },
  17: { name: 'Tree Trimming & Landscaping', deptId: 6 },
  18: { name: 'Graffiti & Vandalism', deptId: 6 }
};

export const getDepartmentName = (id) => DEPARTMENTS[id] || `Department #${id}`;
export const getCategoryName = (id) => CATEGORIES[id]?.name || `Category #${id}`;
export const getCategoriesByDept = (deptId) => {
  return Object.entries(CATEGORIES)
    .filter(([_, cat]) => cat.deptId === parseInt(deptId))
    .map(([id, cat]) => ({ id: parseInt(id), name: cat.name }));
};
