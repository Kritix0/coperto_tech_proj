/** Имитация реального бэкенда: сетевая задержка и нестабильность мутаций. */

export const LIST_DELAY_MS = 700;
export const MUTATION_DELAY_MS = 600;
export const MUTATION_FAILURE_RATE = 0.2; // ~20% мутаций падают

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** true примерно в 20% случаев - имитация флапающего сервера. */
export function shouldFail(): boolean {
  return Math.random() < MUTATION_FAILURE_RATE;
}
