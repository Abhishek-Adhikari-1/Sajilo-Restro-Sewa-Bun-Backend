import { MenusRepo } from "./menus.repository";
import { HTTP_STATUS } from "../../utils/http-status";
import { io } from "../../app";
import { AppError } from "../../utils/app-error";
import type { NewMenu } from "../../db";
import type { MenusModel } from "./menus.model";

export abstract class MenusService {
  static async getAllMenus(
    categoryId?: string,
    isAvailable?: boolean,
    search?: string,
    limit: number = 20,
    offset: number = 0,
  ) {
    const menus = await MenusRepo.findAllMenus(
      undefined,
      categoryId,
      isAvailable,
      search,
      limit,
      offset,
    );
    const total = await MenusRepo.countMenus(
      undefined,
      categoryId,
      isAvailable,
      search,
    );
    return { menus, total };
  }

  static async getMenuById(id: string) {
    const menu = await MenusRepo.findMenuById(id);
    if (!menu) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Menu item not found");
    }
    return menu;
  }

  static async updateMenuStatus(id: string, isAvailable: boolean) {
    const menu = await MenusRepo.findMenuById(id);
    if (!menu) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Menu item not found");
    }

    const updatedMenu = await MenusRepo.updateMenuStatus(id, isAvailable);

    if (!updatedMenu)
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to update menu item",
      );

    const completeMenu = await MenusRepo.findMenuById(id);

    io.emit("menu_status_updated", {
      id: completeMenu!.id,
      name: completeMenu!.name,
      isAvailable: completeMenu!.isAvailable,
      updatedAt: completeMenu!.updatedAt,
    });

    return completeMenu!;
  }

  static async createMenu(data: MenusModel["createMenuBody"]) {
    const menu = await MenusRepo.createMenu(data);

    if (!menu)
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to create menu item",
      );

    io.emit("menu_updated", {
      id: menu.id,
      name: menu.name,
      isAvailable: menu.isAvailable,
      description: menu.description,
      price: menu.price,
      estimatedPreparationTime: menu.estimatedPreparationTime,
      imageId: menu.imageId,
      categoryId: menu.categoryId,
    });

    return menu!;
  }

  static async updateMenu(id: string, data: MenusModel["updateMenuBody"]) {
    const existing = await MenusRepo.findMenuById(id);

    if (!existing)
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Menu item not found");

    await MenusRepo.updateMenu(id, data);

    const completeMenu = await MenusRepo.findMenuById(id);

    io.emit("menu_updated", { menu: completeMenu });

    return completeMenu!;
  }

  static async deleteMenu(id: string) {
    const existing = await MenusRepo.findMenuById(id);
    if (!existing)
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Menu item not found");

    await MenusRepo.deleteMenu(id);

    io.emit("menu_deleted", { id });

    return {};
  }
}
