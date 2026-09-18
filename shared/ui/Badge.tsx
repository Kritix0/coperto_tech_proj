import type { ReactNode } from 'react';
import { cn } from './cn';

type Tone = 'neutral' | 'accent' | 'muted' | 'success';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface text-ink border border-line',
  accent: 'bg-accent/10 text-accent border border-accent/20',
  muted: 'bg-surface text-muted border border-line',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
