import express from "express";
import roomTypeController from "../../controllers/roomTypes.controller";
const router = express.Router();

//Get all users
router.get("/roomTypes", roomTypeController.getAll);
//Get user by id
router.get("/roomTypes/:id", roomTypeController.getById);
//Create user
router.post("/roomTypes", roomTypeController.Create);
//Update user
router.put("/roomTypes/:id", roomTypeController.Update);
//Delete user
router.delete("/roomTypes/:id", roomTypeController.Delete);

export default router;
