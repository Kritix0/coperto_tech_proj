'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUiStore, type Toast } from '@/features/stop-list/model/ui-store';
import { cn } from './cn';

const AUTO_DISMISS_MS = 5000;

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismissToast = useUiStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      role="status"
      className={cn(
        'bg-card pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-lg',
        toast.tone === 'error' ? 'border-danger/30' : 'border-emerald-200',
      )}
    >
      <span
        className={cn(
          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
          toast.tone === 'error' ? 'bg-danger' : 'bg-emerald-500',
        )}
      />
      <p className="text-ink flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-muted hover:text-ink transition-colors"
        aria-label="Закрыть уведомление"
      >
        ✕
      </button>
    </motion.div>
  );
}
