import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { createBudgetSchema } from "@/lib/validations/budget";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
      },
      include: {
        categories: {
          include: {
            _count: {
              select: {
                transactions: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate spent amount for each category
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget: any) => {
        const categoriesWithSpent = await Promise.all(
          budget.categories.map(async (category: any) => {
            const spent = await prisma.transaction.aggregate({
              where: {
                categoryId: category.id,
                type: "expense",
              },
              _sum: {
                amount: true,
              },
            });

            return {
              ...category,
              spentAmount: spent._sum.amount || 0,
            };
          })
        );

        return {
          ...budget,
          categories: categoriesWithSpent,
        };
      })
    );

    return NextResponse.json(budgetsWithSpent);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validatedData = createBudgetSchema.parse(body);

    // Validate total allocation doesn't exceed budget
    const totalAllocated = validatedData.categories.reduce(
      (sum, cat) => sum + cat.allocatedAmount,
      0
    );

    if (totalAllocated > validatedData.totalAmount) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Total allocated amount exceeds budget total",
        },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        totalAmount: validatedData.totalAmount,
        period: validatedData.period,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        categories: {
          create: validatedData.categories.map((cat) => ({
            name: cat.name,
            allocatedAmount: cat.allocatedAmount,
            color: cat.color,
          })),
        },
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation Error", message: error.message },
        { status: 400 }
      );
    }

    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create budget" },
      { status: 500 }
    );
  }
}
