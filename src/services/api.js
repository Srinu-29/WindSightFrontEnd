// Central place for backend requests. VITE_ settings are visible in the browser;
// never put secrets in them. /api uses the same origin as the frontend, with
// Vite (development) or Nginx (Docker) forwarding requests to FastAPI.
// Strip a trailing slash to avoid joining /api/ and /health into /api//health.
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
// const prevents reassigning this variable. || chooses the right value when the
// left is falsy (including undefined or an empty string). /\/$/ is a regular
// expression matching a slash at the end; replace removes that trailing slash.

export async function getHealth(signal) {
  // export lets other files import this function. async makes its result a Promise.
  // await pauses this function until a Promise settles. A rejection throws here.
  // `${baseUrl}` inserts a value into a template string; { signal } is shorthand
  // for { signal: signal }. ! means "not", !== checks strict inequality, and
  // throw passes an error to the caller instead of returning normal data.
  // await waits without freezing the browser. signal allows the page to cancel
  // the request. fetch does not throw for HTTP 404/500, so check response.ok too.
  const response = await fetch(`${baseUrl}/health`, { signal });
  if (!response.ok) throw new Error(`Health check failed (${response.status})`);
  // Decode JSON and check the expected value before declaring the backend healthy.
  const data = await response.json();
  if (data.status !== 'ok') throw new Error('Unexpected health response');
  return data;
}
