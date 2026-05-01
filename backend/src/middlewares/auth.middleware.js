import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { config } from "../configs/config.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token",
        success: false,
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
        success: false,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth Error:", error);
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
      success: false,
    });
  }
};
export const authenticateArtist =async (req,res,next) =>{
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token",
        success: false,
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
        success: false,
      });
    }

    if(user.role!=="artist"){
      return res.status(401).json({
        message: "Unauthorized: User not found",
        success: false,
      }); 
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth Error:", error);
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
      success: false,
    });
  }
}
export const authenticateUserByEmail = authenticateUser;