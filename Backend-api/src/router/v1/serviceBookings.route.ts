import express from "express";
import serviceBookingController from "../../controllers/serviceBookings.controller";
const router = express.Router();

//Get all users
router.get("/serviceBookings", serviceBookingController.getAll);
//Get user by id
router.get("/serviceBookings/:id", serviceBookingController.getById);
//Create user
router.post("/serviceBookings", serviceBookingController.Create);
//Update user
router.put("/serviceBookings/:id", serviceBookingController.Update);
//Delete user
router.delete("/serviceBookings/:id", serviceBookingController.Delete);

export default router;
