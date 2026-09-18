import { queryOptions } from '@tanstack/react-query';
import { fetchMenuItems } from '../api/menu-api';

/**
 * Структурированные ключи кэша. Один список меню на всё приложение —
 * фильтры цеха/статуса применяются на клиенте как производное состояние,
 * а не отдельными запросами. Это делает оптимистику атомарной: мутация
 * правит единственный источник правды в кэше, без гонок между списками.
 */
export const menuKeys = {
  all: ['menu-items'] as const,
  list: () => [...menuKeys.all, 'list'] as const,
};

export const menuItemsQuery = () =>
  queryOptions({
    queryKey: menuKeys.list(),
    queryFn: ({ signal }) => fetchMenuItems(signal),
  });
