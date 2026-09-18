'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { MenuFilters } from '@/types/menu';
import { parseFilters } from './filters-core';

export { parseFilters, DEFAULT_FILTERS } from './filters-core';

/**
 * Хук чтения/записи фильтров в URL. URL — единственный источник правды:
 * состояние переживает перезагрузку и корректно работает с кнопкой «назад».
 */
export function useMenuFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<MenuFilters>(
    () =>
      parseFilters({
        shop: searchParams.get('shop') ?? undefined,
        status: searchParams.get('status') ?? undefined,
      }),
    [searchParams],
  );

  const setFilter = useCallback(
    <K extends keyof MenuFilters>(key: K, value: MenuFilters[K]) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === 'all') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const reset = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return { filters, setFilter, reset };
}
