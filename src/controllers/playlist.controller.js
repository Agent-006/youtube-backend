import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!(name || description)) {
        throw new ApiError(401, "Name and description is required");
    }

    //TODO: create playlist

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });

    if (!playlist) {
        throw new ApiError(
            500,
            "Something went wrong while creating the playlist"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist successfully created"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const isValidId = isValidObjectId(userId);

    if (!isValidId) {
        throw new ApiError(401, "Invalid user id");
    }
    //TODO: get user playlists

    const UserPlaylists = await Playlist.find({
        owner: userId,
    });

    if (!UserPlaylists) {
        throw new ApiError(
            500,
            "Something went wrong while fetching all the playlists from the database"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                UserPlaylists,
                "Successfully fetched all user playlists"
            )
        );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const isValidId = isValidObjectId(playlistId);

    if (!isValidId) {
        throw new ApiError(401, "Invalid playlist id");
    }

    //TODO: get playlist by id

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(500, "Playlist doesn't exists");
    }

    const playlistWithVideos = await Playlist.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            },
        },
        {
            $addFields: {
                videos: "$videos",
            },
        },
    ]);

    if (!playlistWithVideos) {
        throw new ApiError(500, "Playlist doesn't exists");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlistWithVideos,
                "Successfully fetched playlist"
            )
        );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const isValidPlaylistId = isValidObjectId(playlistId);
    const isValidVideoId = isValidObjectId(videoId);

    if (!(isValidPlaylistId || isValidVideoId)) {
        throw new ApiError(401, "Invalid playlist or video id");
    }

    const isAdded = await Playlist.find({
        videos: { _id: videoId },
    });

    if (isAdded.length !== 0) {
        throw new ApiError(400, "Video already exists in this playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId,
            },
        },
        { new: true, useFindAndModify: false }
    );

    if (!updatedPlaylist) {
        throw new ApiError(
            500,
            "Something went wrong while adding the video to playlist"
        );
    }

    const playlistWithVideos = await Playlist.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            },
        },
        {
            $addFields: {
                videos: "$videos",
            },
        },
    ]);

    if (!playlistWithVideos) {
        throw new ApiError(
            500,
            "Something went wrong while adding video to playlist"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlistWithVideos,
                "Successfully added video to playlist"
            )
        );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const isValidPlaylistId = isValidObjectId(playlistId);
    const isValidVideoId = isValidObjectId(videoId);

    if (!(isValidPlaylistId || isValidVideoId)) {
        throw new ApiError(401, "Invalid playlist or video id");
    }

    // TODO: remove video from playlist

    const result = await Playlist.updateOne(
        {
            _id: playlistId,
        },
        {
            $pull: { videos: videoId },
        }
    );

    if (result.nModified === 0) {
        throw new ApiError(404, "Video not found in the playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const isValidPlaylistId = isValidObjectId(playlistId);

    if (!isValidPlaylistId) {
        throw new ApiError(401, "Invalid playlist id");
    }

    // TODO: delete playlist

    const isDeleted = await Playlist.findByIdAndDelete(playlistId);

    if (!isDeleted) {
        throw new ApiError(
            500,
            "Something went wrong while deleting the playlist"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    const isValidPlaylistId = isValidObjectId(playlistId);

    if (!isValidPlaylistId) {
        throw new ApiError(401, "Invalid playlist id");
    }

    if (!(name || description)) {
        throw new ApiError(400, "Name and description is required");
    }

    //TODO: update playlist

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description,
            },
        },
        {
            new: true,
        }
    );

    if (!updatedPlaylist) {
        throw new ApiError(
            500,
            "Something went wrong while updating the playlist"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
