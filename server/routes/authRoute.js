import express from "express";
import { login, register, verifyOtp } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login",login)
router.post("/verify", verifyOtp)
export default router;
