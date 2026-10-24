const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export async function getHealth(signal) {
  const response = await fetch(`${baseUrl}/health`, { signal });
  if (!response.ok) throw new Error(`Health check failed (${response.status})`);
  const data = await response.json();
  if (data.status !== 'ok') throw new Error('Unexpected health response');
  return data;
}
