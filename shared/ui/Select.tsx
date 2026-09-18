import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from './cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'bg-card text-ink h-10 w-full rounded-lg border px-3 text-sm transition-colors',
        'focus-visible:ring-accent/40 focus-visible:ring-2 focus-visible:outline-none',
        invalid ? 'border-danger' : 'border-line',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
});
