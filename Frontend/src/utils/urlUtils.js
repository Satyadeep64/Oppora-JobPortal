/**
 * URL validation helper to verify valid HTTP/HTTPS URLs
 * @param {string} string - URL string to validate
 * @returns {boolean} True if valid HTTP/HTTPS URL
 */
export const isValidHttpUrl = (string) => {
  if (!string || typeof string !== 'string' || string.trim() === '') return false;
  try {
    const url = new URL(string.startsWith('http') ? string : `https://${string}`);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};
