import Constants from 'expo-constants';

export function resolveApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } })
      ?.extra?.expoGo?.debuggerHost;

  if (typeof hostUri === 'string' && hostUri.length > 0) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }

  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveApiBaseUrl();
