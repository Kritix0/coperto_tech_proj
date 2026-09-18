import { NextResponse } from 'next/server';
import { applyResume, StoreError } from '@/server/menu-store';
import { MUTATION_DELAY_MS, delay, shouldFail } from '@/server/sim';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await delay(MUTATION_DELAY_MS);
  if (shouldFail()) {
    return NextResponse.json(
      { error: 'Сервер временно недоступен, попробуйте ещё раз' },
      { status: 503 },
    );
  }

  try {
    const item = applyResume(id);
    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof StoreError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'not_found' ? 404 : 409 },
      );
    }
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}
