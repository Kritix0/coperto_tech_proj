import { z } from 'zod';

/**
 * Единая схема валидации стоп-листа.
 * Переиспользуется на клиенте (react-hook-form) и на сервере (route handler),
 * чтобы правила жили в одном месте и не расходились.
 */

export const MAX_AHEAD_MS = 24 * 60 * 60 * 1000; // не позже чем через 24 часа
export const STEP_MS = 15 * 60 * 1000; // шаг 15 минут

export const stopReasonSchema = z.enum(['out_of_stock', 'equipment', 'quality', 'menu_change'], {
  errorMap: () => ({ message: 'Выберите причину' }),
});

/**
 * Проверка срока стопа. Возвращает текст ошибки или null.
 * `now` вынесен в параметр, чтобы на сервере считать от серверного времени.
 */
export function validateUntil(value: string | null, now = Date.now()): string | null {
  if (value === null) return null; // до конца смены — всегда валидно
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return 'Некорректное время';
  if (ts <= now) return 'Время должно быть в будущем';
  if (ts - now > MAX_AHEAD_MS) return 'Не больше чем на 24 часа вперёд';
  if (ts % STEP_MS !== 0) return 'Шаг — 15 минут';
  return null;
}

const untilSchema = z.string().datetime({ offset: true, message: 'Некорректное время' }).nullable();

/** Payload постановки в стоп-лист: причина + срок. Контракт клиент ↔ сервер. */
export const stopItemPayloadSchema = z
  .object({
    reason: stopReasonSchema,
    until: untilSchema,
  })
  .superRefine((val, ctx) => {
    const error = validateUntil(val.until);
    if (error) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: error, path: ['until'] });
    }
  });

export type StopItemPayloadInput = z.infer<typeof stopItemPayloadSchema>;

/**
 * Схема формы. Хранит режим срока отдельно от ISO-значения, потому что
 * `<input type="datetime-local">` работает с локальным временем, а payload — с ISO.
 * Причина допускает пустую строку в начальном состоянии, но обязана быть выбрана.
 */
export const stopFormSchema = z
  .object({
    reason: z.union([z.literal(''), stopReasonSchema]),
    untilMode: z.enum(['shift', 'time']),
    untilLocal: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.reason === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Выберите причину', path: ['reason'] });
    }
    if (val.untilMode === 'time') {
      if (!val.untilLocal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Укажите время',
          path: ['untilLocal'],
        });
        return;
      }
      const iso = localInputToIso(val.untilLocal);
      const error = validateUntil(iso);
      if (error) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: error, path: ['untilLocal'] });
      }
    }
  });

export type StopFormValues = z.infer<typeof stopFormSchema>;

/** `datetime-local` (без таймзоны) → ISO с оффсетом. */
export function localInputToIso(local: string): string | null {
  if (!local) return null;
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/** ISO → значение для `datetime-local` (локальное время, минуты). */
export function isoToLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}
