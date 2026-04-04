import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  const { userId } = req.user?._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const existingSubscriber = await Subscription.findOne({
    channel: channelId,
    subsriber: userId,
  });

  let isSubScribed;

  if (existingSubscriber) {
    await Subscription.findByIdAndDelete(existingSubscriber._id);
    isSubScribed = false;
  } else {
    await Subscription.create({ subscriber: userId, channel: channelId });
    isSubScribed = true;
  }

  const subScriptionCount = await Subscription.countDocuments({
    channel: channelId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isSubScribed,
        subScriptionCount,
      },
      isSubScribed ? "User Subscribed" : "User UnSubscribed"
    )
  );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber Id");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
              coverImage: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        subscriber: { $first: "$subscriber" },
      },
    },
  ]);

  if (!subscribers) {
    throw new ApiError(500, "Error while getting channel subscriberss");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Channel Subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
              coverImage: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        channel: { $first: "$channels" },
      },
    },
  ]);

  if (!channels) {
    throw new ApiError(500, "Something went wrong while getting channel info");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channels, "channel details fetched successfully")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
