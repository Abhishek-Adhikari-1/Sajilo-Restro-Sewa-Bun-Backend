import { AppError } from "../../utils/app-error";
import { HTTP_STATUS } from "../../utils/http-status";
import { ImageRepository as repo } from "./image.repository";
import type { Image } from "../../db/index";
import {
  uploadImageToCloud,
  deleteImageFromCloud,
} from "../../utils/image-helper";

export abstract class ImageService {
  static async uploadImage(file: File, folder: string): Promise<Image> {
    try {
      // 1. Upload to Cloudinary using the custom helper
      const result = await uploadImageToCloud(file, folder);

      // 2. Save to database
      const image = await repo.createImage({
        publicId: result.public_id,
        assetId: result.asset_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        resourceType: result.resource_type,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        folder: result.folder,
      });

      return image;
    } catch (error) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to upload image.",
      );
    }
  }

  static async deleteImage(imageId: string): Promise<void> {
    const image = await repo.findImageById(imageId);
    if (!image) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Image not found");
    }

    try {
      // 1. Delete from Cloudinary using the custom helper
      await deleteImageFromCloud(image.publicId);

      // 2. Delete from database
      await repo.deleteImageById(imageId);
    } catch (error) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to delete image",
      );
    }
  }
}
