import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { extractRelativePath, fetchAllPages } from './pagination';
import { getCameras } from './cameras';
import { getRecentIncidents } from './incidents';
import { server } from '../test/server';
import { http, HttpResponse } from 'msw';
import * as tokenLib from '../lib/token';

describe('Services Pagination & Session Token Attachment', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    vi.stubEnv('VITE_USE_MOCK', 'false');
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    server.resetHandlers();
    tokenLib.clearToken();
  });

  describe('extractRelativePath', () => {
    it('extracts pathname + search from an absolute URL', () => {
      const absUrl = 'http://localhost:8000/api/cameras/?page=2&ordering=name';
      expect(extractRelativePath(absUrl)).toBe('/api/cameras/?page=2&ordering=name');
    });

    it('returns a relative path as-is', () => {
      const relPath = '/api/incidents/?page=3';
      expect(extractRelativePath(relPath)).toBe('/api/incidents/?page=3');
    });
  });

  describe('fetchAllPages with MSW', () => {
    it('follows absolute next URL across multiple pages and sends X-Session-Token', async () => {
      tokenLib.setToken('assert_pagination_token_123');
      const receivedTokens: (string | null)[] = [];

      server.use(
        http.get('*/api/cameras*', ({ request }) => {
          receivedTokens.push(request.headers.get('X-Session-Token'));
          const url = new URL(request.url);
          const page = url.searchParams.get('page');

          if (page === '2') {
            return HttpResponse.json({
              count: 3,
              next: null,
              previous: 'http://localhost:8000/api/cameras/?page_size=100',
              results: [
                { id: 3, name: 'Warehouse Cam', zone: 'Storage', status: 'live', fps: 25 },
              ],
            });
          }

          return HttpResponse.json({
            count: 3,
            next: 'http://localhost:8000/api/cameras/?page=2',
            previous: null,
            results: [
              { id: 1, name: 'Front Gate Cam', zone: 'Entry', status: 'live', fps: 30 },
              { id: 2, name: 'Lobby Cam', zone: 'Lobby', status: 'live', fps: 30 },
            ],
          });
        })
      );

      const cameras = await getCameras();
      expect(cameras).toHaveLength(3);
      expect(cameras[0].name).toBe('Front Gate Cam');
      expect(cameras[1].name).toBe('Lobby Cam');
      expect(cameras[2].name).toBe('Warehouse Cam');

      // Assert X-Session-Token was attached to every request by interceptor
      expect(receivedTokens).toHaveLength(2);
      expect(receivedTokens[0]).toBe('assert_pagination_token_123');
      expect(receivedTokens[1]).toBe('assert_pagination_token_123');
    });

    it('enforces a maximum 20-page cap against infinite next-page loops', async () => {
      let callCount = 0;
      server.use(
        http.get('*/api/cameras*', () => {
          callCount++;
          return HttpResponse.json({
            count: 9999,
            // Always return a next page link
            next: `http://localhost:8000/api/cameras/?page=${callCount + 1}`,
            results: [{ id: callCount, name: `Cam ${callCount}`, zone: 'Test', status: 'live', fps: 30 }],
          });
        })
      );

      const items = await fetchAllPages<{ id: number }>('/api/cameras/?page_size=1', 20);
      expect(callCount).toBe(20);
      expect(items).toHaveLength(20);
    });

    it('getRecentIncidents does not paginate and fetches only a single page', async () => {
      let callCount = 0;
      server.use(
        http.get('*/api/incidents*', () => {
          callCount++;
          return HttpResponse.json({
            count: 10,
            next: 'http://localhost:8000/api/incidents/?page=2',
            results: [
              {
                id: 'INC-1',
                camera: 1,
                camera_name: 'Cam 1',
                type: 'Motion',
                severity: 'low',
                status: 'open',
                confidence: 0.9,
                detected_at: '2026-10-28',
              },
            ],
          });
        })
      );

      const recents = await getRecentIncidents(1);
      expect(callCount).toBe(1);
      expect(recents).toHaveLength(1);
      expect(recents[0].id).toBe('INC-1');
    });
  });
});
