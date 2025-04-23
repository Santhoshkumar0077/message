import express from "express";
import {
  getAllUsers,
  getMe,
  findOrCreateChat,
  logout,
} from "../controllers/userController.js";
import protect from "../middleware/protectMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.get("/all", protect, getAllUsers);
router.post("/findOrCreateChat", protect, findOrCreateChat);
router.post("/logout", logout);
export default router;
    