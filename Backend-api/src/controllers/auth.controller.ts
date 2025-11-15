import  { Request, Response, NextFunction} from 'express';
import authService from '../services/auth.service';
import { httpStatus } from '../helpers/response.helper';
import { sendJsonSuccess } from '../helpers/response.helper';

const login = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const tokens = await authService.login(req.body.email, req.body.password);
        sendJsonSuccess(res, tokens, httpStatus.OK.statusCode, httpStatus.OK.message);
    } catch (error) {
        next(error);
    }
}

const verifyEmail = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Token xác nhận là bắt buộc' 
            });
        }
        const result = await authService.verifyEmail(token);
        sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
    } catch (error) {
        next(error);
    }
}

const getProfile = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const user = await authService.getProfile(res);
        sendJsonSuccess(res, user, httpStatus.OK.statusCode, httpStatus.OK.message);
    } catch (error) {
        next(error);
    }
}

const requestForgotPassword = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email là bắt buộc' 
            });
        }
        const result = await authService.requestForgotPassword(email);
        sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
    } catch (error) {
        next(error);
    }
}

const verifyOTP = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email và mã OTP là bắt buộc' 
            });
        }
        const result = await authService.verifyOTP(email, otp);
        sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
    } catch (error) {
        next(error);
    }
}

const resetPassword = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, mã OTP và mật khẩu mới là bắt buộc' 
            });
        }
        const result = await authService.resetPassword(email, otp, newPassword);
        sendJsonSuccess(res, result, httpStatus.OK.statusCode, httpStatus.OK.message);
    } catch (error) {
        next(error);
    }
}

export default {
    login,
    verifyEmail,
    getProfile,
    requestForgotPassword,
    verifyOTP,
    resetPassword
}
