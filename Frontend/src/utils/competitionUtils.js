/**
 * Competition Module Utility Functions
 * Pure helper functions for formatting, badge generation, URL processing, and clipboard copying.
 */

/**
 * Derives normalized status badge object for a competition
 * @param {Object} item - Competition object
 * @returns {{ label: string, className: string }}
 */
export const getCompetitionStatusBadge = (item) => {
  if (!item) return { label: 'Open', className: 'status-open' };
  
  const status = item.status || '';
  const days = item.daysLeft || item.deadline || '';

  if (
    status === 'Closing Soon' || 
    days.toLowerCase().includes('closing') || 
    days.toLowerCase().includes('expiring') ||
    days.toLowerCase().includes('3 days') || 
    days.toLowerCase().includes('5 days')
  ) {
    return { label: 'Closing Soon', className: 'status-closing' };
  }

  if (status === 'Closed' || status === 'Registration Closed' || days.toLowerCase().includes('closed')) {
    return { label: 'Closed', className: 'status-closed' };
  }

  return { label: 'Open', className: 'status-open' };
};

/**
 * Format registration count to user-friendly string
 * @param {number|string} count 
 * @returns {string}
 */
export const formatRegisteredCount = (count) => {
  if (typeof count === 'number') {
    return `${count.toLocaleString()} Registered`;
  }
  return count || '1,200 Registered';
};

/**
 * Format currency amount
 * @param {number} amount 
 * @param {string} currencySymbol 
 * @returns {string}
 */
export const formatPrizeAmount = (amount, currencySymbol = '₹') => {
  if (!amount || isNaN(amount)) return 'Prize Pool';
  return `${currencySymbol}${Number(amount).toLocaleString('en-IN')}`;
};

/**
 * Safe clipboard copy with fallback
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
};

/**
 * Sanitize external URL for safe browser opening
 * @param {string} url 
 * @returns {string}
 */
export const sanitizeExternalUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};
