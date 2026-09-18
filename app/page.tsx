import { Suspense } from 'react';
import { StopListView } from '@/features/stop-list/ui/StopListView';
import { parseFilters } from '@/features/stop-list/model/filters-core';
import { SHOP_LABELS } from '@/shared/domain';

const STATUS_LABELS: Record<'available' | 'stopped', string> = {
  available: 'В продаже',
  stopped: 'В стоп-листе',
};

/**
 * Серверный компонент страницы: читает searchParams и вычисляет начальные
 * фильтры на сервере (SSR-подпись отражает URL). Интерактив — в клиентском
 * StopListView, который дальше держит фильтры в URL.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string; status?: string }>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const summary = [
    filters.shop !== 'all' ? SHOP_LABELS[filters.shop] : null,
    filters.status !== 'all' ? STATUS_LABELS[filters.status] : null,
  ].filter(Boolean);

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <header className="mb-6">
        <p className="text-accent text-sm font-medium">Coperto · Смена</p>
        <h1 className="text-ink mt-1 text-2xl font-semibold">Стоп-лист кухни</h1>
        <p className="text-muted mt-1 text-sm">
          {summary.length > 0
            ? `Активный фильтр: ${summary.join(' · ')}`
            : 'Меню смены: ставьте позиции в стоп и возвращайте в продажу.'}
        </p>
      </header>

      {/* useSearchParams требует Suspense-границу при статическом рендере. */}
      <Suspense fallback={<div className="bg-card h-40 animate-pulse rounded-xl" />}>
        <StopListView />
      </Suspense>
    </main>
  );
}
