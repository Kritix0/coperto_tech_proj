import { NextResponse } from 'next/server';
import { getAllItems } from '@/server/menu-store';
import { LIST_DELAY_MS, delay } from '@/server/sim';

// Данные читаются из in-memory стора на каждый запрос — без статического кэша.
export const dynamic = 'force-dynamic';

export async function GET() {
  await delay(LIST_DELAY_MS);
  return NextResponse.json(getAllItems());
}
