import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    avatar: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: [8, 'Password must be at least 8 characters'],
        select: false  
    },
    googleId: {
        type: String,
        sparse: true, 
        unique: true
    },
    role: {
        type: String,
        enum: ["artist", "user"],
        default: "user"
    }
}, {
    timestamps: true  
});

userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
})


userSchema.methods.comparePassword = async function (password) {
    try {
        if (!this.password) return false;
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        console.error("Bcrypt compare error:", error);
        return false;
    }
}

const userModel =mongoose.model("user",userSchema);

export default userModel

