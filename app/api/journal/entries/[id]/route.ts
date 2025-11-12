import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateJournalEntrySchema } from '@/lib/validations/journal';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            ticker: true,
            platform: true,
            buyPrice: true,
            currentPrice: true,
            units: true,
            currency: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateJournalEntrySchema.parse(body);

    const existing = await prisma.journalEntry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.content !== undefined) updateData.content = validated.content;
    if (validated.emotionTags !== undefined) updateData.emotionTags = validated.emotionTags;
    if (validated.tradeType !== undefined) updateData.tradeType = validated.tradeType;
    if (validated.outcome !== undefined) updateData.outcome = validated.outcome;
    if (validated.date !== undefined) updateData.date = new Date(validated.date);
    if (validated.assetId !== undefined) updateData.assetId = validated.assetId;

    const entry = await prisma.journalEntry.update({
      where: { id: params.id },
      data: updateData,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            ticker: true,
            platform: true,
          },
        },
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.journalEntry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    await prisma.journalEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}
