import likeModel from "../models/like.model.js";
import mongoose from "mongoose";
import songModel from "../models/song.model.js";

export const likeSong = async (req, res) => {
    const { songId } = req.params;
    const userId = req.user._id;

    try {
        if (!mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({
                success: false,
                message: "invalid song id"
            });
        }

        const song = await songModel.findById(songId);
        if (!song) {
            return res.status(404).json({
                success: false,
                message: "song not found"
            });
        }

        const existingLike = await likeModel.findOne({
            user: userId,
            song: songId
        });

        if (existingLike) {
            await likeModel.deleteOne({ _id: existingLike._id });

            if (song.likes > 0) {
                song.likes -= 1;
                await song.save();
            }

            return res.json({
                success: true,
                message: "song unliked"
            });
        }

        await likeModel.create({
            user: userId,
            song: songId
        });

        song.likes += 1;
        await song.save();

        return res.json({
            success: true,
            message: "song liked"
        });

    } catch (error) {
        console.log("error in likeSong:", error);
        return res.status(500).json({
            success: false,
            message: "error liking song"
        });
    }
};

export const getAllLikedSong =async (req,res)=>{
    const userId =req.user._id
    try{
        const likedSongs = await likeModel
            .find({ user: userId })
            .populate("song") 
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message:"liked song fetch ",
            success:true,
            songs: likedSongs.map(item => item.song).filter(song => song !== null)
        })
    }catch(error){
        console.log("error in get liked song");
        return res.status(500).json({
            message:"error in get liked song",
            success:false,
            error :error
        })
    }
}

export const likeCount = async (req, res) => {
    const { songId } = req.params;

    try {
    
        if (!mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({
                success: false,
                message: "invalid song id"
            });
        }

        const count = await likeModel.countDocuments({ song: songId });

        return res.status(200).json({
            success: true,
            message: "like count fetched",
            likes: count
        });

    } catch (error) {
        console.log("error in like count:", error);
        return res.status(500).json({
            success: false,
            message: "error fetching like count"
        });
    }
};