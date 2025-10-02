import express from "express";
import chatController from "../../controllers/chats.controller";
const router = express.Router();

//Get all users
router.get("/chats", chatController.getAll);
//Get user by id
router.get("/chats/:id", chatController.getById);
//Create user
router.post("/chats", chatController.create);
//Update user
router.put("/chats/:id", chatController.updateById);
//Delete user
router.delete("/chats/:id", chatController.deleteById);

export default router;
