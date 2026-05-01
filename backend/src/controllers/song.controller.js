import songModel from "../models/song.model.js";
import { uploadFile, deleteFile } from "../services/storage.service.js";
import * as mm from 'music-metadata';

export const uploadSong = async (req, res) => {
    const userId = req.user._id;
    const { title: manualTitle, description, artist: manualArtist } = req.body;
    const songFile = req.file;

    try {
        if (!songFile) {
            return res.status(400).json({
                message: "Please upload a song file.",
                success: false
            });
        }

        let common = {};
        try {
            console.log("[Upload] Parsing metadata...");
            const metadata = await mm.parseBuffer(songFile.buffer);
            common = metadata.common || {};
        } catch (mmError) {
            console.warn("[Upload] Metadata parsing failed, using fallbacks:", mmError.message);
        }

        const title = manualTitle || common.title || songFile.originalname.split('.')[0] || "Untitled Track";
        
        let artistArray = [];
        if (manualArtist && manualArtist.trim() !== "") {
            artistArray = manualArtist.split(",").map(a => a.trim()).filter(a => a !== "");
        } else {
            artistArray = common.artists || (common.artist ? [common.artist] : [req.user.username]);
        }

        if (!artistArray || artistArray.length === 0) {
            artistArray = [req.user.username];
        }

        const picture = common.picture?.[0];
        let thumbnailRes;

        if (picture) {
            console.log("[Upload] Extracting and uploading embedded thumbnail...");
            
            const pictureFile = {
                buffer: picture.data,
                mimetype: picture.format,
                originalname: `thumbnail_${Date.now()}`
            };
            thumbnailRes = await uploadFile(pictureFile, `/spotify/${userId}/thumbnail`);
        } else {
            console.log("[Upload] No embedded picture, using fallback thumbnail.");
           
            thumbnailRes = {
                secure_url: "https://res.cloudinary.com/duw7rb8ih/image/upload/v1714560000/default_song_cover.png",
                public_id: "default_thumbnail"
            };
        }

        console.log("[Upload] Uploading audio file...");
        const songRes = await uploadFile(songFile, `/spotify/${userId}/song`);

        console.log(`[Upload] Saving to database: ${title}`);
        const newSong = await songModel.create({
            user: userId,
            title,
            description: description || "",
            thumbnail: thumbnailRes.secure_url,
            song: songRes.secure_url,
            artist: artistArray,
            thumbnailPublicId: thumbnailRes.public_id || "default_thumb",
            songPublicId: songRes.public_id || "temp_id"
        });

        return res.status(200).json({
            message: "Song uploaded successfully",
            song: newSong,
            success: true
        });

    } catch (error) {
        console.error("FATAL ERROR IN UPLOAD SONG:", error);
        return res.status(500).json({
            message: "Error uploading song: " + (error.message || "Unknown error"),
            success: false,
            error: error
        });
    }
}

export const deleteSong = async (req, res) => {
    const { songId } = req.params;
    const userId = req.user._id;

    try {
        console.log(`[Delete] Attempting to delete song: ${songId} for user: ${userId}`);
        const song = await songModel.findById(songId);

        if (!song) {
            console.warn(`[Delete] Song ${songId} not found in database.`);
            return res.status(404).json({
                message: "Song not found",
                success: false
            });
        }

        if (song.user.toString() !== userId.toString()) {
            console.error(`[Delete] Unauthorized delete attempt. Song owner: ${song.user}, Requester: ${userId}`);
            return res.status(403).json({
                message: "Unauthorized: You can only delete your own tracks.",
                success: false
            });
        }

        try {
            if (song.thumbnailPublicId && song.thumbnailPublicId !== "default_thumbnail") {
                await deleteFile(song.thumbnailPublicId);
            }
            if (song.songPublicId) {
                await deleteFile(song.songPublicId);
            }
        } catch (storageError) {
            console.error("[Delete] Storage deletion failed, proceeding with DB removal:", storageError);
        }

        await songModel.findByIdAndDelete(songId);

        return res.status(200).json({
            message: "Song deleted successfully",
            success: true,
        });

    } catch (error) {
        console.error("[Delete] Error in deleteSong:", error);
        return res.status(500).json({
            message: "Internal server error during deletion",
            success: false,
            error: error.message
        });
    }
};

export const getHomeSongs = async (req, res) => {
    try {
        const latestSongs = await songModel.find().sort({ createdAt: -1 }).limit(100);
        const randomSongs = await songModel.aggregate([{ $sample: { size: 20 } }]);

        return res.status(200).json({
            success: true,
            latestSongs,
            randomSongs
        });
    } catch (error) {
        console.error("Error fetching home songs:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getSong = async (req, res) => {
    const { songId } = req.params;
    try {
        const song = await songModel.findById(songId);
        if (!song) return res.status(404).json({ success: false, message: "Song not found" });

        return res.status(200).json({
            success: true,
            song
        });
    } catch (error) {
        console.error("Error fetching song:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getArtistSongs = async (req, res) => {
    const { artistName } = req.params;
    try {
        const songs = await songModel.find({ artist: { $in: [artistName] } }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            songs
        });
    } catch (error) {
        console.error("Error fetching artist songs:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getMySongs = async (req, res) => {
    const userId = req.user._id;

    try {
        const songs = await songModel.find({ user: userId }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            songs
        });
    } catch (error) {
        console.error("Error fetching my songs:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const searchSongs = async (req, res) => {
    const { query } = req.query;
    try {
        if (!query) {
            return res.status(200).json({ success: true, songs: [] });
        }

        const songs = await songModel.find({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { artist: { $elemMatch: { $regex: query, $options: "i" } } }
            ]
        }).limit(50);

        return res.status(200).json({
            success: true,
            songs
        });
    } catch (error) {
        console.error("Error searching songs:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};