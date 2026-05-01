import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { 
    createPlaylist, 
    addSongToPlaylist, 
    removeSongFromPlaylist, 
    deletePlaylist, 
    getUserPlaylists, 
    getPlaylistById 
} from "../controllers/playlist.controller.js";

import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/create", authenticateUser, upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "banner", maxCount: 1 }
]), createPlaylist);

router.get("/my-playlists", authenticateUser, getUserPlaylists);

router.get("/:playlistId", authenticateUser, getPlaylistById);

router.delete("/:playlistId", authenticateUser, deletePlaylist);

router.post("/:playlistId/song/:songId", authenticateUser, addSongToPlaylist);

router.delete("/:playlistId/song/:songId", authenticateUser, removeSongFromPlaylist);

export default router;