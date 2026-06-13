import { eq, and, ilike, count } from "drizzle-orm";
import { db, type TX } from "../../config/db";
import { categories } from "../../db/schema/category.schema";
import { images } from "../../db/schema/image.schema";

export class CategoriesRepo {
  private static conn(tx?: TX) {
    return tx ?? db;
  }

  static async findAllCategories(tx?: TX, limit = 25, offset = 0, search?: string) {
    const conditions = [];
    if (search && search.trim() !== "") {
      conditions.push(ilike(categories.name, `%${search.trim()}%`));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await this.conn(tx)
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        icon: images.secureUrl,
        iconId: categories.iconId,
      })
      .from(categories)
      .leftJoin(images, eq(categories.iconId, images.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset);
  }

  static async countCategories(tx?: TX, search?: string) {
    const conditions = [];
    if (search && search.trim() !== "") {
      conditions.push(ilike(categories.name, `%${search.trim()}%`));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await this.conn(tx)
      .select({ count: count() })
      .from(categories)
      .where(whereClause);

    return result[0]?.count ?? 0;
  }

  static async createCategory(
    data: { name: string; description?: string; iconId?: string; isActive?: boolean },
    tx?: TX,
  ) {
    const [result] = await this.conn(tx)
      .insert(categories)
      .values({
        name: data.name,
        description: data.description,
        iconId: data.iconId,
        isActive: data.isActive ?? true,
      })
      .returning();

    if (!result) return null;

    // To return the same structure as findAllCategories (with icon URL)
    if (result.iconId) {
      const img = await this.conn(tx)
        .select({ secureUrl: images.secureUrl })
        .from(images)
        .where(eq(images.id, result.iconId))
        .limit(1);
      return {
        ...result,
        icon: img[0]?.secureUrl ?? null,
      };
    }

    return {
      ...result,
      icon: null,
    };
  }

  static async updateCategory(
    id: string,
    data: { name?: string; description?: string; iconId?: string | null; isActive?: boolean },
    tx?: TX,
  ) {
    const [result] = await this.conn(tx)
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    if (!result) return null;

    if (result.iconId) {
      const img = await this.conn(tx)
        .select({ secureUrl: images.secureUrl })
        .from(images)
        .where(eq(images.id, result.iconId))
        .limit(1);
      return {
        ...result,
        icon: img[0]?.secureUrl ?? null,
      };
    }

    return {
      ...result,
      icon: null,
    };
  }

  static async deleteCategory(id: string, tx?: TX) {
    const [result] = await this.conn(tx)
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    return result ?? null;
  }
}

