import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId) {
        throw new ApiError(400, "Video id is empty")
    }

    const comments = await Comment.aggregatePaginate(
        Comment.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$owner"
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]),
        {
            page: Number(page),
            limit: Number(limit)
        }
    )

    if (!comments) {
        throw new ApiError(500, "Error while fetcing the comments")
    }

    return res
    .status(200)
    .json(200, comments, "Comments fetched successfully")

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    if (!content?.trim() || !videoId) {
        throw new ApiError(400, "comment message and video Id is required")
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user._id
    })

    if (!comment) {
        throw new ApiError(500, "Something went wrong while adding the comments")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    if (!content?.trim() || !commentId) {
        throw new ApiError(400, "comment message and comment Id is required")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        } 
    )

    if (!comment) {
        throw new ApiError(500, "Something went wrong while updating the comments")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        comment,
        "Commment updated successfully"
    ))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if(!commentId) {
        throw new ApiError(400, "comment id is required")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if (!comment) {
        throw new ApiError(500, "something went wrong while deleting the comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        comment,
        "Comment deleted successfully"
    ))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }