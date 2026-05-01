import userModel from "../models/user.model.js";
import { uploadFile } from "../services/storage.service.js";
import jwt from "jsonwebtoken"
import {config} from "../configs/config.js"

export const register =async (req,res) => {
    const {username , email ,password} =req.body;
    const file =req.file;

    try{

        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: "All fields are required", 
                success: false 
            });
        }

        const isAlreadyUser =await userModel.findOne({email});
        if(isAlreadyUser){
            return res.status(400).json({
                message:"user already exist",
                success:false
            })
        }

        let avatarUrl = "https://ik.imagekit.io/Avinash/humman_ai/Screenshot_2026-02-14_at_3.28.35%C3%A2__PM_W7WhezCB5j.png?updatedAt=1777186418645";
        
        if (file) {
            const result = await uploadFile(file, "/spotify/avatar");
            avatarUrl = result.secure_url;
        }

        const user = await userModel.create({
            username,
            email,
            password,
            avatar: avatarUrl,
        });

        const token =jwt.sign({
            id:user._id
        },config.JWT_SECRET,{
            expiresIn:"1d"
        })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            }
        });


    }catch(error){
        console.log("error in register : ",error);
        return res.status(500).json({
            message:"error in register ",
            success:false,
            error:error
        })
    }
}

export const artistRegister =async (req,res) => {
    const {username , email ,password} =req.body;
    const file =req.file;

    try{

        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: "All fields are required", 
                success: false 
            });
        }

        const isAlreadyUser =await userModel.findOne({email});
        if(isAlreadyUser){
            return res.status(400).json({
                message:"user already exist",
                success:false
            })
        }

        let avatarUrl = "https://ik.imagekit.io/Avinash/humman_ai/Screenshot_2026-02-14_at_3.28.35%C3%A2__PM_W7WhezCB5j.png?updatedAt=1777186418645";
        
        if (file) {
            const result = await uploadFile(file, "/spotify/avatar");
            avatarUrl = result.secure_url;
        }

        const user = await userModel.create({
            username,
            email,
            password,
            avatar: avatarUrl,
            role: "artist"
        });

        const token =jwt.sign({
            id:user._id
        },config.JWT_SECRET,{
            expiresIn:"1d"
        })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role:user.role
            }
        });


    }catch(error){
        console.log("error in register : ",error);
        return res.status(500).json({
            message:"error in register ",
            success:false,
            error:error
        })
    }
}

export const login =async (req,res)=>{
    const {email,password}=req.body;

    try{

        if (!email || !password) {
            return res.status(400).json({ 
                message: "All fields are required", 
                success: false 
            });
        }

        console.log("[Auth] Attempting login for:", email);
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            console.log("[Auth] User not found:", email);
            return res.status(401).json({
                message: "Invalid credentials",
                success: false
            });
        }

        console.log("[Auth] User found, comparing password...");
        const match = await user.comparePassword(password);
        if (!match) {
            console.log("[Auth] Password mismatch for:", email);
            return res.status(401).json({
                message: "Invalid credentials",
                success: false
            });
        }

        console.log("[Auth] Password match, generating token...");
        const token = jwt.sign({
            id: user._id
        }, config.JWT_SECRET, {
            expiresIn: "1d"
        });

        console.log("[Auth] Token generated, setting cookie...");
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        console.log("[Auth] Login successful for:", email);
        return res.status(200).json({
            message: "Login successful",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        });





    } catch (error) {
        console.error("Critical Login Error:", error);
        return res.status(500).json({
            message: "Internal server error during login",
            success: false,
            error: error.message
        });
    }
}

export const getMe =async (req,res)=>{
    const userId =req.user.id

    try{

        const user =await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            message:"data fetch successfully",
            success:true,
            user:{
                id:user._id,
                email:user.email,
                username:user.username,
                avatar:user.avatar,
                role:user.role
            }
        })

    }catch(error){
        console.log("error in get user data : ",error);
        return res.status(500).json({
            message:"error in getMe",
            success:false,
            error:error
        })
    }
}

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

export const socialLogin = async (req, res) => {
    try {
        const { email, username, avatar, googleId } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({
                message: "Email and Google ID are required",
                success: false
            });
        }


        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                email,
                username: username || "Google User",
                avatar: avatar ||  "https://ik.imagekit.io/Avinash/humman_ai/Screenshot_2026-02-14_at_3.28.35%C3%A2__PM_W7WhezCB5j.png?updatedAt=1777186418645",
                googleId,
                role: "user"
            });
        } 
        else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Social login successful",
            success: true,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                role: user.role
            }
        });

    } catch (error) {
        console.error("[Auth] Error in socialLogin:", error);
        return res.status(500).json({
            message: "Error in social login",
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
};

