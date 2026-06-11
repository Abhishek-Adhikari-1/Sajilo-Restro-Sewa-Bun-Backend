import type {
  DeliveryType,
  ResourceType,
  ResponseCallback,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";
import { env } from "../config/env";
import { cloudinary } from "../config/cloudinary";

type UploadOptions = UploadApiOptions;

export const uploadFileToCLoud = async (
  file: File,
  folder = "default",
  options: UploadOptions = {},
): Promise<UploadApiResponse> => {
  const buffer = Buffer.from(await file.arrayBuffer());

  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: `${env.DATABASE_NAME}/${folder}`,
    resource_type: "image",
    ...options,
  });

  return result;
};

export const uploadImageToCloud = async (
  file: File,
  folder = "default",
  options: UploadOptions = {},
) => {
  const result = await uploadFileToCLoud(file, folder, {
    transformation: [
      {
        width: 800,
        height: 800,
        crop: "fill", // or "thumb"
        gravity: "auto", // smart center crop
        quality: "auto", // compression
        fetch_format: "auto", // webp/avif auto
      },
    ],
    ...options,
  });
  return result;
};

export const deleteImageFromCloud = async (
  publicId: string,
  options?:
    | {
        resource_type?: ResourceType | undefined;
        type?: DeliveryType;
        invalidate?: boolean;
      }
    | undefined,
  callback?: ResponseCallback,
): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, options, callback);
};
