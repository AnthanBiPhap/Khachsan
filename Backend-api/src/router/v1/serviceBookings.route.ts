import express from "express";
import serviceBookingController from "../../controllers/serviceBookings.controller";
import validateSchemaYup from "../../middlewares/validate.middleware";
import serviceBookingValidation from "../../validations/serviceBookings.validation";

const router = express.Router();

//Get all service bookings
router.get("/serviceBookings", validateSchemaYup(serviceBookingValidation.getAllSchema), serviceBookingController.getAll);
//Get service booking by id
router.get("/serviceBookings/:id", validateSchemaYup(serviceBookingValidation.getByIdSchema), serviceBookingController.getById);
//Create service booking
router.post("/serviceBookings", validateSchemaYup(serviceBookingValidation.createSchema), serviceBookingController.Create);
//Update service booking
router.put("/serviceBookings/:id", validateSchemaYup(serviceBookingValidation.updateByIdSchema), serviceBookingController.Update);
//Delete service booking
router.delete("/serviceBookings/:id", validateSchemaYup(serviceBookingValidation.deleteByIdSchema), serviceBookingController.Delete);

export default router;
