import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from "uuid";
import { ErrorHandler } from "./error";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFilesToCloudinary = async (files: File[]) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise<{ public_id: string; secure_url: string }>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "stealthyChat",
              resource_type: "auto",
              public_id: uuid(),
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else if (result) {
                resolve({
                  public_id: result.public_id,
                  secure_url: result.secure_url,
                });
              } else {
                reject(new Error("Unknown error uploading to Cloudinary"));
              }
            }
          );

          uploadStream.end(buffer);
        }
      );
    });

    const results = await Promise.all(uploadPromises);

    const formattedResults = results.map((res) => ({
      public_id: res.public_id,
      url: res.secure_url,
    }));

    return formattedResults;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw new ErrorHandler("Failed to upload files to Cloudinary");
  }
};

const deleteFilesFromCloudinary = async (publicIds: string[]) => {
  try {
    const deletePromises = publicIds.map((publicId) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting files:", error);
    throw new ErrorHandler("Failed to delete files from Cloudinary");
  }
};

export { uploadFilesToCloudinary, deleteFilesFromCloudinary };
