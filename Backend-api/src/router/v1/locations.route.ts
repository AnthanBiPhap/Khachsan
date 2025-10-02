import express from "express";
import locationController from "../../controllers/locations.controller";
const router = express.Router();

//Get all users
router.get("/locations", locationController.getAll);
//Get user by id
router.get("/locations/:id", locationController.getById);
//Create user
router.post("/locations", locationController.Create);
//Update user
router.put("/locations/:id", locationController.Update);
//Delete user
router.delete("/locations/:id", locationController.Delete);

export default router;
