import express from "express";
import invoiceController from "../../controllers/invoices.controller";
const router = express.Router();

//Get all users
router.get("/invoices", invoiceController.getAll);
//Get user by id
router.get("/invoices/:id", invoiceController.getById);
//Create user
router.post("/invoices", invoiceController.Create);
//Update user
router.put("/invoices/:id", invoiceController.Update);
//Delete user
router.delete("/invoices/:id", invoiceController.Delete);
router.get("/invoices/:id/print", invoiceController.Print);

export default router;
