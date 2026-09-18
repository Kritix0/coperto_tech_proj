'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MenuFilters, MenuItem } from '@/types/menu';
import { menuItemsQuery } from './queries';

/** Клиентская фильтрация списка по цеху и статусу. */
export function filterItems(items: MenuItem[], filters: MenuFilters): MenuItem[] {
  return items.filter((item) => {
    if (filters.shop !== 'all' && item.shop !== filters.shop) return false;
    if (filters.status !== 'all' && item.status.kind !== filters.status) return false;
    return true;
  });
}

/**
 * Читает список меню из кэша и возвращает уже отфильтрованный срез.
 * Фильтр — производное состояние поверх единственного запроса, без рефетча.
 */
export function useMenuItems(filters: MenuFilters) {
  const query = useQuery(menuItemsQuery());

  const items = useMemo(() => filterItems(query.data ?? [], filters), [query.data, filters]);

  return {
    items,
    allItems: query.data ?? [],
    total: query.data?.length ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
