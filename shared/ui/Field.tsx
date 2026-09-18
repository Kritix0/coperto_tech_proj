import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Обёртка поля: лейбл сверху, ошибка красным текстом под полем. */
export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  const errorId = `${htmlFor}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-ink text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-muted text-xs">{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className="text-danger text-xs font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
