import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { images, type NewImage, type Image } from "../../db/index";

export abstract class ImageRepository {
  static async createImage(data: NewImage): Promise<Image> {
    const result = await db.insert(images).values(data).returning();
    return result[0]!;
  }

  static async findImageById(id: string): Promise<Image | null> {
    const result = await db
      .select()
      .from(images)
      .where(eq(images.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  static async deleteImageById(id: string): Promise<void> {
    await db.delete(images).where(eq(images.id, id));
  }
}
