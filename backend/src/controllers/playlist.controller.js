import playlistModel from "../models/playlist.model.js";
import songModel from "../models/song.model.js";
import mongoose from "mongoose";
import { uploadFile, deleteFile } from "../services/storage.service.js";

export const createPlaylist = async (req, res) => {
    const { name, description, thumbnail } = req.body;
    const userId = req.user._id;

    try {
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Playlist name is required"
            });
        }

        let thumbnailData = {
            url: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop",
            publicId: null
        };
        let bannerData = {
            url: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2000&auto=format&fit=crop",
            publicId: null
        };

        if (req.files) {
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                const uploadResult = await uploadFile(req.files.thumbnail[0], "/spotify/playlists/thumbnails");
                thumbnailData.url = uploadResult.secure_url;
                thumbnailData.publicId = uploadResult.public_id;
            }
            if (req.files.banner && req.files.banner[0]) {
                const uploadResult = await uploadFile(req.files.banner[0], "/spotify/playlists/banners");
                bannerData.url = uploadResult.secure_url;
                bannerData.publicId = uploadResult.public_id;
            }
        }

        const newPlaylist = await playlistModel.create({
            name,
            description: description || "",
            thumbnail: thumbnailData.url,
            thumbnailPublicId: thumbnailData.publicId,
            banner: bannerData.url,
            bannerPublicId: bannerData.publicId,
            user: userId,
            songs: []
        });

        return res.status(201).json({
            success: true,
            message: "Playlist created successfully",
            playlist: newPlaylist
        });
    } catch (error) {
        console.error("Error creating playlist:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while creating playlist"
        });
    }
};

export const addSongToPlaylist = async (req, res) => {
    const { playlistId, songId } = req.params;
    const userId = req.user._id;

    try {
        if (!mongoose.Types.ObjectId.isValid(songId) || !mongoose.Types.ObjectId.isValid(playlistId)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }

        const playlist = await playlistModel.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({ success: false, message: "Playlist not found" });
        }

        if (playlist.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to modify this playlist" });
        }

        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ success: true, message: "Song already in playlist" });
        }

        playlist.songs.push(songId);
        await playlist.save();

        return res.status(200).json({
            success: true,
            message: "Song added to playlist",
            playlist
        });

    } catch (error) {
        console.error("Error adding song to playlist:", error);
        return res.status(500).json({ success: false, message: "Error adding song" });
    }
};

export const removeSongFromPlaylist = async (req, res) => {
    const { playlistId, songId } = req.params;
    const userId = req.user._id;

    try {
        const playlist = await playlistModel.findById(playlistId);
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        if (playlist.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
        await playlist.save();

        return res.status(200).json({
            success: true,
            message: "Song removed from playlist"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error removing song" });
    }
};

export const deletePlaylist = async (req, res) => {
    const { playlistId } = req.params;
    const userId = req.user._id;

    try {
        const playlist = await playlistModel.findById(playlistId);
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        if (playlist.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (playlist.thumbnailPublicId) {
            await deleteFile(playlist.thumbnailPublicId);
        }
        if (playlist.bannerPublicId) {
            await deleteFile(playlist.bannerPublicId);
        }

        await playlistModel.findByIdAndDelete(playlistId);
        return res.status(200).json({ success: true, message: "Playlist deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error deleting playlist" });
    }
};

export const getUserPlaylists = async (req, res) => {
    const userId = req.user._id;

    try {
        const playlists = await playlistModel.find({ user: userId }).populate("songs");
        return res.status(200).json({
            success: true,
            playlists
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching playlists" });
    }
};

export const getPlaylistById = async (req, res) => {
    const { playlistId } = req.params;

    try {
        const playlist = await playlistModel.findById(playlistId).populate("songs");
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        return res.status(200).json({
            success: true,
            playlist
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching playlist" });
    }
};