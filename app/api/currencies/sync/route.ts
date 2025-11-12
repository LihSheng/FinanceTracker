import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncExchangeRates } from '@/lib/utils/currency';

/**
 * POST /api/currencies/sync
 * Manually trigger exchange rate sync
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await syncExchangeRates();

    return NextResponse.json({
      success: true,
      message: 'Exchange rates synced successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing exchange rates:', error);
    return NextResponse.json(
      { error: 'Failed to sync exchange rates' },
      { status: 500 }
    );
  }
}
