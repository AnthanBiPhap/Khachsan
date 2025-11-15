import express from "express";
import userController from "../../controllers/users.controller";
import validateSchemaYup from "../../middlewares/validate.middleware";
import userValidation from "../../validations/users.validation";
const router = express.Router();

//Get all users
router.get("/users", validateSchemaYup(userValidation.getAllSchema), userController.getAll);
//Get deleted users - PHẢI ĐẶT TRƯỚC /users/:id để tránh match nhầm
router.get("/users/deleted", validateSchemaYup(userValidation.getAllSchema), userController.getDeletedUsers);
//Get user by id
router.get("/users/:id", validateSchemaYup(userValidation.getByIdSchema), userController.getById);
//Create user
router.post("/users", validateSchemaYup(userValidation.createSchema), userController.Create);
//Update user
router.put("/users/:id", validateSchemaYup(userValidation.updateByIdSchema), userController.Update);
//Delete user (soft delete)
router.delete("/users/:id", validateSchemaYup(userValidation.deleteByIdSchema), userController.Delete);

export default router;
