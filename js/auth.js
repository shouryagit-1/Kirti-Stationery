/**
 * Kirti Stationary - Owner Authentication & Session Management
 * Provides private login protection for the shop owner.
 */

const AUTH_STORAGE_KEY = 'kirti_owner_session';
const CREDENTIALS_STORAGE_KEY = 'kirti_owner_credentials';

const DEFAULT_CREDENTIALS = {
  username: 'vaibhav',
  password: 'saksham'
};

/**
 * Get current owner credentials
 */
function getCredentials() {
  try {
    const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Automatically migrate old default dummy credentials
      if (parsed.username === 'owner' && parsed.password === 'kirti123') {
        localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
        return DEFAULT_CREDENTIALS;
      }
      return parsed;
    }
    return DEFAULT_CREDENTIALS;
  } catch (err) {
    return DEFAULT_CREDENTIALS;
  }
}

/**
 * Check if the current session is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true' || localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

/**
 * Log in the shop owner
 * @param {string} username 
 * @param {string} password 
 * @param {boolean} rememberMe 
 * @returns {Object} { success: boolean, error?: string }
 */
function login(username, password, rememberMe = false) {
  const creds = getCredentials();
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanUser || !cleanPass) {
    return { success: false, error: 'Please enter both username and password.' };
  }

  if (cleanUser === creds.username.toLowerCase() && cleanPass === creds.password) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    }
    return { success: true };
  } else {
    return { success: false, error: 'Incorrect username or password. Please try again.' };
  }
}

/**
 * Log out the shop owner
 */
function logout() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.href = 'login.html';
}

/**
 * Protect dashboard page: redirects to login.html if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html?redirect=dashboard.html';
  }
}

/**
 * Auto-redirect from login page if already authenticated
 */
function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = 'dashboard.html';
  }
}
