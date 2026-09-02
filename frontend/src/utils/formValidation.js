export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,20}$/;

export const addFieldError = (errors, field, message) => {
  errors[field] = [...(errors[field] || []), message];
};

export const clearFieldError = (setFieldErrors, field) => {
  setFieldErrors((currentErrors) => {
    if (!currentErrors[field]) return currentErrors;
    const nextErrors = { ...currentErrors };
    delete nextErrors[field];
    return nextErrors;
  });
};

export const getBackendFieldErrors = (error) => {
  const fieldErrors = error?.response?.data?.fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== 'object' || Array.isArray(fieldErrors)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(fieldErrors)
      .filter(([, messages]) => Array.isArray(messages) && messages.length > 0)
      .map(([field, messages]) => [field, messages.filter((message) => typeof message === 'string')])
  );
};

export const validateIssue = ({ title, description, deptId, categoryId, latitude, longitude, imageFile, imageRequired = true }) => {
  const errors = {};
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (!trimmedTitle) addFieldError(errors, 'title', 'Title is required.');
  else if (trimmedTitle.length < 5 || trimmedTitle.length > 100) addFieldError(errors, 'title', 'Title must be between 5 and 100 characters.');

  if (!deptId) addFieldError(errors, 'deptId', 'Select a department.');
  if (!categoryId) addFieldError(errors, 'categoryId', 'Select a category.');

  if (!trimmedDescription) addFieldError(errors, 'description', 'Description is required.');
  else if (trimmedDescription.length < 10 || trimmedDescription.length > 1000) addFieldError(errors, 'description', 'Description must be between 10 and 1000 characters.');

  if (latitude === '' || Number.isNaN(parsedLatitude)) addFieldError(errors, 'latitude', 'Latitude is required.');
  else if (parsedLatitude < -90 || parsedLatitude > 90) addFieldError(errors, 'latitude', 'Latitude must be between -90 and 90.');

  if (longitude === '' || Number.isNaN(parsedLongitude)) addFieldError(errors, 'longitude', 'Longitude is required.');
  else if (parsedLongitude < -180 || parsedLongitude > 180) addFieldError(errors, 'longitude', 'Longitude must be between -180 and 180.');

  if (imageRequired && !imageFile) addFieldError(errors, 'image', 'Upload an image of the issue.');

  return errors;
};

export const validateWorker = ({ name, email, phoneNumber, address, password, deptId, requireEmailAndPassword }) => {
  const errors = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPhoneNumber = phoneNumber.trim();
  const trimmedAddress = address.trim();

  if (!trimmedName) addFieldError(errors, 'name', 'Name is required.');
  else if (trimmedName.length < 2 || trimmedName.length > 100) addFieldError(errors, 'name', 'Name must be between 2 and 100 characters.');

  if (requireEmailAndPassword) {
    if (!trimmedEmail) addFieldError(errors, 'email', 'Email is required.');
    else if (!emailPattern.test(trimmedEmail)) addFieldError(errors, 'email', 'Email must be a valid email address.');
  }

  if (!trimmedPhoneNumber) addFieldError(errors, 'phoneNumber', 'Phone number is required.');
  else if (!/^[6-9]\d{9}$/.test(trimmedPhoneNumber)) addFieldError(errors, 'phoneNumber', 'Phone number must be a valid 10-digit Indian mobile number.');

  if (!deptId) addFieldError(errors, 'dept_id', 'Select a department.');

  if (!trimmedAddress) addFieldError(errors, 'address', 'Address is required.');
  else if (trimmedAddress.length > 255) addFieldError(errors, 'address', 'Address must not exceed 255 characters.');

  if (requireEmailAndPassword) {
    if (!password) addFieldError(errors, 'password', 'Password is required.');
    else if (!passwordPattern.test(password)) addFieldError(errors, 'password', 'Password must be 8-20 characters and include uppercase, lowercase, a digit, and a special character.');
  }

  return errors;
};
