import express from "express";
import { getToken, openChat } from "../../controllers/chat.controller";
const router = express.Router();
router.post("/chat/token", getToken); // lấy token cho user/admin
router.post("/chat/open", openChat); // tạo hoặc lấy channel 1-1

export default router;
