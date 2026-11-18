import { useAuthStore } from '../store/auth';

/**
 * Convenient React hook wrapper around useAuthStore.
 * Exposes all auth state and actions along with convenient boolean flags:
 * - isAuthenticated: boolean
 * - isLoading: boolean
 */
export function useAuth() {
  const store = useAuthStore();
  return {
    ...store,
    isAuthenticated: store.status === 'authenticated',
    isLoading: store.status === 'loading',
  };
}

export { useAuthStore } from '../store/auth';
export default useAuth;
