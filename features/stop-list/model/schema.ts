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
  if (value === null) return null; // до конца смены - всегда валидно
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return 'Некорректное время';
  if (ts <= now) return 'Время должно быть в будущем';
  if (ts - now > MAX_AHEAD_MS) return 'Не больше чем на 24 часа вперёд';
  if (ts % STEP_MS !== 0) return 'Шаг - 15 минут';
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
 * Схема формы. Срок либо «до конца смены» (untilMode: 'shift'), либо конкретный
 * слот (untilMode: 'time' + untilIso - ISO-строка из готового списка слотов).
 * Причина допускает пустую строку в начальном состоянии, но обязана быть выбрана.
 */
export const stopFormSchema = z
  .object({
    reason: z.union([z.literal(''), stopReasonSchema]),
    untilMode: z.enum(['shift', 'time']),
    untilIso: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.reason === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Выберите причину', path: ['reason'] });
    }
    if (val.untilMode === 'time') {
      if (!val.untilIso) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Укажите время', path: ['untilIso'] });
        return;
      }
      const error = validateUntil(val.untilIso);
      if (error) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: error, path: ['untilIso'] });
      }
    }
  });

export type StopFormValues = z.infer<typeof stopFormSchema>;

export interface UntilSlot {
  iso: string;
  label: string;
}

const slotFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** Русская подпись слота: «дд.мм, ЧЧ:ММ» (24 часа). */
export function formatSlotLabel(iso: string): string {
  return slotFormatter.format(new Date(iso));
}

/**
 * Все допустимые слоты срока: от следующей 15-минутной границы (строго в будущем)
 * до now + 24 часа. Список строится по тем же правилам, что и валидация,
 * поэтому выбрать невалидное время нельзя в принципе - и формат от локали браузера
 * не зависит.
 */
export function generateUntilSlots(now = Date.now()): UntilSlot[] {
  const start = Math.floor(now / STEP_MS) * STEP_MS + STEP_MS; // строго > now
  const end = now + MAX_AHEAD_MS;
  const slots: UntilSlot[] = [];
  for (let t = start; t <= end; t += STEP_MS) {
    const iso = new Date(t).toISOString();
    slots.push({ iso, label: formatSlotLabel(iso) });
  }
  return slots;
}
