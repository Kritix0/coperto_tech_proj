'use client';

import { create } from 'zustand';

export type ToastTone = 'error' | 'success';

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

interface UiState {
  /** id позиции, для которой открыта панель постановки/редактирования стопа. */
  panelItemId: string | null;
  /** id позиций, по которым сейчас летит мутация (метка «сохраняется»). */
  savingIds: string[];
  toasts: Toast[];

  openPanel: (itemId: string) => void;
  closePanel: () => void;

  startSaving: (id: string) => void;
  stopSaving: (id: string) => void;
  isSaving: (id: string) => boolean;

  pushToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
}

/**
 * Стор держит только клиентское UI-состояние. Серверные данные (список меню)
 * живут в кэше TanStack Query и здесь не дублируются.
 */
export const useUiStore = create<UiState>((set, get) => ({
  panelItemId: null,
  savingIds: [],
  toasts: [],

  openPanel: (itemId) => set({ panelItemId: itemId }),
  closePanel: () => set({ panelItemId: null }),

  startSaving: (id) =>
    set((s) => (s.savingIds.includes(id) ? s : { savingIds: [...s.savingIds, id] })),
  stopSaving: (id) => set((s) => ({ savingIds: s.savingIds.filter((x) => x !== id) })),
  isSaving: (id) => get().savingIds.includes(id),

  pushToast: (message, tone = 'error') =>
    set((s) => ({
      toasts: [...s.toasts, { id: crypto.randomUUID(), message, tone }],
    })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
