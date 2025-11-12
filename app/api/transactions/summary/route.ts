import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Calculate total income
    const incomeResult = await prisma.transaction.aggregate({
      where: {
        ...where,
        type: "income",
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Calculate total expenses
    const expenseResult = await prisma.transaction.aggregate({
      where: {
        ...where,
        type: "expense",
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Get category breakdown
    const categoryBreakdown = await prisma.transaction.groupBy({
      by: ["categoryId", "type"],
      where,
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Fetch category details
    const categoryIds = categoryBreakdown
      .map((item: any) => item.categoryId)
      .filter((id: any): id is string => id !== null);

    const categories = await prisma.budgetCategory.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
        allocatedAmount: true,
      },
    });

    const categoryMap = new Map(categories.map((cat: any) => [cat.id, cat]));

    // Format category breakdown with details
    const formattedBreakdown = categoryBreakdown.map((item: any) => {
      const category: any = item.categoryId ? categoryMap.get(item.categoryId) : null;
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || "Uncategorized",
        color: category?.color,
        allocatedAmount: category?.allocatedAmount
          ? Number(category.allocatedAmount)
          : null,
        type: item.type,
        amount: Number(item._sum.amount || 0),
        count: item._count,
      };
    });

    const totalIncome = Number(incomeResult._sum.amount || 0);
    const totalExpenses = Number(expenseResult._sum.amount || 0);
    const netBalance = totalIncome - totalExpenses;

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netBalance,
      incomeCount: incomeResult._count,
      expenseCount: expenseResult._count,
      categoryBreakdown: formattedBreakdown,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    console.error("Error fetching transaction summary:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch transaction summary",
      },
      { status: 500 }
    );
  }
}
