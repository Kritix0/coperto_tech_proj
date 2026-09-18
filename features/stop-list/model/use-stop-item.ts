'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUiStore } from './ui-store';
import { buildResumeMutationOptions, buildStopMutationOptions } from './optimistic';

/**
 * Оптимистичные мутации стоп-листа. Вся логика снапшота/отката вынесена в
 * `optimistic.ts` и покрыта юнит-тестом; хук лишь связывает её с React и стором.
 */
export function useStopItem() {
  const qc = useQueryClient();
  const { startSaving, stopSaving, pushToast } = useUiStore.getState();
  const hooks = { startSaving, stopSaving, pushToast };

  const stop = useMutation(buildStopMutationOptions(qc, hooks));
  const resume = useMutation(buildResumeMutationOptions(qc, hooks));

  return { stop, resume };
}
