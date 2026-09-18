import type { MenuItem, StopItemPayload } from '@/types/menu';

/**
 * In-memory хранилище меню смены.
 *
 * Живёт в памяти процесса Node. На локальном `next dev` состояние сохраняется
 * между запросами до перезапуска сервера. На serverless (Vercel) каждый холодный
 * старт поднимает свежий сид — это ожидаемое поведение мок-бэкенда, а не баг.
 */

const now = Date.now();
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();

function seed(): MenuItem[] {
  return [
    // --- Кухня ---
    {
      id: 'k1',
      title: 'Борщ украинский',
      shop: 'kitchen',
      stock: 24,
      status: { kind: 'available' },
      updatedAt: iso(-3_600_000),
    },
    {
      id: 'k2',
      title: 'Пельмени домашние',
      shop: 'kitchen',
      stock: 12,
      status: { kind: 'available' },
      updatedAt: iso(-5_400_000),
    },
    {
      id: 'k3',
      title: 'Стейк рибай',
      shop: 'kitchen',
      stock: 6,
      status: { kind: 'stopped', reason: 'equipment', until: null },
      updatedAt: iso(-1_800_000),
    },
    {
      id: 'k4',
      title: 'Цезарь с курицей',
      shop: 'kitchen',
      stock: 18,
      status: { kind: 'available' },
      updatedAt: iso(-7_200_000),
    },
    {
      id: 'k5',
      title: 'Том ям',
      shop: 'kitchen',
      stock: 0,
      status: { kind: 'stopped', reason: 'out_of_stock', until: null },
      updatedAt: iso(-900_000),
    },
    {
      id: 'k6',
      title: 'Паста карбонара',
      shop: 'kitchen',
      stock: 0,
      status: { kind: 'available' },
      updatedAt: iso(-2_700_000),
    },
    // --- Бар ---
    {
      id: 'b1',
      title: 'Апероль шприц',
      shop: 'bar',
      stock: 40,
      status: { kind: 'available' },
      updatedAt: iso(-10_800_000),
    },
    {
      id: 'b2',
      title: 'Негрони',
      shop: 'bar',
      stock: 3,
      status: { kind: 'stopped', reason: 'out_of_stock', until: iso(3 * 3_600_000) },
      updatedAt: iso(-1_200_000),
    },
    {
      id: 'b3',
      title: 'Эспрессо тоник',
      shop: 'bar',
      stock: 25,
      status: { kind: 'available' },
      updatedAt: iso(-4_500_000),
    },
    {
      id: 'b4',
      title: 'Лимонад имбирный',
      shop: 'bar',
      stock: 15,
      status: { kind: 'available' },
      updatedAt: iso(-6_300_000),
    },
    // --- Кондитерская ---
    {
      id: 'p1',
      title: 'Наполеон',
      shop: 'pastry',
      stock: 0, // остаток 0 + available → инвариант авто-стопит по «закончились продукты»
      status: { kind: 'available' },
      updatedAt: iso(-9_000_000),
    },
    {
      id: 'p2',
      title: 'Чизкейк Нью-Йорк',
      shop: 'pastry',
      stock: 11,
      status: { kind: 'available' },
      updatedAt: iso(-3_000_000),
    },
    {
      id: 'p3',
      title: 'Круассан миндальный',
      shop: 'pastry',
      stock: 5,
      status: { kind: 'stopped', reason: 'quality', until: null },
      updatedAt: iso(-600_000),
    },
    {
      id: 'p4',
      title: 'Тирамису',
      shop: 'pastry',
      stock: 14,
      status: { kind: 'available' },
      updatedAt: iso(-8_100_000),
    },
  ];
}

let items: MenuItem[] = seed();

/**
 * Инвариант остатка: доступная позиция с остатком 0 автоматически уходит в стоп
 * по причине «закончились продукты» (до конца смены). Уже застопленную позицию не
 * трогаем — её причина (например, «сломалось оборудование») важнее и не должна
 * затираться. Применяется на чтении, поэтому правило держится независимо от того,
 * откуда пришли данные меню.
 */
function withStockInvariant(item: MenuItem): MenuItem {
  if (item.stock === 0 && item.status.kind === 'available') {
    return { ...item, status: { kind: 'stopped', reason: 'out_of_stock', until: null } };
  }
  return item;
}

export function getAllItems(): MenuItem[] {
  return items.map((item) => withStockInvariant({ ...item }));
}

export function findItem(id: string): MenuItem | undefined {
  return items.find((item) => item.id === id);
}

export function applyStop(id: string, payload: StopItemPayload): MenuItem {
  const item = findItem(id);
  if (!item) throw new StoreError('not_found', 'Позиция не найдена');
  item.status = { kind: 'stopped', reason: payload.reason, until: payload.until };
  item.updatedAt = new Date().toISOString();
  return { ...item };
}

export function applyResume(id: string): MenuItem {
  const item = findItem(id);
  if (!item) throw new StoreError('not_found', 'Позиция не найдена');
  if (item.stock === 0) {
    throw new StoreError('conflict', 'Нельзя вернуть в продажу: остаток 0');
  }
  item.status = { kind: 'available' };
  item.updatedAt = new Date().toISOString();
  return { ...item };
}

export class StoreError extends Error {
  constructor(
    public code: 'not_found' | 'conflict',
    message: string,
  ) {
    super(message);
    this.name = 'StoreError';
  }
}
