import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const allComments = await Comment.find({
        video: videoId,
    });

    if (!allComments) {
        throw new ApiError(
            500,
            "Something went wrong while fetching all comments"
        );
    }
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allComments,
                "All comments fetched successfully"
            )
        );
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { content } = req.body;
    const { videoId } = req.params;
    const userId = req.user?._id;

    // console.log(req.body, req.params, req.user);

    const comment = await Comment.create({
        content: content || "",
        video: videoId,
        owner: userId,
    });

    if (!comment) {
        throw new ApiError(500, "Someting went wrong while commenting");
    }

    const createdComment = await Comment.findById(comment);

    if (!createdComment) {
        throw new ApiError(
            500,
            "Something went wrong while commenting :: server error"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdComment, "Commented successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) {
        throw new ApiError(500, "Comment not found");
    }

    if (content.trim() === "") {
        throw new ApiError(500, "Comment can't be empty space");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content || "",
            },
        },
        {
            new: true,
        }
    );

    if (!updatedComment) {
        throw new ApiError(
            500,
            "Something went wrong while updating your comment"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment updated successfully")
        );
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params;

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
