import type { MenuFilters, ShopFilter, StatusFilter } from '@/types/menu';
import { SHOPS } from '@/shared/domain';

/** Чистая логика фильтров - можно вызывать и на сервере, и на клиенте. */

const SHOP_VALUES: ShopFilter[] = ['all', ...SHOPS];
const STATUS_VALUES: StatusFilter[] = ['all', 'available', 'stopped'];

export const DEFAULT_FILTERS: MenuFilters = { shop: 'all', status: 'all' };

/** Парсер query-параметров -> валидные фильтры. */
export function parseFilters(params: {
  shop?: string | string[];
  status?: string | string[];
}): MenuFilters {
  const shop = first(params.shop);
  const status = first(params.status);
  return {
    shop: SHOP_VALUES.includes(shop as ShopFilter) ? (shop as ShopFilter) : 'all',
    status: STATUS_VALUES.includes(status as StatusFilter) ? (status as StatusFilter) : 'all',
  };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
