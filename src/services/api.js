// Central place for backend requests. VITE_ settings are visible in the browser;
// never put secrets in them. /api uses the same origin as the frontend, with
// Vite (development) or Nginx (Docker) forwarding requests to FastAPI.
// Strip a trailing slash to avoid joining /api/ and /health into /api//health.
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

/**
 * Checks the health status of the backend API service.
 *
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the HTTP request.
 * @returns {Promise<{ status: string, service?: string }>} The health check status response.
 * @throws {Error} If the HTTP request fails or the status returned is not 'ok'.
 */
export async function getHealth(signal) {
  const response = await fetch(`${baseUrl}/health`, { signal });
  if (!response.ok) throw new Error(`Health check failed (${response.status})`);
  const data = await response.json();
  if (data.status !== 'ok') throw new Error('Unexpected health response');
  return data;
}
/**
 * Fetches single-date forecast accuracy metrics and half-hourly comparison series.
 *
 * @param {string} decisionDate - Calendar date when the purchasing decision was made (YYYY-MM-DD).
 * @param {string} [cutoffTime] - Optional cutoff time in Europe/London (HH:MM or HH:MM:SS, default 14:00).
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the HTTP request.
 * @returns {Promise<object>} The single date accuracy report including overall metrics (MAE, RMSE, bias) and time series.
 * @throws {Error} If the HTTP request fails or the server returns an error response.
 */
export async function getAccuracy(decisionDate, cutoffTime, signal) {
  const params = new URLSearchParams({ decision_date: decisionDate });
  if (cutoffTime) params.append('cutoff_time', cutoffTime);
  const response = await fetch(`${baseUrl}/accuracy?${params.toString()}`, { signal });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail?.message || errorBody.detail || `Failed to fetch accuracy (${response.status})`);
  }
  return response.json();
}
/**
 * Replays electricity purchasing decisions and fetches forecast vs. actual generation data.
 *
 * @param {string} decisionDate - Calendar date when the purchasing decision was made (YYYY-MM-DD).
 * @param {string} [cutoffTime] - Optional cutoff time in Europe/London (HH:MM or HH:MM:SS, default 14:00).
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the HTTP request.
 * @returns {Promise<object>} The forecast replay data with settlement periods, selected forecasts, and actuals.
 * @throws {Error} If the HTTP request fails or the server returns an error response.
 */
export async function getForecastReplay(decisionDate, cutoffTime, signal) {
  const params = new URLSearchParams({ decision_date: decisionDate });
  if (cutoffTime) params.append('cutoff_time', cutoffTime);
  const response = await fetch(`${baseUrl}/forecast?${params.toString()}`, { signal });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail?.message || errorBody.detail || `Failed to fetch forecast replay (${response.status})`);
  }
  return response.json();
}

