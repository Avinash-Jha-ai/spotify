import mongoose from "mongoose";

const likeSchema =new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
        required: true,
    }
})

likeSchema.index({ user: 1, song: 1 }, { unique: true });

const likeModel =mongoose.model("like",likeSchema);

export default likeModel