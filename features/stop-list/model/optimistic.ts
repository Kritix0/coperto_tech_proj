import type { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import type { MenuItem, StopItemPayload } from '@/types/menu';
import { ApiError, resumeMenuItem, stopMenuItem } from '../api/menu-api';
import { menuKeys } from './queries';

/** Побочные эффекты мутаций, инжектятся из хука (в тесте - no-op). */
export interface MutationHooks {
  startSaving: (id: string) => void;
  stopSaving: (id: string) => void;
  pushToast: (message: string, tone?: 'error' | 'success') => void;
}

export interface MutationContext {
  prev: MenuItem[] | undefined;
}

const listKey = menuKeys.list();

/** Чистое применение нового статуса к позиции. */
export function patchStatus(
  items: MenuItem[] | undefined,
  id: string,
  status: MenuItem['status'],
): MenuItem[] {
  return (items ?? []).map((item) => (item.id === id ? { ...item, status } : item));
}

function toastMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Не удалось сохранить изменения';
}

/** Общая оптимистика: снимок -> патч -> откат при ошибке -> инвалидация. */
function optimisticHandlers<Vars extends { id: string }>(
  qc: QueryClient,
  hooks: MutationHooks,
  nextStatus: (vars: Vars) => MenuItem['status'],
) {
  return {
    onMutate: async (vars: Vars): Promise<MutationContext> => {
      hooks.startSaving(vars.id);
      await qc.cancelQueries({ queryKey: listKey });
      const prev = qc.getQueryData<MenuItem[]>(listKey);
      qc.setQueryData<MenuItem[]>(listKey, (items) =>
        patchStatus(items, vars.id, nextStatus(vars)),
      );
      return { prev };
    },
    onError: (error: unknown, _vars: Vars, ctx: MutationContext | undefined) => {
      if (ctx?.prev) qc.setQueryData(listKey, ctx.prev);
      hooks.pushToast(toastMessage(error), 'error');
    },
    onSettled: (_data: unknown, _err: unknown, vars: Vars) => {
      hooks.stopSaving(vars.id);
      void qc.invalidateQueries({ queryKey: listKey });
    },
  };
}

export function buildStopMutationOptions(
  qc: QueryClient,
  hooks: MutationHooks,
): UseMutationOptions<
  MenuItem,
  unknown,
  { id: string; payload: StopItemPayload },
  MutationContext
> {
  return {
    mutationFn: ({ id, payload }) => stopMenuItem(id, payload),
    ...optimisticHandlers(qc, hooks, ({ payload }) => ({
      kind: 'stopped',
      reason: payload.reason,
      until: payload.until,
    })),
  };
}

export function buildResumeMutationOptions(
  qc: QueryClient,
  hooks: MutationHooks,
): UseMutationOptions<MenuItem, unknown, { id: string }, MutationContext> {
  return {
    mutationFn: ({ id }) => resumeMenuItem(id),
    ...optimisticHandlers(qc, hooks, () => ({ kind: 'available' })),
  };
}
