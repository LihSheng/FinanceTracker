import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { updateBudgetCategorySchema } from "@/lib/validations/budget";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validatedData = updateBudgetCategorySchema.parse(body);

    // Verify budget belongs to user and category exists
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

    const existingCategory = budget.categories.find(
      (cat: any) => cat.id === params.categoryId
    );

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Not Found", message: "Category not found" },
        { status: 404 }
      );
    }

    // If updating allocated amount, validate total doesn't exceed budget
    if (validatedData.allocatedAmount !== undefined) {
      const otherCategoriesTotal = budget.categories
        .filter((cat: any) => cat.id !== params.categoryId)
        .reduce((sum: number, cat: any) => sum + Number(cat.allocatedAmount), 0);

      const newTotal = otherCategoriesTotal + validatedData.allocatedAmount;

      if (newTotal > Number(budget.totalAmount)) {
        return NextResponse.json(
          {
            error: "Validation Error",
            message: "Total allocated amount would exceed budget total",
          },
          { status: 400 }
        );
      }
    }

    const category = await prisma.budgetCategory.update({
      where: {
        id: params.categoryId,
      },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.allocatedAmount !== undefined && {
          allocatedAmount: validatedData.allocatedAmount,
        }),
        ...(validatedData.color !== undefined && { color: validatedData.color }),
      },
    });

    return NextResponse.json(category);
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

    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const user = await requireAuth();

    // Verify budget belongs to user and category exists
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

    const existingCategory = budget.categories.find(
      (cat: any) => cat.id === params.categoryId
    );

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Not Found", message: "Category not found" },
        { status: 404 }
      );
    }

    await prisma.budgetCategory.delete({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
