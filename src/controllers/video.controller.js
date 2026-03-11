import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title || !description) {
    throw new ApiError(400, "Title and Description is required");
  }

  const localVideoPath = req.files?.videoFile[0]?.path;

  let localthumbnailPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    localthumbnailPath = req.files?.thumbnail[0]?.path;
  }

  if (!localVideoPath) {
    throw new ApiError(400, "video file required");
  }

  const video = await uploadOnCloudinary(localVideoPath);
  const thumbnail = await uploadOnCloudinary(localthumbnailPath);

  if (!video) {
    throw new ApiError(500, "Failed to upload video to cloudinary");
  }

  const videoRes = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail?.url || "",
    owner: req.user?._id,
    title,
    description,
    duration: video.duration,
  });

  if (!videoRes) {
    throw new ApiError(500, "Something went wrong while publishing a video");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { videoRes }, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(500, `could not find a video by id ${videoId}`);
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(500, "something went wrong while deleting video");
  }

  res.status(200).json(200, video, "Video deleted successfully");
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(500, "could not find video");
  }
  video.publishStatus = !video.publishStatus;
  const upadtedVideo = await video.save({ validateBeforeSave: false });

  if (!upadtedVideo) {
    throw new ApiResponse(
      500,
      "Something went wrong while updating publish status"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, upadtedVideo, "Publish status changed successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
