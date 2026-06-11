import type { Context } from "elysia";
import { HTTP_STATUS } from "../../utils/http-status";
import { ImageService } from "./image.service";

export async function uploadImageHandler({ body, set }: any) {
  const file = body.file as File;
  const folder = body.folder as string;

  const image = await ImageService.uploadImage(file, folder);

  set.status = HTTP_STATUS.CREATED;
  return {
    message: "Image uploaded successfully",
    image: {
      id: image.id,
      url: image.secureUrl,
      width: image.width,
      height: image.height,
      format: image.format,
    },
  };
}

export async function deleteImageHandler({ params, set }: any) {
  const { id } = params;

  await ImageService.deleteImage(id);

  set.status = HTTP_STATUS.OK;
  return { message: "Image deleted successfully" };
}
