import { BudgetProfile, IncomeRecord, ExpenseRecord, ExpenseCategory, Budget, BudgetSummary } from '@/types';
import prisma from '@/lib/prisma';

interface GetExpensesOptions {
  page?: number;
  limit?: number;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  isRecurring?: boolean;
}

export class BudgetService {
  async getBudgetProfile(userId: string): Promise<BudgetProfile | null> {
    const profile = await prisma.budgetProfile.findUnique({
      where: { userId },
    });
    return profile as unknown as BudgetProfile | null;
  }

  async createBudgetProfile(userId: string, data: { monthlyIncome: number; currency: string; savingsGoal?: number; profileType?: string; city?: string; familySize?: number; monthlyRent?: number }): Promise<BudgetProfile> {
    const profile = await prisma.budgetProfile.upsert({
      where: { userId },
      update: {
        monthlyIncome: data.monthlyIncome,
        currency: data.currency,
        savingsGoal: data.savingsGoal,
        ...(data.profileType !== undefined && { profileType: data.profileType }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.familySize !== undefined && { familySize: data.familySize }),
        ...(data.monthlyRent !== undefined && { monthlyRent: data.monthlyRent }),
      },
      create: {
        userId,
        monthlyIncome: data.monthlyIncome,
        currency: data.currency,
        savingsGoal: data.savingsGoal,
        profileType: data.profileType,
        city: data.city,
        familySize: data.familySize,
        monthlyRent: data.monthlyRent,
      },
    });
    return profile as unknown as BudgetProfile;
  }

  async addIncome(budgetProfileId: string, data: { source: string; amount: number; frequency: string }): Promise<IncomeRecord> {
    const record = await prisma.incomeRecord.create({
      data: {
        budgetProfileId,
        source: data.source,
        amount: data.amount,
        frequency: data.frequency,
      },
    });
    return record as unknown as IncomeRecord;
  }

  async addExpense(budgetProfileId: string, data: { categoryId: string; amount: number; description?: string; date: Date; isRecurring?: boolean; recurringFrequency?: string }): Promise<ExpenseRecord> {
    const [record] = await prisma.$transaction([
      prisma.expenseRecord.create({
        data: {
          budgetProfileId,
          categoryId: data.categoryId,
          amount: data.amount,
          description: data.description,
          date: data.date,
          isRecurring: data.isRecurring ?? false,
          recurringFrequency: data.recurringFrequency,
        },
      }),
      prisma.budget.updateMany({
        where: {
          budgetProfileId,
          categoryId: data.categoryId,
          period: 'monthly',
        },
        data: {
          spent: { increment: data.amount },
        },
      }),
    ]);
    return record as unknown as ExpenseRecord;
  }

  async getCategories(userId?: string): Promise<ExpenseCategory[]> {
    const where = userId
      ? { OR: [{ isDefault: true }, { userId }] }
      : { isDefault: true };

    let categories = await prisma.expenseCategory.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // If no categories exist and we have a userId, seed default categories
    if (categories.length === 0 && userId) {
      const defaultCategories = [
        { name: 'Food', icon: '🍔' },
        { name: 'Transport', icon: '🚗' },
        { name: 'Shopping', icon: '🛍️' },
        { name: 'Entertainment', icon: '🎬' },
        { name: 'Bills', icon: '📄' },
        { name: 'Healthcare', icon: '🏥' },
        { name: 'Education', icon: '📚' },
        { name: 'Rent', icon: '🏠' },
        { name: 'Utilities', icon: '💡' },
        { name: 'Other', icon: '📦' },
      ];

      await prisma.expenseCategory.createMany({
        data: defaultCategories.map((cat) => ({
          name: cat.name,
          icon: cat.icon,
          isDefault: true,
          userId: null,
        })),
      });

      categories = await prisma.expenseCategory.findMany({
        where: { isDefault: true },
        orderBy: { name: 'asc' },
      });
    }

    return categories as ExpenseCategory[];
  }

  async getIncomeRecords(userId: string) {
    const profile = await prisma.budgetProfile.findUnique({
      where: { userId },
    });

    if (!profile) return [];

    const records = await prisma.incomeRecord.findMany({
      where: { budgetProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => ({
      id: record.id,
      source: record.source,
      amount: Number(record.amount),
      frequency: record.frequency,
    }));
  }

  async getBudgetSummary(userId: string): Promise<BudgetSummary> {
    const profile = await prisma.budgetProfile.findUnique({
      where: { userId },
      include: {
        incomeRecords: true,
        expenseRecords: true,
      },
    });

    if (!profile) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        savings: 0,
        savingsRate: 0,
        categoryBreakdown: [],
      };
    }

    let totalIncome = 0;
    for (const record of profile.incomeRecords) {
      const amount = Number(record.amount);
      switch (record.frequency) {
        case 'weekly':
          totalIncome += amount * 4.33;
          break;
        case 'biweekly':
          totalIncome += amount * 2.17;
          break;
        case 'monthly':
          totalIncome += amount;
          break;
        case 'yearly':
          totalIncome += amount / 12;
          break;
        case 'one_time':
          break;
      }
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    let totalExpenses = 0;
    const categoryAmounts: Record<string, number> = {};

    for (const record of profile.expenseRecords) {
      const date = new Date(record.date);
      if (date >= startOfMonth && date <= endOfMonth) {
        const amount = Number(record.amount);
        totalExpenses += amount;
        categoryAmounts[record.categoryId] = (categoryAmounts[record.categoryId] ?? 0) + amount;
      }
    }

    const categoryIds = Object.keys(categoryAmounts);
    const catRecords = categoryIds.length > 0
      ? await prisma.expenseCategory.findMany({ where: { id: { in: categoryIds } } })
      : [];

    const categoryNameMap: Record<string, string> = {};
    for (const cat of catRecords) {
      categoryNameMap[cat.id] = cat.name;
    }

    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    const categoryBreakdown = Object.entries(categoryAmounts).map(([categoryId, amount]) => ({
      category: categoryNameMap[categoryId] ?? categoryId,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }));

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      savingsRate: Math.round(savingsRate * 100) / 100,
      categoryBreakdown,
    };
  }

  async setBudget(budgetProfileId: string, categoryId: string, amount: number, period: string): Promise<Budget> {
    const budget = await prisma.budget.upsert({
      where: {
        budgetProfileId_categoryId_period: {
          budgetProfileId,
          categoryId,
          period,
        },
      },
      update: { amount },
      create: {
        budgetProfileId,
        categoryId,
        amount,
        period,
      },
    });
    return budget as unknown as Budget;
  }

  async parseConversationalInput(text: string): Promise<{ type: string; data: Record<string, unknown> } | null> {
    const lower = text.toLowerCase().trim();
    const dollarRegex = /\$?\s*(\d+(?:\.\d{1,2})?)/;

    if (lower.includes('save') || lower.includes('saving')) {
      const match = lower.match(dollarRegex);
      if (match) {
        const amount = parseFloat(match[1]);
        const rest = lower.replace(match[0], ' ').trim();
        const titleMatch = rest.match(/(?:for|towards|to)\s+(.+)/i);
        return {
          type: 'savings_goal',
          data: {
            targetAmount: amount,
            ...(titleMatch ? { title: titleMatch[1].trim() } : {}),
          },
        };
      }
    }

    if (lower.includes('budget')) {
      const match = lower.match(dollarRegex);
      if (match) {
        const amount = parseFloat(match[1]);
        const rest = lower.replace(match[0], ' ').trim();
        const catMatch = rest.match(/(?:for|of|on)\s+(.+)/i);
        return {
          type: 'budget',
          data: {
            amount,
            ...(catMatch ? { category: catMatch[1].trim() } : {}),
          },
        };
      }
    }

    if (lower.includes('spent') || lower.includes('bought') || lower.includes('paid') || lower.includes('purchase')) {
      const match = lower.match(dollarRegex);
      if (match) {
        const amount = parseFloat(match[1]);
        const rest = lower.replace(match[0], ' ').trim();
        const descMatch = rest.match(/(?:on|for)\s+(.+)/i);
        return {
          type: 'expense',
          data: {
            amount,
            ...(descMatch ? { description: descMatch[1].trim() } : {}),
          },
        };
      }
    }

    if (lower.includes('income') || lower.includes('earned') || lower.includes('salary') || lower.includes('paycheck')) {
      const match = lower.match(dollarRegex);
      if (match) {
        const amount = parseFloat(match[1]);
        return {
          type: 'income',
          data: { amount, source: 'conversational' },
        };
      }
    }

    const fallbackAmount = lower.match(dollarRegex);
    if (fallbackAmount) {
      const amount = parseFloat(fallbackAmount[1]);
      if (lower.includes('expense') || lower.includes('cost') || lower.includes('spending')) {
        return { type: 'expense', data: { amount } };
      }
      if (lower.includes('income') || lower.includes('earning')) {
        return { type: 'income', data: { amount, source: 'conversational' } };
      }
      if (lower.includes('budget') || lower.includes('limit')) {
        return { type: 'budget', data: { amount } };
      }
    }

    return null;
  }

  async getSavingsGoals(userId: string) {
    const goals = await prisma.savingsGoal.findMany({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });
    return goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      monthlyContribution: goal.monthlyContribution != null ? Number(goal.monthlyContribution) : 0,
      deadline: goal.deadline ? goal.deadline.toISOString() : null,
    }));
  }

  async createSavingsGoal(userId: string, data: { title: string; targetAmount: number; deadline?: Date; monthlyContribution?: number }) {
    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        title: data.title,
        targetAmount: data.targetAmount,
        deadline: data.deadline,
        monthlyContribution: data.monthlyContribution,
      },
    });
    return goal;
  }

  async updateSavingsGoal(goalId: string, userId: string, data: { title?: string; targetAmount?: number; currentAmount?: number; deadline?: Date; status?: string; monthlyContribution?: number }) {
    const goal = await prisma.savingsGoal.update({
      where: {
        id: goalId,
        userId,
      },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
        ...(data.currentAmount !== undefined && { currentAmount: data.currentAmount }),
        ...(data.deadline !== undefined && { deadline: data.deadline }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.monthlyContribution !== undefined && { monthlyContribution: data.monthlyContribution }),
      },
    });
    return goal;
  }

  async getSpendingAnalysis(userId: string, months: number = 6) {
    const profile = await prisma.budgetProfile.findUnique({
      where: { userId },
    });

    if (!profile) return [];

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const expenses = await prisma.expenseRecord.findMany({
      where: {
        budgetProfileId: profile.id,
        date: { gte: startDate },
      },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    const monthMap: Record<string, Record<string, number>> = {};

    for (const expense of expenses) {
      const d = new Date(expense.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = {};
      const name = expense.category.name;
      monthMap[key][name] = (monthMap[key][name] ?? 0) + Number(expense.amount);
    }

    return Object.entries(monthMap).map(([month, categories]) => ({
      month,
      categories: Object.entries(categories).map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
      })),
    }));
  }

  async getExpenses(userId: string, options?: GetExpensesOptions) {
    const profile = await prisma.budgetProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return { data: [], total: 0, page: options?.page ?? 1, limit: options?.limit ?? 20, totalPages: 0 };
    }

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: {
      budgetProfileId: string;
      categoryId?: string;
      date?: { gte?: Date; lte?: Date };
      isRecurring?: boolean;
    } = { budgetProfileId: profile.id };

    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (options?.startDate || options?.endDate) {
      where.date = {};
      if (options.startDate) where.date.gte = options.startDate;
      if (options.endDate) where.date.lte = options.endDate;
    }

    if (options?.isRecurring !== undefined) {
      where.isRecurring = options.isRecurring;
    }

    const [rows, total] = await Promise.all([
      prisma.expenseRecord.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.expenseRecord.count({ where }),
    ]);

    const data = rows.map((record) => ({
      id: record.id,
      categoryId: record.categoryId,
      category: record.category?.name ?? record.categoryId,
      amount: Number(record.amount),
      description: record.description,
      date: record.date ? new Date(record.date).toISOString() : null,
      isRecurring: record.isRecurring,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const budgetService = new BudgetService();
