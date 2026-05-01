import { Router } from "express";
import {
    register,
    login,
    getMe,
    logout,
    socialLogin,
    artistRegister
} from "../controllers/auth.controller.js";
import {upload} from "../middlewares/upload.middleware.js"
import { authenticateUser } from "../middlewares/auth.middleware.js";
const router =Router();

router.post("/register/artist",upload.single("avatar"),artistRegister);
router.post("/register",upload.single("avatar"),register);
router.post("/login",login);
router.get("/me",authenticateUser,getMe);
router.get("/logout",authenticateUser, logout);
router.post("/google",socialLogin);


export default router