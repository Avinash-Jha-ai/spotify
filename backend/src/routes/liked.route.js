import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { likeSong, getAllLikedSong, likeCount } 
from "../controllers/like.controller.js"; 

const router = Router();

router.post("/like/:songId", authenticateUser, likeSong);

router.get("/liked/songs", authenticateUser, getAllLikedSong);

router.get("/likes/:songId", authenticateUser, likeCount);

export default router;