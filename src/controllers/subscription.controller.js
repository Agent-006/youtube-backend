import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription

    if (!channelId) {
        throw new ApiError(401, "channel id is missing");
    }
    const isValid = isValidObjectId(channelId);
    if (!isValid) {
        throw new ApiError(401, "Invalid channel id");
    }

    const isSubscribed = await Subscription.find({
        $and: [{ subscriber: req.user?._id }, { channel: channelId }],
    });
    console.log(isSubscribed);

    if (isSubscribed.length !== 0) {
        throw new ApiError(401, "User already subscribed to this channel");
    }

    const subscribed = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    });

    if (!subscribed) {
        throw new ApiError(
            500,
            "Something went wrong while subscribing the channel"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribed, "Successfully subscribed"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(401, "subscriberId is missing");
    }

    const isValid = isValidObjectId(channelId);
    if (!isValid) {
        throw new ApiError(401, "Invalid channel id");
    }

    const subscribers = await Subscription.find({
        channel: channelId,
    });

    if (!subscribers) {
        throw new ApiResponse(
            500,
            "Something went wrong while fetching the subscribers"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "Successfully fetched all subscribers"
            )
        );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        throw new ApiError(401, "Subscriber id is missing");
    }

    const isValid = isValidObjectId(subscriberId);
    if (!isValid) {
        throw new ApiError(401, "Invalid subscriber id");
    }

    const allSubscribedChannels = await Subscription.find({
        subscriber: subscriberId,
    });

    if (!allSubscribedChannels) {
        throw new ApiError(
            500,
            "Something went wrong while fetching all subscribed channels"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allSubscribedChannels,
                "Successfully fetched all channels"
            )
        );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
