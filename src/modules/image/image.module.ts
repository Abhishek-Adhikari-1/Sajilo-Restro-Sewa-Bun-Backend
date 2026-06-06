import Elysia, { t } from "elysia";
import z from "zod";
import { zImage } from "../../types/image";
import { authPlugin } from "../../middleware/auth-plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";
import { ImageService } from "./image.service";

const router = new Elysia({ name: "image-router" })
  .use(authPlugin)
  .use(authorizationPlugin);

router.post(
  "/upload/image",
  async ({ body }) => {
    const res = await ImageService.uploadImage(body.image, "images");
    return {
      message: "Image uploaded successfully",
      ...res,
    };
  },
  {
    body: z.object({
      image: zImage(),
    }),
  },
);

router.get("/verify/image/:id", async ({ params }) => {
  const res = await ImageService.verifyImage(params.id);
  return {
    message: "Image verified successfully",
    ...res,
  };
});

export { router as image_router };
