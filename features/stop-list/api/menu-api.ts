import type { MenuItem, StopItemPayload } from '@/types/menu';

/**
 * Транспортный слой стоп-листа: всё общение с API живёт здесь.
 * UI-компоненты и хуки о `fetch`, URL и формате ответа не знают.
 */

/** Ошибка транспортного уровня с человекочитаемым текстом от сервера. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseError(res: Response): Promise<never> {
  let message = 'Что-то пошло не так';
  try {
    const data: unknown = await res.json();
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
      message = data.error;
    }
  } catch {
    // тело не JSON - оставляем дефолтный текст
  }
  throw new ApiError(message, res.status);
}

export async function fetchMenuItems(signal?: AbortSignal): Promise<MenuItem[]> {
  const res = await fetch('/api/menu-items', { signal });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<MenuItem[]>;
}

export async function stopMenuItem(id: string, payload: StopItemPayload): Promise<MenuItem> {
  const res = await fetch(`/api/menu-items/${id}/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<MenuItem>;
}

export async function resumeMenuItem(id: string): Promise<MenuItem> {
  const res = await fetch(`/api/menu-items/${id}/resume`, { method: 'POST' });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<MenuItem>;
}
