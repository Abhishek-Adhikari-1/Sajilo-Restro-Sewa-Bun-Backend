import { z } from "zod";

export const zImage = (
  maxSizeMb = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
) =>
  z
    .instanceof(File)
    .refine(
      (file) => allowedTypes.includes(file.type),
      `Only ${allowedTypes.join(", ")} files are allowed`,
    )
    .refine(
      (file) => file.size <= maxSizeMb * 1024 * 1024,
      `File size must be less than ${maxSizeMb}MB`,
    );
