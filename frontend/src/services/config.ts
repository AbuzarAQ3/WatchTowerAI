/**
 * Service configuration helper to switch between Mock and Real API backends
 */

export const isMockEnabled = (): boolean => {
  const flag = import.meta.env.VITE_USE_MOCK;
  if (flag !== undefined && flag !== '') {
    return flag === 'true' || flag === '1';
  }
  // Default to mock mode during local frontend development
  return true;
};

/**
 * Injects a realistic 300ms–500ms async delay when in mock mode
 */
export const mockDelay = async (ms = 350): Promise<void> => {
  if (isMockEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
};

/**
 * Flag controlling whether user is automatically logged in after registration.
 * Set to false so the user must explicitly log in after creating an account.
 */
export const AUTO_LOGIN_AFTER_SIGNUP = false;

