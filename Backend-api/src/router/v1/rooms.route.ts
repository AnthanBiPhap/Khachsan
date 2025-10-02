import express from "express";
import roomController from "../../controllers/rooms.controller";
const router = express.Router();

//Get all users
router.get("/rooms", roomController.getAll);
//Get user by id
router.get("/rooms/:id", roomController.getById);
//Create user
router.post("/rooms", roomController.Create);
//Update user
router.put("/rooms/:id", roomController.Update);
//Delete user
router.delete("/rooms/:id", roomController.Delete);

export default router;
