import { API_BASE_URL } from '@/features/auth/context/auth-context';

/**
 * Typed JSON fetch wrapper.
 * Throws an Error with the server's message on non-2xx responses.
 */
export async function requestJson<T>(
  path: string,
  options: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers ?? {}),
    },
  });

  const body = (await response.json().catch(() => ({}))) as
    | Record<string, unknown>
    | undefined;

  if (!response.ok) {
    const message =
      (typeof body?.message === 'string' && body.message) ||
      (typeof body?.error === 'string' && body.error) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}
