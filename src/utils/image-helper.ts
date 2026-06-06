import type { UploadApiOptions, UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";
import { env } from "../config/env";
import { AppError } from "./app-error";
import { HTTP_STATUS } from "./http-status";

type UploadOptions = UploadApiOptions;

export const uploadFileToCLoud = async (
  file: File,
  folder = "default",
  options: UploadOptions = {},
): Promise<UploadApiResponse> => {
  const buffer = Buffer.from(await file.arrayBuffer());

  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: `${env.FIREBASE_PROJECT_ID}/${folder}`,
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

export const verifyImageFromCloud = async (publicId: string) => {
  const res = await cloudinary.api.resource(publicId);
  return res;
};
