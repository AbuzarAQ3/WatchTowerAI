import { create } from 'zustand';
import { authApi } from '../lib/api';
import { getToken, setToken, clearToken } from '../lib/token';

export interface User {
  id?: string | number;
  username?: string;
  email?: string;
  display_name?: string;
  [key: string]: any;
}

export interface ApiError {
  message: string;
  code?: string;
  param?: string;
}

export type AuthResult =
  | { kind: 'success'; user: User }
  | { kind: 'error'; errors: ApiError[] }
  | { kind: 'pending'; flows: string[] };

export type LoginResult = AuthResult;
export type SignupResult = AuthResult;

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  pendingFlows: string[];
  pendingEmail: string | null;

  // Actions
  login: (username: string, password: string) => Promise<LoginResult>;
  signup: (data: SignupData) => Promise<SignupResult>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setPendingFlows: (flows: string[]) => void;
  setPendingEmail: (email: string | null) => void;
  setUser: (user: User | null) => void;
}

// Initial status: if a token exists in storage, start in loading to prevent login screen flash
const initialToken = getToken();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: initialToken,
  status: initialToken ? 'loading' : 'unauthenticated',
  pendingFlows: [],
  pendingEmail: null,

  setPendingFlows: (flows: string[]) => set({ pendingFlows: flows }),
  setPendingEmail: (email: string | null) => set({ pendingEmail: email }),
  setUser: (user: User | null) => set({ user }),

  login: async (username: string, password: string): Promise<LoginResult> => {
    try {
      const response = await authApi.post('/auth/login', { username, password });

      const meta = response.data?.meta;
      const responseData = response.data?.data;
      const sessionToken = meta?.session_token;
      const user = responseData?.user || responseData;

      if (meta?.is_authenticated && sessionToken) {
        setToken(sessionToken);
        set({
          user,
          token: sessionToken,
          status: 'authenticated',
          pendingFlows: [],
          pendingEmail: null,
        });
        return { kind: 'success', user };
      }

      // Check if response contains pending flows despite 200
      const flows = (responseData?.flows || []).map((f: any) =>
        typeof f === 'string' ? f : f.id
      );
      if (flows.length > 0) {
        if (sessionToken) setToken(sessionToken);
        set({
          token: sessionToken || null,
          pendingFlows: flows,
          status: 'unauthenticated',
        });
        return { kind: 'pending', flows };
      }

      return {
        kind: 'error',
        errors: [{ message: 'Unexpected login response from authentication server.' }],
      };
    } catch (err: any) {
      const response = err.response;
      const status = response?.status;
      const data = response?.data;

      // Case: 401 with pending flows (e.g. verify_email)
      if (status === 401) {
        const flowsRaw = data?.data?.flows || data?.flows || [];
        const flows = flowsRaw.map((f: any) => (typeof f === 'string' ? f : f.id));
        const sessionToken = data?.meta?.session_token;

        if (sessionToken) {
          setToken(sessionToken);
        }

        set({
          token: sessionToken || null,
          pendingFlows: flows,
          status: 'unauthenticated',
        });

        // TODO: MFA flow after login
        return { kind: 'pending', flows };
      }

      // Case: 400 validation error
      if (status === 400 && data?.errors) {
        return { kind: 'error', errors: data.errors };
      }

      // Generic or network error
      const message =
        data?.message ||
        data?.detail ||
        (Array.isArray(data?.errors) && data.errors[0]?.message) ||
        err.message ||
        'Unable to connect to authentication server. Please check your connection.';

      return {
        kind: 'error',
        errors: [{ message }],
      };
    }
  },

  signup: async (data: SignupData): Promise<SignupResult> => {
    try {
      const response = await authApi.post('/auth/signup', {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      const meta = response.data?.meta;
      const responseData = response.data?.data;
      const sessionToken = meta?.session_token;
      const user = responseData?.user || responseData;

      if (meta?.is_authenticated && sessionToken) {
        setToken(sessionToken);
        set({
          user,
          token: sessionToken,
          status: 'authenticated',
          pendingFlows: [],
          pendingEmail: null,
        });
        return { kind: 'success', user };
      }

      const flows = (responseData?.flows || []).map((f: any) =>
        typeof f === 'string' ? f : f.id
      );
      if (flows.length > 0) {
        if (sessionToken) setToken(sessionToken);
        set({
          token: sessionToken || null,
          pendingFlows: flows,
          pendingEmail: data.email,
          status: 'unauthenticated',
        });
        return { kind: 'pending', flows };
      }

      return {
        kind: 'error',
        errors: [{ message: 'Unexpected signup response from authentication server.' }],
      };
    } catch (err: any) {
      const response = err.response;
      const status = response?.status;
      const respData = response?.data;

      // Case: 401 with pending flows (e.g. verify_email mandatory)
      if (status === 401) {
        const flowsRaw = respData?.data?.flows || respData?.flows || [];
        const flows = flowsRaw.map((f: any) => (typeof f === 'string' ? f : f.id));
        const sessionToken = respData?.meta?.session_token;

        if (sessionToken) {
          setToken(sessionToken);
        }

        set({
          token: sessionToken || null,
          pendingFlows: flows,
          pendingEmail: data.email,
          status: 'unauthenticated',
        });

        return { kind: 'pending', flows };
      }

      // Case: 400 validation error
      if (status === 400 && respData?.errors) {
        return { kind: 'error', errors: respData.errors };
      }

      const message =
        respData?.message ||
        respData?.detail ||
        (Array.isArray(respData?.errors) && respData.errors[0]?.message) ||
        err.message ||
        'Unable to complete registration. Please check your connection.';

      return {
        kind: 'error',
        errors: [{ message }],
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.delete('/auth/session');
    } catch (error) {
      // Regardless of server response (network error, expired session), clear locally
      console.warn('Backend logout failed or session already dead:', error);
    } finally {
      clearToken();
      set({
        user: null,
        token: null,
        status: 'unauthenticated',
        pendingFlows: [],
        pendingEmail: null,
      });
    }
  },

  restoreSession: async (): Promise<void> => {
    const token = getToken();
    if (!token) {
      set({ user: null, token: null, status: 'unauthenticated' });
      return;
    }

    set({ status: 'loading', token });

    try {
      const response = await authApi.get('/auth/session');
      const meta = response.data?.meta;
      const responseData = response.data?.data;

      if (meta?.is_authenticated) {
        const user = responseData?.user || responseData;
        set({
          user,
          status: 'authenticated',
          pendingFlows: [],
        });
      } else {
        clearToken();
        set({ user: null, token: null, status: 'unauthenticated' });
      }
    } catch (error) {
      clearToken();
      set({ user: null, token: null, status: 'unauthenticated' });
    }
  },
}));

/**
 * Convenient React hook wrapper around useAuthStore
 */
export function useAuth() {
  const store = useAuthStore();
  return {
    ...store,
    isAuthenticated: store.status === 'authenticated',
    isLoading: store.status === 'loading',
  };
}

// TODO: Social login buttons driven by /config
// TODO: MFA flow after login
// TODO: Password reset UI
// TODO: Refresh token rotation
