'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import type { MenuItem, StopItemPayload, StopReason } from '@/types/menu';
import { STOP_REASONS, STOP_REASON_LABELS } from '@/shared/domain';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Select';
import { Input } from '@/shared/ui/Input';
import { Field } from '@/shared/ui/Field';
import {
  isoToLocalInput,
  localInputToIso,
  stopFormSchema,
  type StopFormValues,
} from '../model/schema';

interface StopReasonPanelProps {
  item: MenuItem | null;
  onSubmit: (id: string, payload: StopItemPayload) => void;
  onClose: () => void;
}

function buildDefaults(item: MenuItem | null): StopFormValues {
  if (item && item.status.kind === 'stopped') {
    return {
      reason: item.status.reason,
      untilMode: item.status.until === null ? 'shift' : 'time',
      untilLocal: isoToLocalInput(item.status.until),
    };
  }
  return { reason: '', untilMode: 'shift', untilLocal: '' };
}

export function StopReasonPanel({ item, onSubmit, onClose }: StopReasonPanelProps) {
  const open = item !== null;
  const isEdit = item?.status.kind === 'stopped';

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StopFormValues>({
    resolver: zodResolver(stopFormSchema),
    mode: 'onBlur',
    defaultValues: buildDefaults(item),
  });

  // При смене выбранной позиции переинициализируем форму.
  useEffect(() => {
    reset(buildDefaults(item));
  }, [item, reset]);

  // Закрытие по Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const untilMode = watch('untilMode');

  const submit = handleSubmit((values) => {
    if (!item || values.reason === '') return;
    const payload: StopItemPayload = {
      reason: values.reason,
      until: values.untilMode === 'shift' ? null : localInputToIso(values.untilLocal),
    };
    onSubmit(item.id, payload);
  });

  // Границы для datetime-local: сейчас … +24 часа.
  const now = new Date();
  const minLocal = isoToLocalInput(now.toISOString());
  const maxLocal = isoToLocalInput(new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString());

  return (
    <AnimatePresence>
      {open && item && (
        <>
          <motion.div
            className="bg-ink/30 fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            className="bg-card fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stop-panel-title"
          >
            <div className="border-line flex items-start justify-between border-b px-6 py-4">
              <div>
                <h2 id="stop-panel-title" className="text-ink text-lg font-semibold">
                  {isEdit ? 'Изменить стоп' : 'Поставить в стоп-лист'}
                </h2>
                <p className="text-muted mt-0.5 text-sm">{item.title}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Закрыть панель">
                ✕
              </Button>
            </div>

            <form
              onSubmit={submit}
              className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5"
            >
              <Field label="Причина стопа" htmlFor="reason" error={errors.reason?.message}>
                <Select id="reason" invalid={!!errors.reason} {...register('reason')}>
                  <option value="">Выберите причину…</option>
                  {STOP_REASONS.map((reason: StopReason) => (
                    <option key={reason} value={reason}>
                      {STOP_REASON_LABELS[reason]}
                    </option>
                  ))}
                </Select>
              </Field>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-ink mb-1 text-sm font-medium">Срок стопа</legend>
                <label className="text-ink flex items-center gap-2 text-sm">
                  <input type="radio" value="shift" {...register('untilMode')} />
                  До конца смены
                </label>
                <label className="text-ink flex items-center gap-2 text-sm">
                  <input type="radio" value="time" {...register('untilMode')} />
                  Конкретное время
                </label>
              </fieldset>

              {untilMode === 'time' && (
                <Field
                  label="Время снятия стопа"
                  htmlFor="untilLocal"
                  error={errors.untilLocal?.message}
                  hint="Не позже чем через 24 часа, шаг 15 минут."
                >
                  <Input
                    id="untilLocal"
                    type="datetime-local"
                    step={900}
                    min={minLocal}
                    max={maxLocal}
                    invalid={!!errors.untilLocal}
                    {...register('untilLocal')}
                  />
                </Field>
              )}

              <div className="mt-auto flex gap-3 pt-4">
                <Button type="submit" loading={isSubmitting} className="flex-1">
                  {isEdit ? 'Сохранить' : 'В стоп-лист'}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Отмена
                </Button>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
