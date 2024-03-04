import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body;

    if (content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        owner: req.user?._id,
        content,
    });

    if (!tweet) {
        throw new ApiError(
            500,
            "Something went wrong while creating the tweet"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(401, "User id is missing");
    }

    const allTweets = await Tweet.find({
        owner: userId,
    });

    if (!allTweets) {
        throw new ApiError(
            500,
            "Something went wrong while fetching all tweets"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allTweets, "Successfully fetched all tweets")
        );
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId) {
        throw new ApiError(401, "Tweet id is missing");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        {
            new: true,
        }
    );

    if (!updatedTweet) {
        throw new ApiError(500, "Something wrong while updating the tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(401, "Tweet id is missing");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(
            500,
            "Something went wrong while deleting the tweet"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Successfully deleted the tweet"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
