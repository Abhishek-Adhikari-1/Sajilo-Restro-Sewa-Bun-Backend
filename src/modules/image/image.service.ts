import { AppError } from "../../utils/app-error";
import { HTTP_STATUS } from "../../utils/http-status";
import {
  uploadImageToCloud,
  verifyImageFromCloud,
} from "../../utils/image-helper";

export abstract class ImageService {
  static async uploadImage(file: File, folder: string) {
    try {
      const result = await uploadImageToCloud(file, folder);
      return {
        public_id: result.public_id,
        url: result.secure_url,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
      };
    } catch (err: any) {
      throw new AppError(
        HTTP_STATUS.NOT_ACCEPTABLE,
        err.message || "File upload failed",
      );
    }
  }

  static async verifyImage(publicId: string) {
    try {
      const result = await verifyImageFromCloud(publicId);
      return {
        public_id: result.public_id,
        url: result.secure_url,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
      };
    } catch (err: any) {
      throw new AppError(
        HTTP_STATUS.NOT_ACCEPTABLE,
        err.message || "File verification failed",
      );
    }
  }
}
