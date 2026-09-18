import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // В родительской папке есть посторонний lockfile - фиксируем корень трейсинга,
  // чтобы Next не выбирал его как workspace root.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
