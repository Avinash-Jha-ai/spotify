import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    song: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    artist: [
        {
            type: String,
            required: true,
            trim: true
        }
    ],
    songPublicId:{
        type:String,
        required:true
    },
    thumbnailPublicId:{
        type:String,
        required:true
    },
    likes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const songModel = mongoose.model("Song", songSchema);
export default songModel;