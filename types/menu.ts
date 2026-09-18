export type Shop = 'kitchen' | 'bar' | 'pastry';

export type StopReason =
  | 'out_of_stock' // закончились продукты
  | 'equipment' // сломалось оборудование
  | 'quality' // вопросы к качеству партии
  | 'menu_change'; // позиция выведена из меню смены

export type MenuItemStatus =
  | { kind: 'available' }
  | {
      kind: 'stopped';
      reason: StopReason;
      until: string | null; // ISO-время или null = до конца смены
    };

export interface MenuItem {
  id: string;
  title: string;
  shop: Shop;
  stock: number; // остаток в штуках, 0..99
  status: MenuItemStatus;
  updatedAt: string; // ISO
}

export interface StopItemPayload {
  reason: StopReason;
  until: string | null;
}

/** Значение фильтра статуса. `all` = фильтр не применён. */
export type StatusFilter = 'all' | 'available' | 'stopped';

/** Значение фильтра цеха. `all` = все цеха. */
export type ShopFilter = 'all' | Shop;

export interface MenuFilters {
  shop: ShopFilter;
  status: StatusFilter;
}
