import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video

    // check whether user already liked the video ?
    if (!videoId) {
        throw new ApiError(400, "Video not found");
    }

    const isValidId = isValidObjectId(videoId);

    if (!isValidId) {
        throw new ApiError(401, "Invalid video id");
    }

    const isLiked = await Like.find({
        $and: [{ video: videoId }, { likedBy: req.user?._id }],
    });

    if (isLiked.length !== 0) {
        throw new ApiError(401, "User already liked the video");
    }

    // if user and video doesn't exists the proceed
    const toggledVideoLike = await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    });

    if (!(toggledVideoLike.likedVideoId || toggledVideoLike.likedBy)) {
        throw new ApiError(500, "Something went wrong while liking the video");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                toggledVideoLike,
                "Toggled like on video successfully"
            )
        );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment

    // check whether user already liked the comment ?

    if (!commentId) {
        throw new ApiError(400, "User already liked the comment");
    }

    const isValidId = isValidObjectId(commentId);

    if (!isValidId) {
        throw new ApiError(401, "Invalid comment id");
    }

    const isLiked = await Like.find({
        $and: [{ comment: commentId }, { likedBy: req.user?._id }],
    });

    if (isLiked.length !== 0) {
        throw new ApiError(401, "User already liked the comment");
    }

    // if user didn't liked already then proceed

    const toggledCommentLike = await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (!toggledCommentLike) {
        throw new ApiError(
            500,
            "Something went wrong while liking the comment"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                toggledCommentLike,
                "Toggled like on comment successfully"
            )
        );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet

    // check whether user already liked the comment ?

    if (!tweetId) {
        throw new ApiError(400, "User already liked the comment");
    }

    const isValidId = isValidObjectId(tweetId);

    if (!isValidId) {
        throw new ApiError(401, "Invalid tweet id");
    }
    
    const isLiked = await Like.find({
        $and: [{ tweet: tweetId }, { likedBy: req.user?._id }],
    });

    if (isLiked.length !== 0) {
        throw new ApiError(401, "User already liked the tweet");
    }

    // if user didn't liked already then proceed

    const toggledTweetLike = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (!toggledTweetLike) {
        throw new ApiError(500, "Something went wrong while liking the tweet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                toggledTweetLike,
                "Toggled like on tweet successfully"
            )
        );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const allLikedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user?._id,
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "allvideos",
                pipeline: [
                    {
                        $project: {
                            videoFile: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                allvideos: {
                    $first: "$allvideos", // doing this, it will return an object rather than an array.
                },
            },
        },
    ]);

    if (!allLikedVideos) {
        throw new ApiError(
            500,
            "Something went wrong while fetching all the liked videos"
        );
    }

    const LikedVideos = allLikedVideos.filter((obj) => obj.video);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                LikedVideos,
                "Successfully fetched all liked videos"
            )
        );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
