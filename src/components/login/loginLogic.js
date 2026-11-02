// Validate login form values before attempting authentication.
export const validateLogin = ({ username = '', password = '', live = false, url = '' } = {}) => {
  if (!username.trim() || !password.trim()) {
    return 'Username and password are required';
  }

  if (live && !url.trim()) {
    return 'Please provide a Google Apps Script Web App URL for Live Mode';
  }

  return '';
};
