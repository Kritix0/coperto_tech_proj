import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MutationObserver, QueryClient } from '@tanstack/react-query';
import type { MenuItem } from '@/types/menu';

// Мокаем транспорт, чтобы управлять исходом мутации детерминированно.
vi.mock('../api/menu-api', () => {
  class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  }
  return {
    ApiError,
    fetchMenuItems: vi.fn(),
    stopMenuItem: vi.fn(),
    resumeMenuItem: vi.fn(),
  };
});

import { ApiError, stopMenuItem } from '../api/menu-api';
import { buildStopMutationOptions, patchStatus } from './optimistic';
import { menuKeys } from './queries';

const listKey = menuKeys.list();

function seedClient(): { qc: QueryClient; items: MenuItem[] } {
  const items: MenuItem[] = [
    {
      id: 'k1',
      title: 'Борщ',
      shop: 'kitchen',
      stock: 10,
      status: { kind: 'available' },
      updatedAt: 'x',
    },
    {
      id: 'k2',
      title: 'Том ям',
      shop: 'kitchen',
      stock: 5,
      status: { kind: 'available' },
      updatedAt: 'x',
    },
  ];
  const qc = new QueryClient();
  qc.setQueryData(listKey, items);
  return { qc, items };
}

const noopHooks = { startSaving: vi.fn(), stopSaving: vi.fn(), pushToast: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('оптимистичная постановка в стоп-лист', () => {
  it('патчит статус позиции, не трогая остальные (patchStatus)', () => {
    const { items } = seedClient();
    const next = patchStatus(items, 'k1', { kind: 'stopped', reason: 'equipment', until: null });
    expect(next[0].status).toEqual({ kind: 'stopped', reason: 'equipment', until: null });
    expect(next[1]).toBe(items[1]); // остальные ссылки не пересоздаются
  });

  it('при ошибке сервера откатывает список к прежнему состоянию и шлёт тост', async () => {
    const { qc } = seedClient();
    vi.mocked(stopMenuItem).mockRejectedValueOnce(new ApiError('503', 503));

    const observer = new MutationObserver(qc, buildStopMutationOptions(qc, noopHooks));
    await observer
      .mutate({ id: 'k1', payload: { reason: 'equipment', until: null } })
      .catch(() => undefined);

    const data = qc.getQueryData<MenuItem[]>(listKey)!;
    expect(data[0].status).toEqual({ kind: 'available' }); // откат
    expect(noopHooks.pushToast).toHaveBeenCalledWith('503', 'error');
    expect(noopHooks.startSaving).toHaveBeenCalledWith('k1');
    expect(noopHooks.stopSaving).toHaveBeenCalledWith('k1');
  });

  it('при успехе оставляет оптимистичный статус', async () => {
    const { qc } = seedClient();
    vi.mocked(stopMenuItem).mockResolvedValueOnce({
      id: 'k1',
      title: 'Борщ',
      shop: 'kitchen',
      stock: 10,
      status: { kind: 'stopped', reason: 'equipment', until: null },
      updatedAt: 'y',
    });

    const observer = new MutationObserver(qc, buildStopMutationOptions(qc, noopHooks));
    await observer.mutate({ id: 'k1', payload: { reason: 'equipment', until: null } });

    const data = qc.getQueryData<MenuItem[]>(listKey)!;
    expect(data[0].status.kind).toBe('stopped');
    expect(noopHooks.pushToast).not.toHaveBeenCalled();
  });
});
