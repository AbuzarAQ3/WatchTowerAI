import { isMockEnabled, mockDelay } from './config';

export interface AiSettings {
  globalSensitivity: number;
  model: string;
  detectPerson: boolean;
  detectVehicle: boolean;
  detectObject: boolean;
  detectCrowd: boolean;
  detectWeapon: boolean;
  minConfidence: number;
  processingFps: number;
  gpuAcceleration: boolean;
}

export interface CameraSettings {
  defaultFps: number;
  resolution: string;
  nightVision: boolean;
  motionDetection: boolean;
  retentionDays: number;
  compressionLevel: string;
  autoReconnect: boolean;
}

export interface AlertSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  soundAlerts: boolean;
  desktopNotifs: boolean;
  cooldownMinutes: number;
  escalationEnabled: boolean;
  escalationDelay: number;
}

export interface SecuritySettings {
  sessionTimeout: number;
  twoFactor: boolean;
  ipWhitelist: string;
  auditLog: boolean;
  apiKeyVisible: boolean;
  apiKey: string;
}

export interface ProfileSettings {
  name: string;
  role: string;
  email: string;
  department: string;
}

export interface AppSettings {
  ai: AiSettings;
  cameras: CameraSettings;
  alerts: AlertSettings;
  security: SecuritySettings;
  profile: ProfileSettings;
}

export interface SaveSettingsResult {
  success: boolean;
  isPendingBackend?: boolean;
  message?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  ai: {
    globalSensitivity: 78,
    model: 'yolov8x_surveillance',
    detectPerson: true,
    detectVehicle: true,
    detectObject: false,
    detectCrowd: true,
    detectWeapon: true,
    minConfidence: 0.65,
    processingFps: 15,
    gpuAcceleration: true,
  },
  cameras: {
    defaultFps: 30,
    resolution: '1080p',
    nightVision: true,
    motionDetection: true,
    retentionDays: 30,
    compressionLevel: 'balanced',
    autoReconnect: true,
  },
  alerts: {
    emailAlerts: true,
    smsAlerts: false,
    soundAlerts: true,
    desktopNotifs: true,
    cooldownMinutes: 5,
    escalationEnabled: true,
    escalationDelay: 15,
  },
  security: {
    sessionTimeout: 60,
    twoFactor: false,
    ipWhitelist: '192.168.1.0/24',
    auditLog: true,
    apiKeyVisible: false,
    apiKey: 'wtai-xK92m-89Pq4-••••••••',
  },
  profile: {
    name: 'Anuj',
    role: 'Frontend Lead',
    email: 'anuj@watchtowerai.local',
    department: 'Computer Science',
  },
};

const STORAGE_KEY = 'wt_mock_safe_settings';

/**
 * Persists safe settings to sessionStorage in mock mode.
 * SECURITY: Never persists secrets, API keys, or passwords to storage.
 */
function persistSafeSettings(settings: AppSettings): void {
  try {
    const safeData = {
      ai: settings.ai,
      cameras: settings.cameras,
      alerts: settings.alerts,
      security: {
        sessionTimeout: settings.security.sessionTimeout,
        twoFactor: settings.security.twoFactor,
        ipWhitelist: settings.security.ipWhitelist,
        auditLog: settings.security.auditLog,
        // apiKey and apiKeyVisible are strictly excluded
      },
      profile: {
        name: settings.profile.name,
        role: settings.profile.role,
        email: settings.profile.email,
        department: settings.profile.department,
      },
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
  } catch {
    // Gracefully handle storage quota or private browsing errors
  }
}

/**
 * Loads safe persisted settings from sessionStorage.
 */
function loadSafeSettings(): AppSettings {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ai: { ...DEFAULT_SETTINGS.ai, ...parsed.ai },
      cameras: { ...DEFAULT_SETTINGS.cameras, ...parsed.cameras },
      alerts: { ...DEFAULT_SETTINGS.alerts, ...parsed.alerts },
      security: {
        ...DEFAULT_SETTINGS.security,
        ...parsed.security,
        // Retain default in-memory apiKey
        apiKey: DEFAULT_SETTINGS.security.apiKey,
        apiKeyVisible: false,
      },
      profile: { ...DEFAULT_SETTINGS.profile, ...parsed.profile },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

let mockSettingsState: AppSettings = loadSafeSettings();

/**
 * Fetches application settings.
 */
export async function getSettings(): Promise<AppSettings> {
  if (isMockEnabled()) {
    await mockDelay();
    return JSON.parse(JSON.stringify(mockSettingsState));
  }

  // Real Mode: no backend endpoint is assumed.
  return JSON.parse(JSON.stringify(mockSettingsState));
}

/**
 * Saves application settings.
 * In Mock Mode: persists safe fields to memory & session storage.
 * In Real Mode: retains in-memory session only and flags endpoint pending.
 */
export async function saveSettings(settings: AppSettings): Promise<SaveSettingsResult> {
  if (isMockEnabled()) {
    await mockDelay();
    mockSettingsState = {
      ...settings,
      security: {
        ...settings.security,
        apiKey: settings.security.apiKey || DEFAULT_SETTINGS.security.apiKey,
      },
    };
    persistSafeSettings(mockSettingsState);
    return { success: true };
  }

  // Real Mode: no backend endpoint assumed
  mockSettingsState = { ...settings };
  return {
    success: true,
    isPendingBackend: true,
    message: 'Backend settings endpoint pending. Changes saved in local session only.',
  };
}

/**
 * Reset mock settings for test isolation.
 */
export function _resetMockSettings(): void {
  mockSettingsState = { ...DEFAULT_SETTINGS };
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}
