import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { journalEntrySchema, journalSearchSchema } from '@/lib/validations/journal';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const params = {
      search: searchParams.get('search') || undefined,
      emotionTag: searchParams.get('emotionTag') || undefined,
      tradeType: searchParams.get('tradeType') || undefined,
      outcome: searchParams.get('outcome') || undefined,
      assetId: searchParams.get('assetId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    };

    const validated = journalSearchSchema.parse(params);
    const page = parseInt(validated.page || '1');
    const limit = parseInt(validated.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      userId: session.user.id,
    };

    if (validated.search) {
      where.OR = [
        { title: { contains: validated.search, mode: 'insensitive' } },
        { content: { contains: validated.search, mode: 'insensitive' } },
      ];
    }

    if (validated.emotionTag) {
      where.emotionTags = { has: validated.emotionTag };
    }

    if (validated.tradeType) {
      where.tradeType = validated.tradeType;
    }

    if (validated.outcome) {
      where.outcome = validated.outcome;
    }

    if (validated.assetId) {
      where.assetId = validated.assetId;
    }

    if (validated.startDate || validated.endDate) {
      where.date = {};
      if (validated.startDate) {
        where.date.gte = new Date(validated.startDate);
      }
      if (validated.endDate) {
        where.date.lte = new Date(validated.endDate);
      }
    }

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
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
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = journalEntrySchema.parse(body);

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        title: validated.title,
        content: validated.content,
        emotionTags: validated.emotionTags,
        tradeType: validated.tradeType,
        outcome: validated.outcome,
        date: new Date(validated.date),
        assetId: validated.assetId,
      },
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

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}
