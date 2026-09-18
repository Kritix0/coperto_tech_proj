'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { MenuItem } from '@/types/menu';
import { SHOP_LABELS, STOP_REASON_LABELS } from '@/shared/domain';
import { formatUntil } from '@/shared/format';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/ui/cn';

interface StopListTableProps {
  items: MenuItem[];
  savingIds: string[];
  onStop: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
  onResume: (item: MenuItem) => void;
}

/** Чистая презентация таблицы: без запросов, только пропсы и колбэки. */
export function StopListTable({ items, savingIds, onStop, onEdit, onResume }: StopListTableProps) {
  return (
    <div className="border-line bg-card overflow-hidden rounded-xl border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-line text-muted border-b text-left text-xs tracking-wide uppercase">
            <th className="px-4 py-3 font-medium">Позиция</th>
            <th className="px-4 py-3 font-medium">Цех</th>
            <th className="px-4 py-3 font-medium">Остаток</th>
            <th className="px-4 py-3 font-medium">Статус</th>
            <th className="px-4 py-3 text-right font-medium">Действие</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <Row
              key={item.id}
              item={item}
              saving={savingIds.includes(item.id)}
              onStop={onStop}
              onEdit={onEdit}
              onResume={onResume}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface RowProps {
  item: MenuItem;
  saving: boolean;
  onStop: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
  onResume: (item: MenuItem) => void;
}

function Row({ item, saving, onStop, onEdit, onResume }: RowProps) {
  const stopped = item.status.kind === 'stopped';
  const resumeDisabled = item.stock === 0;

  return (
    <tr
      className={cn(
        'border-line border-b align-middle transition-colors last:border-b-0',
        stopped ? 'bg-surface/60' : 'bg-card',
      )}
    >
      <td className="px-4 py-3">
        <div className={cn('font-medium', stopped ? 'text-muted' : 'text-ink')}>{item.title}</div>
        {saving && (
          <span className="text-accent mt-0.5 inline-flex items-center gap-1 text-xs">
            <motion.span
              className="bg-accent h-1.5 w-1.5 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            сохраняется…
          </span>
        )}
      </td>

      <td className="px-4 py-3">
        <Badge tone="neutral">{SHOP_LABELS[item.shop]}</Badge>
      </td>

      <td className="px-4 py-3">
        <span className={cn('tabular-nums', item.stock === 0 && 'text-danger font-semibold')}>
          {item.stock}
        </span>
      </td>

      {/* Смена статуса анимируется на уровне ячейки, а не строки —
          так не ломается раскладка таблицы. */}
      <td className="px-4 py-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.status.kind}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {item.status.kind === 'stopped' ? (
              <div className="flex flex-col gap-1">
                <Badge tone="accent">{STOP_REASON_LABELS[item.status.reason]}</Badge>
                <span className="text-muted text-xs">{formatUntil(item.status.until)}</span>
              </div>
            ) : (
              <Badge tone="success">В продаже</Badge>
            )}
          </motion.div>
        </AnimatePresence>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {stopped ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => onEdit(item)} disabled={saving}>
                Изменить
              </Button>
              <span title={resumeDisabled ? 'Остаток 0 — сначала пополните запас' : undefined}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onResume(item)}
                  disabled={saving || resumeDisabled}
                >
                  Вернуть в продажу
                </Button>
              </span>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => onStop(item)} disabled={saving}>
              В стоп-лист
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
