import { eq, desc, count, and, ilike } from "drizzle-orm";
import { db, type TX } from "../../config/db";
import { expenses } from "../../db/schema/expense.schema";

export class ExpensesRepo {
  private static conn(tx?: TX) {
    return tx ?? db;
  }

  static async findAllExpenses(tx?: TX, limit = 25, offset = 0, category?: string, search?: string) {
    const conditions = [];
    if (category && category.trim() !== "") {
      conditions.push(eq(expenses.category, category.trim()));
    }
    if (search && search.trim() !== "") {
      conditions.push(ilike(expenses.description, `%${search.trim()}%`));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await this.conn(tx)
      .select()
      .from(expenses)
      .where(whereClause)
      .orderBy(desc(expenses.createdAt))
      .limit(limit)
      .offset(offset);
  }

  static async countExpenses(tx?: TX, category?: string, search?: string) {
    const conditions = [];
    if (category && category.trim() !== "") {
      conditions.push(eq(expenses.category, category.trim()));
    }
    if (search && search.trim() !== "") {
      conditions.push(ilike(expenses.description, `%${search.trim()}%`));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await this.conn(tx)
      .select({ count: count() })
      .from(expenses)
      .where(whereClause);

    return result[0]?.count ?? 0;
  }

  static async createExpense(
    data: { description: string; amount: string; category: string; notes?: string; date: Date; createdBy?: string },
    tx?: TX,
  ) {
    const [result] = await this.conn(tx)
      .insert(expenses)
      .values({
        description: data.description,
        amount: data.amount,
        category: data.category,
        notes: data.notes,
        date: data.date,
        createdBy: data.createdBy,
      })
      .returning();

    return result ?? null;
  }

  static async updateExpense(
    id: string,
    data: { description?: string; amount?: string; category?: string; notes?: string; date?: Date },
    tx?: TX,
  ) {
    const [result] = await this.conn(tx)
      .update(expenses)
      .set({
        ...data,
      })
      .where(eq(expenses.id, id))
      .returning();

    return result ?? null;
  }

  static async deleteExpense(id: string, tx?: TX) {
    const [result] = await this.conn(tx)
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning();

    return result ?? null;
  }
}
