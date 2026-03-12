import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const currentUser = req.user;

  const video = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  const totalViews = video[0]?.totalViews || 0;

  const subscribersCount = await Subscription.countDocuments({
    channel: req.user?._id,
  });

  const totalVideos = await Video.countDocuments({ owner: req.user?._id });

  const like = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "likedBy",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $match: {
        "video.owner": new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: 1 },
      },
    },
  ]);

  const totalLikes = like[0]?.totalLikes || 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        subscribersCount,
        totalViews,
        totalLikes,
      },
      "dash Board videos fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const videos = await Video.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
      },
    },
  ]);

  if (!videos) {
    throw new ApiError(
      500,
      "something went wrong while getting channel videos"
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, videos, "channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
