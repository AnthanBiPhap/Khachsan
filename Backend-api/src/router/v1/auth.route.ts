import express from 'express';
import authController from '../../controllers/auth.controller';
import validateSchemaYup from '../../middlewares/validate.middleware';
import authValidation from '../../validations/auth.validation';
import { authenticateToken } from '../../middlewares/auth.middleware';
const router = express.Router();

router.post('/login',validateSchemaYup(authValidation.loginSchema), authController.login);
router.get('/verify-email', authController.verifyEmail);
router.get('/get-profile', authenticateToken, authController.getProfile);
router.post('/forgot-password', authController.requestForgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

export default router;