import express from "express";
import invoiceItemController from "../../controllers/invoiceItems.controller";
const router = express.Router();

//Get all users
router.get("/invoiceItems", invoiceItemController.getAll);
//Get user by id
router.get("/invoiceItems/:id", invoiceItemController.getById);
//Create user
router.post("/invoiceItems", invoiceItemController.Create);
//Update user
router.put("/invoiceItems/:id", invoiceItemController.Update);
//Delete user
router.delete("/invoiceItems/:id", invoiceItemController.Delete);

export default router;
