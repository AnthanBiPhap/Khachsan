import express from "express";
import reviewController from "../../controllers/reviews.controller";
const router = express.Router();

//Get all users
router.get("/reviews", reviewController.getAll);
//Get user by id
router.get("/reviews/:id", reviewController.getById);
//Create user
router.post("/reviews", reviewController.Create);
//Update user
router.put("/reviews/:id", reviewController.Update);
//Delete user
router.delete("/reviews/:id", reviewController.Delete);

export default router;
