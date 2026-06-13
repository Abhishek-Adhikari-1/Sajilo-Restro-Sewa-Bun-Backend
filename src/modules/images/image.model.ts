import { type UnwrapSchema } from "elysia";
import z from "zod";

const maxSizeMb = 5;
export const allwoedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
];

export const imageUploadSchema = z
  .instanceof(File)
  .refine(
    (file) => allwoedImageTypes.includes(file.type),
    `Only ${allwoedImageTypes.join(", ")} files are allowed`,
  )
  .refine(
    (file) => file.size <= maxSizeMb * 1024 * 1024,
    `File size must be less than ${maxSizeMb}MB`,
  );

export const ImageModel = {
  uploadBody: z.object({
    file: imageUploadSchema,
    folder: z.string().default("general"),
  }),
  deleteParams: z.object({
    id: z.string("Invalid image ID"),
  }),
};

export type ImageModel = {
  [k in keyof typeof ImageModel]: UnwrapSchema<(typeof ImageModel)[k]>;
};
