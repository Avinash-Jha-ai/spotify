import cloudinary from "../configs/cloudinary.js";

export const uploadFile = async (file, folder) => {
  return new Promise((resolve, reject) => {
    console.log(`[Storage] Starting upload to folder: ${folder}`);
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", 
      },
      (error, result) => {
        if (error) {
          console.error("[Storage] Cloudinary Upload Error:", error);
          return reject(error);
        }
        console.log(`[Storage] Upload successful: ${result.secure_url}`);
        resolve(result);
      }
    ).end(file.buffer);
  });
};

export const deleteFile = async (public_id) => {
  return await cloudinary.uploader.destroy(public_id);
};