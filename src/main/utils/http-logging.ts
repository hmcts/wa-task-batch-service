import axios from 'axios';

interface HttpRequestFailureContext {
  operation: string;
  startedAt: number;
  error: unknown;
}

export function sanitiseHttpUrl(url?: string, baseURL?: string): string {
  try {
    const resolvedUrl = new URL(url || baseURL || '', baseURL);
    return `${resolvedUrl.protocol}//${resolvedUrl.host}${resolvedUrl.pathname}`;
  } catch {
    return 'unknown';
  }
}

export function getHttpRequestFailureMessage(context: HttpRequestFailureContext): string {
  const durationMs = Date.now() - context.startedAt;

  if (axios.isAxiosError(context.error)) {
    const {config, response} = context.error;
    return `HTTP request failed operation=${context.operation} durationMs=${durationMs} code=${context.error.code || 'none'} message=${context.error.message} method=${config?.method || 'unknown'} url=${sanitiseHttpUrl(config?.url, config?.baseURL)} timeoutMs=${config?.timeout || 'none'} responseStatus=${response?.status || 'none'}`;
  }

  return `HTTP request failed operation=${context.operation} durationMs=${durationMs} error=${String(context.error)}`;
}
