import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like 1. total video views, 2. total subscribers, 3. total videos, 4. total likes etc.
    // we need subscriber collections - count the channel(user._id) in their subscribers -> subscription model

    const subsCount = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $count: "subscriberCount",
        },
    ]);

    console.log(subsCount[0]);

    // we need videos collections -> check video owner for total videos

    const videosCount = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $count: "videosCount",
        },
    ]);

    console.log(videosCount[0]);

    // we need videos collections -> queries the video views field

    const totalViews = await Video.aggregate([
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

    console.log(totalViews[0]);

    const allStats = {
        totalSubscribers: subsCount[0]?.subscriberCount,
        totalViews: totalViews[0]?.totalViews,
        totalVideos: videosCount[0]?.videosCount,
    };

    console.log(allStats);

    // we need likes collections -> query the likes -> check videos to get like count
    

    // TODO: res -> total views, total subs, total videos, total likes

    return res
        .status(200)
        .json(new ApiResponse(200, allStats, "Stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const ChannelVideos = await Video.find({
        owner: new mongoose.Types.ObjectId(req.user?._id),
    });

    if (!ChannelVideos) {
        throw new ApiError(
            500,
            "Something went wrong while getting all channel videos"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                ChannelVideos,
                "Successfully fetched all channel videos"
            )
        );
});

export { getChannelStats, getChannelVideos };
