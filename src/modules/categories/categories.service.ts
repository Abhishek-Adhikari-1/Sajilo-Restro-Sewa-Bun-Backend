import { CategoriesRepo } from "./categories.repository";

export abstract class CategoriesService {
  static async getAllCategories(limit: number = 25, offset: number = 0) {
    return await CategoriesRepo.findAllCategories(undefined, limit, offset);
  }
}
