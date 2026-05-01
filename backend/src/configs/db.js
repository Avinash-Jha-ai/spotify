import mongoose from "mongoose";
import { config } from "./config.js";

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);

        console.log("database connected");
    } catch (error) {
        console.log("error in database:", error.message);
        process.exit(1);
    }
};

export default connectDB;