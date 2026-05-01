import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song"
        }
    ],
    thumbnail: {
        type: String,
        default: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop"
    },
    thumbnailPublicId: {
        type: String
    },
    banner: {
        type: String,
        default: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2000&auto=format&fit=crop"
    },
    bannerPublicId: {
        type: String
    }
}, { timestamps: true });

const playlistModel = mongoose.model("playlist", playlistSchema);

export default playlistModel;