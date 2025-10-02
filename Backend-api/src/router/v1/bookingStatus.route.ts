import express from "express";
import bookingStatusController from "../../controllers/bookingStatus.controller";
const router = express.Router();

//Get all users
router.get("/bookingStatus", bookingStatusController.getAll);
//Get user by id
router.get("/bookingStatus/:id", bookingStatusController.getById);
//Create user
router.post("/bookingStatus", bookingStatusController.Create);
//Update user
router.put("/bookingStatus/:id", bookingStatusController.Update);
//Delete user
router.delete("/bookingStatus/:id", bookingStatusController.Delete);

export default router;
