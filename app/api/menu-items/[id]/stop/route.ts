import { NextRequest, NextResponse } from 'next/server';
import { applyStop, StoreError } from '@/server/menu-store';
import { stopItemPayloadSchema } from '@/features/stop-list/model/schema';
import { MUTATION_DELAY_MS, delay, shouldFail } from '@/server/sim';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Валидация той же схемой, что и на клиенте — правила не расходятся.
  const body: unknown = await req.json().catch(() => null);
  const parsed = stopItemPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Некорректные данные', issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  await delay(MUTATION_DELAY_MS);
  if (shouldFail()) {
    return NextResponse.json(
      { error: 'Сервер временно недоступен, попробуйте ещё раз' },
      { status: 503 },
    );
  }

  try {
    const item = applyStop(id, parsed.data);
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
