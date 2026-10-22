import axios, { type AxiosInstance } from 'axios';
import { getToken, clearToken } from './token';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const apiBase = rawBaseUrl !== undefined ? rawBaseUrl.replace(/\/+$/, '') : 'http://localhost:8000';

/**
 * Main application API instance (for DRF endpoints under /api)
 */
export const api: AxiosInstance = axios.create({
  baseURL: apiBase || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Headless allauth authentication API instance
 */
export const authApi: AxiosInstance = axios.create({
  baseURL: `${apiBase}/_allauth/app/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Attach request and response interceptors to an Axios instance
 */
function attachInterceptors(instance: AxiosInstance): void {
  // Request interceptor: attach X-Session-Token header if token is present
  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers['X-Session-Token'] = token;
    }
    return config;
  });

  // Response interceptor: handle 401 session expiry vs pending flows
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        const responseData = error.response.data;
        const flows = responseData?.data?.flows || responseData?.flows;

        // Check if there are any active pending flows (e.g. verify_email)
        const hasPendingFlow =
          Array.isArray(flows) &&
          flows.some(
            (flow: any) =>
              flow.is_pending === true ||
              (flow.id && flow.id !== 'login' && flow.id !== 'signup')
          );

        // If flows only contain login/signup (no pending flows), the session is dead
        if (!hasPendingFlow) {
          clearToken();
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }

      // Return rejected promise so calling code can handle validation (400) or other errors
      return Promise.reject(error);
    }
  );
}

attachInterceptors(api);
attachInterceptors(authApi);

export default api;
