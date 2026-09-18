import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from './cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'bg-card text-ink h-10 w-full rounded-lg border px-3 text-sm transition-colors',
        'focus-visible:ring-accent/40 focus-visible:ring-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid ? 'border-danger' : 'border-line',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});
