import { eq } from "drizzle-orm";
import { db, type TX } from "../../config/db";
import { categories } from "../../db/schema/category.schema";
import { images } from "../../db/schema/image.schema";

export class CategoriesRepo {
  private static conn(tx?: TX) {
    return tx ?? db;
  }

  static async findAllCategories(tx?: TX, limit = 25, offset = 0) {
    return await this.conn(tx)
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        icon: images.secureUrl,
      })
      .from(categories)
      .leftJoin(images, eq(categories.iconId, images.id))
      .limit(limit)
      .offset(offset);
  }
}
