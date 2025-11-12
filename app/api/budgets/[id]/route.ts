import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { updateBudgetSchema } from "@/lib/validations/budget";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
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
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Not Found", message: "Budget not found" },
        { status: 404 }
      );
    }

    // Calculate spent amount for each category
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

    return NextResponse.json({
      ...budget,
      categories: categoriesWithSpent,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch budget" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validatedData = updateBudgetSchema.parse(body);

    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Not Found", message: "Budget not found" },
        { status: 404 }
      );
    }

    const budget = await prisma.budget.update({
      where: {
        id: params.id,
      },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.totalAmount && { totalAmount: validatedData.totalAmount }),
        ...(validatedData.period && { period: validatedData.period }),
        ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
        ...(validatedData.endDate !== undefined && {
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        }),
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(budget);
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

    console.error("Error updating budget:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update budget" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Not Found", message: "Budget not found" },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Budget deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete budget" },
      { status: 500 }
    );
  }
}
