export function extractErrorMessage(err, fallback = 'An unexpected error occurred.') {
  if (err?.response?.data) {
    const data = err.response.data;
    // Backend ErrorResponseDto always has a `message` field
    if (typeof data === 'object' && data.message) {
      return data.message;
    }
    // Legacy plain-string responses
    if (typeof data === 'string' && data.trim().length > 0) {
      return data;
    }
  }
  return fallback;
}
