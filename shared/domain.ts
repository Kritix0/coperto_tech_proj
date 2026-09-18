import type { Shop, StopReason } from '@/types/menu';

/** Человекочитаемые подписи доменных значений - единый источник для UI и бейджей. */

export const SHOP_LABELS: Record<Shop, string> = {
  kitchen: 'Кухня',
  bar: 'Бар',
  pastry: 'Кондитерская',
};

export const STOP_REASON_LABELS: Record<StopReason, string> = {
  out_of_stock: 'Закончились продукты',
  equipment: 'Сломалось оборудование',
  quality: 'Вопросы к качеству',
  menu_change: 'Выведена из меню смены',
};

export const STOP_REASONS: StopReason[] = ['out_of_stock', 'equipment', 'quality', 'menu_change'];

export const SHOPS: Shop[] = ['kitchen', 'bar', 'pastry'];
