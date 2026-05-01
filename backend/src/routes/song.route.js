import { Router } from "express";
import { uploadSong, deleteSong, getHomeSongs, getSong, getArtistSongs, getMySongs, searchSongs } from "../controllers/song.controller.js";
import { authenticateArtist, authenticateUser } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/upload.middleware.js"


const router = Router();

router.post("/upload", authenticateArtist, upload.single("song"), uploadSong);
router.get("/delete/:songId", authenticateArtist, deleteSong);
router.get("/", authenticateUser, getHomeSongs);
router.get("/artist/:artistName", authenticateUser, getArtistSongs);
router.get("/my-songs", authenticateArtist, getMySongs);
router.get("/search", authenticateUser, searchSongs);
router.get("/:songId", authenticateUser, getSong);

export default router;