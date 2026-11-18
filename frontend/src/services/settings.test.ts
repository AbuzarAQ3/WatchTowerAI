import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSettings,
  saveSettings,
  _resetMockSettings,
  DEFAULT_SETTINGS,
  type AppSettings,
} from './settings';
import * as config from './config';

describe('Settings Service', () => {
  beforeEach(() => {
    _resetMockSettings();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  describe('Mock Mode', () => {
    it('returns default settings initially', async () => {
      const settings = await getSettings();
      expect(settings.ai.globalSensitivity).toBe(78);
      expect(settings.ai.model).toBe('yolov8x_surveillance');
      expect(settings.profile.name).toBe('Anuj');
      expect(settings.security.apiKey).toContain('wtai-xK92m');
    });

    it('saves updated settings and persists safe fields', async () => {
      const updated: AppSettings = {
        ...DEFAULT_SETTINGS,
        ai: {
          ...DEFAULT_SETTINGS.ai,
          globalSensitivity: 90,
          detectObject: true,
        },
        profile: {
          ...DEFAULT_SETTINGS.profile,
          name: 'Anuj (Updated)',
        },
      };

      const result = await saveSettings(updated);
      expect(result.success).toBe(true);
      expect(result.isPendingBackend).toBeUndefined();

      const retrieved = await getSettings();
      expect(retrieved.ai.globalSensitivity).toBe(90);
      expect(retrieved.ai.detectObject).toBe(true);
      expect(retrieved.profile.name).toBe('Anuj (Updated)');
    });

    it('SECURITY: never writes apiKey or secrets to sessionStorage or localStorage', async () => {
      const testSettings: AppSettings = {
        ...DEFAULT_SETTINGS,
        security: {
          ...DEFAULT_SETTINGS.security,
          apiKey: 'super-secret-api-key-12345',
        },
      };

      await saveSettings(testSettings);

      const rawSession = sessionStorage.getItem('wt_mock_safe_settings');
      expect(rawSession).not.toBeNull();
      expect(rawSession).not.toContain('super-secret-api-key-12345');
      expect(rawSession).not.toContain('apiKey');

      // Verify localStorage is completely untouched
      expect(localStorage.getItem('wt_mock_safe_settings')).toBeNull();
    });
  });

  describe('Real Mode (VITE_USE_MOCK=false)', () => {
    it('returns isPendingBackend notice without assuming or invoking backend endpoints', async () => {
      vi.spyOn(config, 'isMockEnabled').mockReturnValue(false);

      const modified: AppSettings = {
        ...DEFAULT_SETTINGS,
        cameras: {
          ...DEFAULT_SETTINGS.cameras,
          resolution: '4k',
        },
      };

      const result = await saveSettings(modified);
      expect(result.success).toBe(true);
      expect(result.isPendingBackend).toBe(true);
      expect(result.message).toContain('Backend settings endpoint pending');
    });
  });
});
