import Elysia from "elysia";
import { ImageModel } from "./image.model";
import { authPlugin } from "../../middleware/auth.plugin";
import { ImageService } from "./image.service";
import { authorizationPlugin } from "../../middleware/authorization-plugin";

const router = new Elysia({
  name: "image-router",
  prefix: "/images",
  tags: ["Images"],
})
  .use(authPlugin)
  .use(authorizationPlugin);

router.post(
  "/upload",
  async ({ body }) => {
    const file = body.file;
    const folder = body.folder;

    const image = await ImageService.uploadImage(file, folder);

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
  },
  {
    body: ImageModel.uploadBody,
    restrictTo: "*",
    detail: {
      summary: "Upload an image",
      description:
        "Uploads an image to Cloudinary and saves a reference in the DB. Returns the generated image ID to be used when creating Menus or Categories.",
    },
  },
);

router.delete(
  "/:id",
  async ({ params }) => {
    const { id } = params;
    await ImageService.deleteImage(id);
    return {
      message: "Image deleted successfully",
    };
  },
  {
    params: ImageModel.deleteParams,
    restrictTo: "*",
    detail: {
      summary: "Delete an image by ID",
      description:
        "Deletes an image from Cloudinary and removes its record from the database.",
    },
  },
);

export { router as image_router };
