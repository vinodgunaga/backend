import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {userId} = req.user?._id

    if (!videoId) {
        throw new ApiError(400, "Video Id is empty")
    }

    const existingLike = await Like.findOne({video:videoId, LikedBy: userId})

    let isLiked

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        isLiked = false
    } else {
        await Like.create({
            video: videoId, 
            LikedBy: userId
        })
        isLiked = true
    }

    const likeCount = await Like.countDocuments({video: videoId})

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {
            isLiked,
            likeCount
        },
        isLiked? "Video Liked": "Video Unliked"
    ))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {userId} = req.user?._id

    if (!commentId) {
        throw new ApiError(400, "Comment Id is empty")
    }

    const existingLike = await Like.findOne({comment: commentId, LikedBy: userId})

    let isLiked

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        isLiked = false
    } else {
        await Like.create({
            comment: commentId, 
            LikedBy: userId
        })
        isLiked = true
    }

    const likeCount = await Like.countDocuments({comment: commentId})

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {
            isLiked,
            likeCount
        },
        isLiked? "Comment Liked": "Comment Unliked"
    ))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {userId} = req.user?._id

    if (!tweetId) {
        throw new ApiError(400, "Tweet Id is empty")
    }

    const existingLike = await Like.findOne({tweet: tweetId, LikedBy: userId})

    let isLiked

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        isLiked = false
    } else {
        await Like.create({
            tweet: tweetId, 
            LikedBy: userId
        })
        isLiked = true
    }

    const likeCount = await Like.countDocuments({tweet: tweetId})

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {
            isLiked,
            likeCount
        },
        isLiked? "Tweet Liked": "Tweet Unliked"
    ))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos  = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $replaceRoot: {
                newRoot: "$video"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                likedVideos
            },
            "Liked videos fetched successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}