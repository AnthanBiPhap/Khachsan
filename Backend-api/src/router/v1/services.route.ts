import express from "express";
import serviceController from "../../controllers/services.controller";
const router = express.Router();

//Get all users
router.get("/services", serviceController.getAll);
//Get user by id
router.get("/services/:id", serviceController.getById);
//Create user
router.post("/services", serviceController.Create);
//Update user
router.put("/services/:id", serviceController.Update);
//Delete user
router.delete("/services/:id", serviceController.Delete);

export default router;
