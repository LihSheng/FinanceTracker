import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateExcelExport, type ExportOptions } from '@/lib/utils/excel-export';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { dataTypes, startDate, endDate } = body as {
      dataTypes: ('transactions' | 'budgets' | 'portfolio' | 'forecasts')[];
      startDate?: string;
      endDate?: string;
    };
    
    if (!dataTypes || dataTypes.length === 0) {
      return NextResponse.json(
        { error: 'At least one data type must be selected' },
        { status: 400 }
      );
    }
    
    const options: ExportOptions = {
      dataTypes,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };
    
    // Fetch data based on selected types
    const data: any = {};
    
    // Fetch transactions
    if (dataTypes.includes('transactions')) {
      const whereClause: any = { userId: user.id };
      
      if (options.startDate || options.endDate) {
        whereClause.date = {};
        if (options.startDate) {
          whereClause.date.gte = options.startDate;
        }
        if (options.endDate) {
          whereClause.date.lte = options.endDate;
        }
      }
      
      data.transactions = await prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: {
          date: 'desc',
        },
      });
    }
    
    // Fetch budgets
    if (dataTypes.includes('budgets')) {
      data.budgets = await prisma.budget.findMany({
        where: { userId: user.id },
        include: {
          categories: {
            include: {
              transactions: {
                select: {
                  amount: true,
                  type: true,
                },
              },
            },
          },
        },
      });
      
      // Calculate spent amounts for each category
      data.budgets = data.budgets.map((budget: any) => ({
        ...budget,
        categories: budget.categories.map((category: any) => {
          const spentAmount = category.transactions
            .filter((t: any) => t.type === 'expense')
            .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
          
          return {
            ...category,
            spentAmount,
          };
        }),
      }));
    }
    
    // Fetch portfolio assets
    if (dataTypes.includes('portfolio')) {
      const whereClause: any = { userId: user.id };
      
      if (options.startDate || options.endDate) {
        whereClause.purchaseDate = {};
        if (options.startDate) {
          whereClause.purchaseDate.gte = options.startDate;
        }
        if (options.endDate) {
          whereClause.purchaseDate.lte = options.endDate;
        }
      }
      
      data.assets = await prisma.asset.findMany({
        where: whereClause,
        orderBy: {
          purchaseDate: 'desc',
        },
      });
    }
    
    // Fetch forecasts
    if (dataTypes.includes('forecasts')) {
      const whereClause: any = { userId: user.id };
      
      if (options.startDate || options.endDate) {
        whereClause.createdAt = {};
        if (options.startDate) {
          whereClause.createdAt.gte = options.startDate;
        }
        if (options.endDate) {
          whereClause.createdAt.lte = options.endDate;
        }
      }
      
      data.forecasts = await prisma.forecast.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
    
    // Generate Excel file
    const buffer = await generateExcelExport(data, options);
    
    // Return the file
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="finance-tracker-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate export', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
