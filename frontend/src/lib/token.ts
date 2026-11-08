// TODO: migrate to httpOnly cookie for production

const TOKEN_KEY = 'watchtower.session_token';

/**
 * Retrieve session token from localStorage.
 * Wrapped in try/catch to safely handle private browsing / storage restrictions.
 */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to read session token from localStorage:', error);
    return null;
  }
}

/**
 * Persist session token to localStorage.
 */
export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to write session token to localStorage:', error);
  }
}

/**
 * Remove session token from localStorage.
 */
export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove session token from localStorage:', error);
  }
}
