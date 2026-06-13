import { CategoriesRepo } from "./categories.repository";

export abstract class CategoriesService {
  static async getAllCategories(limit: number = 25, offset: number = 0, search?: string) {
    const categories = await CategoriesRepo.findAllCategories(undefined, limit, offset, search);
    const total = await CategoriesRepo.countCategories(undefined, search);
    return { categories, total };
  }

  static async createCategory(data: { name: string; description?: string; iconId?: string; isActive?: boolean }) {
    return await CategoriesRepo.createCategory(data);
  }

  static async updateCategory(id: string, data: { name?: string; description?: string; iconId?: string | null; isActive?: boolean }) {
    return await CategoriesRepo.updateCategory(id, data);
  }

  static async deleteCategory(id: string) {
    return await CategoriesRepo.deleteCategory(id);
  }
}
