import { eq, and, ilike, or, count } from "drizzle-orm";
import { db, type TX } from "../../config/db";
import { menus, type NewMenu } from "../../db/schema/menu.schema";
import { categories } from "../../db/schema/category.schema";
import { images } from "../../db";

export class MenusRepo {
  private static conn(tx?: TX) {
    return tx ?? db;
  }

  static async findAllMenus(
    tx?: TX,
    categoryId?: string,
    isAvailable?: boolean,
    search?: string,
    limit: number = 20,
    offset: number = 0,
  ) {
    const conditions = [];

    if (categoryId) {
      conditions.push(eq(menus.categoryId, categoryId));
    }

    if (isAvailable !== undefined) {
      conditions.push(eq(menus.isAvailable, isAvailable));
    }

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(menus.name, searchTerm),
          ilike(menus.description, searchTerm),
          ilike(categories.name, searchTerm),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const menuItems = await this.conn(tx)
      .select({
        id: menus.id,
        name: menus.name,
        description: menus.description,
        price: menus.price,
        estimatedPreparationTime: menus.estimatedPreparationTime,
        image: images.secureUrl,
        categoryId: menus.categoryId,
        categoryName: categories.name,
        isAvailable: menus.isAvailable,
        createdAt: menus.createdAt,
        updatedAt: menus.updatedAt,
      })
      .from(menus)
      .leftJoin(categories, eq(menus.categoryId, categories.id))
      .leftJoin(images, eq(menus.imageId, images.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return menuItems;
  }

  static async findMenuById(id: string, tx?: TX) {
    const [menuItem] = await this.conn(tx)
      .select({
        id: menus.id,
        name: menus.name,
        description: menus.description,
        price: menus.price,
        estimatedPreparationTime: menus.estimatedPreparationTime,
        image: images.secureUrl,
        imageId: menus.imageId,
        categoryId: menus.categoryId,
        categoryName: categories.name,
        isAvailable: menus.isAvailable,
        createdAt: menus.createdAt,
        updatedAt: menus.updatedAt,
      })
      .from(menus)
      .leftJoin(categories, eq(menus.categoryId, categories.id))
      .leftJoin(images, eq(menus.imageId, images.id))
      .where(eq(menus.id, id));
    return menuItem;
  }

  static async createMenu(data: NewMenu, tx?: TX) {
    const [menu] = await this.conn(tx).insert(menus).values(data).returning();
    return menu;
  }

  static async updateMenu(
    id: string,
    data: Partial<
      Pick<
        NewMenu,
        | "categoryId"
        | "name"
        | "description"
        | "price"
        | "estimatedPreparationTime"
        | "isAvailable"
        | "imageId"
      >
    >,
    tx?: TX,
  ) {
    const [menu] = await this.conn(tx)
      .update(menus)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(menus.id, id))
      .returning();
    return menu;
  }

  static async updateMenuStatus(id: string, isAvailable: boolean, tx?: TX) {
    const [menu] = await this.conn(tx)
      .update(menus)
      .set({ isAvailable, updatedAt: new Date() })
      .where(eq(menus.id, id))
      .returning();
    return menu;
  }

  static async deleteMenu(id: string, tx?: TX) {
    const [menu] = await this.conn(tx)
      .delete(menus)
      .where(eq(menus.id, id))
      .returning();
    return menu;
  }

  static async countMenus(
    tx?: TX,
    categoryId?: string,
    isAvailable?: boolean,
    search?: string,
  ) {
    const conditions = [];

    if (categoryId) {
      conditions.push(eq(menus.categoryId, categoryId));
    }

    if (isAvailable !== undefined) {
      conditions.push(eq(menus.isAvailable, isAvailable));
    }

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(menus.name, searchTerm),
          ilike(menus.description, searchTerm),
          ilike(categories.name, searchTerm),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [result] = await this.conn(tx)
      .select({ value: count() })
      .from(menus)
      .leftJoin(categories, eq(menus.categoryId, categories.id))
      .where(whereClause);

    return result?.value ?? 0;
  }
}
