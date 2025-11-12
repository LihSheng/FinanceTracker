import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { budgetCategorySchema } from "@/lib/validations/budget";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Verify budget belongs to user
    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Not Found", message: "Budget not found" },
        { status: 404 }
      );
    }

    const categories = await prisma.budgetCategory.findMany({
      where: {
        budgetId: params.id,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    // Calculate spent amount for each category
    const categoriesWithSpent = await Promise.all(
      categories.map(async (category: any) => {
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

    return NextResponse.json(categoriesWithSpent);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validatedData = budgetCategorySchema.parse(body);

    // Verify budget belongs to user
    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        categories: true,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Not Found", message: "Budget not found" },
        { status: 404 }
      );
    }

    // Validate total allocation doesn't exceed budget
    const currentAllocated = budget.categories.reduce(
      (sum: number, cat: any) => sum + Number(cat.allocatedAmount),
      0
    );
    const newTotal = currentAllocated + validatedData.allocatedAmount;

    if (newTotal > Number(budget.totalAmount)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Total allocated amount would exceed budget total",
        },
        { status: 400 }
      );
    }

    const category = await prisma.budgetCategory.create({
      data: {
        budgetId: params.id,
        name: validatedData.name,
        allocatedAmount: validatedData.allocatedAmount,
        color: validatedData.color,
      },
    });

    return NextResponse.json(category, { status: 201 });
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

    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create category" },
      { status: 500 }
    );
  }
}
