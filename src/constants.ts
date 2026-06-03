// ============================================================
// Timer intervals
// ============================================================
export const TOKEN_REFRESH_INTERVAL_MS = 60000;
export const DEVICE_STATE_REFRESH_INTERVAL_MS = 2500;

// ============================================================
// HTTP
// ============================================================
export const HTTP_OK_STATUS = 200;
export const HTTP_CONNECT_TIMEOUT_MS = 1000;
export const HTTP_RESPONSE_TIMEOUT_MS = 2000;

// ============================================================
// Polling
// ============================================================
export const STATUS_POLL_MAX_COUNT = 6;
export const BACKOFF_INCREMENT = 3;
export const BACKOFF_MAX = 25;

// ============================================================
// Brightness
// ============================================================
export const BRIGHTNESS_MULTIPLIER = 20;

// ============================================================
// HTML Parsing
// ============================================================
export const INIT_REGEX = /window.onload = function\(\){ init\((.*), \d\); };/;