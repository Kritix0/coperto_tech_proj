'use client';

import type { ShopFilter, StatusFilter } from '@/types/menu';
import { SHOP_LABELS, SHOPS } from '@/shared/domain';
import { Select } from '@/shared/ui/Select';
import { Button } from '@/shared/ui/Button';
import { useMenuFilters } from '../model/filters';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все статусы' },
  { value: 'available', label: 'В продаже' },
  { value: 'stopped', label: 'В стоп-листе' },
];

export function Filters() {
  const { filters, setFilter, reset } = useMenuFilters();
  const hasActive = filters.shop !== 'all' || filters.status !== 'all';

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-muted text-xs font-medium">Цех</span>
        <Select
          className="w-48"
          value={filters.shop}
          onChange={(e) => setFilter('shop', e.target.value as ShopFilter)}
          aria-label="Фильтр по цеху"
        >
          <option value="all">Все цеха</option>
          {SHOPS.map((shop) => (
            <option key={shop} value={shop}>
              {SHOP_LABELS[shop]}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-muted text-xs font-medium">Статус</span>
        <Select
          className="w-48"
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value as StatusFilter)}
          aria-label="Фильтр по статусу"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </label>

      {hasActive && (
        <Button variant="ghost" size="md" onClick={reset}>
          Сбросить
        </Button>
      )}
    </div>
  );
}
