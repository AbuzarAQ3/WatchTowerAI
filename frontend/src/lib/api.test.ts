import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, authApi } from './api';
import * as tokenLib from './token';

describe('Axios API Instances and Interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('exposes api and authApi with correct base URLs', () => {
    expect(authApi.defaults.baseURL).toContain('/_allauth/app/v1');
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
    expect(authApi.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('injects X-Session-Token in request interceptor when token exists', async () => {
    tokenLib.setToken('auth_token_xyz');

    // Run request interceptor
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = { headers: {} as Record<string, string> };
    const modifiedConfig = await requestInterceptor(config);

    expect(modifiedConfig.headers['X-Session-Token']).toBe('auth_token_xyz');
  });

  it('does NOT inject X-Session-Token when no token exists in storage', async () => {
    tokenLib.clearToken();

    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = { headers: {} as Record<string, string> };
    const modifiedConfig = await requestInterceptor(config);

    expect(modifiedConfig.headers['X-Session-Token']).toBeUndefined();
  });

  it('clears token and redirects on 401 when only login/signup flows exist (session dead)', async () => {
    tokenLib.setToken('expired_token_123');
    const clearSpy = vi.spyOn(tokenLib, 'clearToken');

    const responseInterceptorErr = (api.interceptors.response as any).handlers[0].rejected;

    const error401 = {
      response: {
        status: 401,
        data: {
          status: 401,
          data: { flows: [{ id: 'login' }, { id: 'signup' }] },
        },
      },
    };

    await expect(responseInterceptorErr(error401)).rejects.toEqual(error401);
    expect(clearSpy).toHaveBeenCalled();
  });

  it('does NOT clear token or auto-redirect on 401 when pending flow exists', async () => {
    tokenLib.setToken('flow_token_123');
    const clearSpy = vi.spyOn(tokenLib, 'clearToken');

    const responseInterceptorErr = (api.interceptors.response as any).handlers[0].rejected;

    const error401Pending = {
      response: {
        status: 401,
        data: {
          status: 401,
          data: {
            flows: [
              { id: 'login' },
              { id: 'signup' },
              { id: 'verify_email', is_pending: true },
            ],
          },
        },
      },
    };

    await expect(responseInterceptorErr(error401Pending)).rejects.toEqual(error401Pending);
    expect(clearSpy).not.toHaveBeenCalled();
  });
});
