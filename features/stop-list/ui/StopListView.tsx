'use client';

import { useMemo } from 'react';
import type { MenuItem, StopItemPayload } from '@/types/menu';
import { useMenuFilters } from '../model/filters';
import { useMenuItems } from '../model/use-menu-items';
import { useStopItem } from '../model/use-stop-item';
import { useUiStore } from '../model/ui-store';
import { Filters } from './Filters';
import { StopListTable } from './StopListTable';
import { StopReasonPanel } from './StopReasonPanel';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';

export function StopListView() {
  const { filters } = useMenuFilters();
  const { items, allItems, total, isLoading, isError, refetch, isFetching } = useMenuItems(filters);
  const { stop, resume } = useStopItem();

  const panelItemId = useUiStore((s) => s.panelItemId);
  const savingIds = useUiStore((s) => s.savingIds);
  const openPanel = useUiStore((s) => s.openPanel);
  const closePanel = useUiStore((s) => s.closePanel);

  const panelItem = useMemo(
    () => allItems.find((i) => i.id === panelItemId) ?? null,
    [allItems, panelItemId],
  );

  const handleStopSubmit = async (id: string, payload: StopItemPayload) => {
    // Строка обновляется оптимистично сразу (onMutate), но панель держим открытой
    // со спиннером на кнопке до ответа сервера: успех - закрываем, ошибка - панель
    // остаётся для повтора (тост об ошибке показывает onError).
    try {
      await stop.mutateAsync({ id, payload });
      closePanel();
    } catch {
      // остаёмся в панели
    }
  };

  const handleResume = (item: MenuItem) => resume.mutate({ id: item.id });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <Filters />
        {isFetching && !isLoading && (
          <span className="text-muted flex items-center gap-2 text-xs">
            <Spinner className="h-3.5 w-3.5" />
            обновление…
          </span>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && items.length === 0 && <EmptyState hasItems={total > 0} />}

      {!isLoading && !isError && items.length > 0 && (
        <StopListTable
          items={items}
          savingIds={savingIds}
          onStop={(item) => openPanel(item.id)}
          onEdit={(item) => openPanel(item.id)}
          onResume={handleResume}
        />
      )}

      <StopReasonPanel item={panelItem} onSubmit={handleStopSubmit} onClose={closePanel} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="border-line bg-card overflow-hidden rounded-xl border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border-line flex items-center gap-4 border-b px-4 py-4 last:border-b-0"
        >
          <div className="bg-surface h-4 w-48 animate-pulse rounded" />
          <div className="bg-surface h-4 w-20 animate-pulse rounded" />
          <div className="bg-surface ml-auto h-8 w-32 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border-danger/30 bg-card flex flex-col items-center gap-3 rounded-xl border px-6 py-12 text-center">
      <p className="text-danger text-sm font-medium">Не удалось загрузить меню смены</p>
      <p className="text-muted text-sm">Проверьте соединение и попробуйте ещё раз.</p>
      <Button variant="secondary" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}

function EmptyState({ hasItems }: { hasItems: boolean }) {
  return (
    <div className="border-line bg-card flex flex-col items-center gap-2 rounded-xl border px-6 py-12 text-center">
      <p className="text-ink text-sm font-medium">
        {hasItems ? 'Под фильтры ничего не подошло' : 'Меню смены пусто'}
      </p>
      <p className="text-muted text-sm">
        {hasItems
          ? 'Измените фильтры цеха или статуса.'
          : 'Позиции появятся, когда откроется смена.'}
      </p>
    </div>
  );
}
