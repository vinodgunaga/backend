import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLODINARY_CLOUD_NAME,
  api_key: process.env.CLODINARY_API_KEY,
  api_secret: process.env.CLODINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload the file on clodinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file has been uploaded successfully
    //console.log("File is uploaded on clodinary", response.url)

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload fails
    return null;
  }
};

const deleteFromCloudinary = async (fileURL) => {
  try {
    const publicId = extractPublicId(fileURL, { resource_type: "auto" });

    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId);

    return response;
  } catch (error) {
    return null;
  }
};

const extractPublicId = (imageUrl) => {
  // Split the URL by '/'
  const parts = imageUrl.split("/");
  // The public ID with extension is usually the last part
  const publicIdWithExtension = parts[parts.length - 1];
  // Split by '.' to remove the file extension and return the public ID
  const publicId = publicIdWithExtension.split(".")[0];
  return publicId;
};

export { uploadOnCloudinary, deleteFromCloudinary };
