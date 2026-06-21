import { ExpensesRepo } from "./expenses.repository";

export class ExpensesService {
  static async getAllExpenses(limit?: number, offset?: number, category?: string, search?: string) {
    const expensesList = await ExpensesRepo.findAllExpenses(
      undefined,
      limit,
      offset,
      category,
      search,
    );
    const total = await ExpensesRepo.countExpenses(undefined, category, search);
    return { expenses: expensesList, total };
  }

  static async createExpense(data: {
    description: string;
    amount: string;
    category: string;
    notes?: string;
    date: Date;
    createdBy?: string;
  }) {
    const result = await ExpensesRepo.createExpense(data);
    if (!result) throw new Error("Failed to create expense");
    return result;
  }

  static async updateExpense(id: string, data: { description?: string; amount?: string; category?: string; notes?: string; date?: Date }) {
    const result = await ExpensesRepo.updateExpense(id, data);
    if (!result) throw new Error("Expense not found");
    return result;
  }

  static async deleteExpense(id: string) {
    const result = await ExpensesRepo.deleteExpense(id);
    if (!result) throw new Error("Expense not found or already deleted");
    return result;
  }
}
