import express from "express";
import bookingController from "../../controllers/bookings.controller";
const router = express.Router();

//Get all users
router.get("/bookings", bookingController.getAll);
//Get user by id
router.get("/bookings/:id", bookingController.getById);
//Create user
router.post("/bookings", bookingController.Create);
//Update user
router.put("/bookings/:id", bookingController.Update);
//Delete user
router.delete("/bookings/:id", bookingController.Delete);

export default router;
