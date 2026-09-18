/** Формат срока стопа для показа в бейдже. */
export function formatUntil(until: string | null): string {
  if (until === null) return 'до конца смены';
  const date = new Date(until);
  if (Number.isNaN(date.getTime())) return 'срок неизвестен';

  const time = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  const isToday = new Date().toDateString() === date.toDateString();
  if (isToday) return `до ${time}`;

  const day = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(date);
  return `до ${day} ${time}`;
}

/** Относительное время последнего изменения, коротко. */
export function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date);
}
