import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import User from '../models/users.model';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../helpers/env.helper';
import { Response } from 'express';
import emailService from './email.service';

/**
 * Đăng nhập người dùng: xác thực email và mật khẩu, kiểm tra trạng thái tài khoản,
 * và trả về access token và refresh token nếu đăng nhập thành công
 */
const login = async (email: string, password: string) => {
    // Chỉ tìm user chưa bị xóa
    const user = await User.findOne({email, deletedAt: null});
    if(!user) {
        throw createError(401, 'Email hoặc mật khẩu không đúng');
    }
    
    // Kiểm tra tài khoản có bị vô hiệu hóa không
    if(user.status === 'blocked') {
        throw createError(403, 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
    }
    
    // Kiểm tra email đã được xác nhận chưa (chỉ cho customer)
    if(user.role === 'customer' && !user.emailVerified) {
        throw createError(403, 'Vui lòng xác nhận email trước khi đăng nhập. Kiểm tra hộp thư email của bạn để tìm link xác nhận.');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        throw createError(401, 'Email hoặc mật khẩu không đúng');
    }

    const accessToken  = jwt.sign(
        { _id: user._id, email: user.email},
        env.JWT_SECRET as string,
        {
          expiresIn: '24h', // expires in 1 hour (1 x 60 x 60)
        }
      );
    const refreshToken  = jwt.sign(
        { _id: user._id, email: user.email},
        env.JWT_SECRET as string,
        {
          expiresIn: '365d', // expires in 365 days
        }
      );
    
      return {
        user: { id: user._id, email: user.email},
        accessToken,
        refreshToken
      };
    }

/**
 * Lấy thông tin profile của người dùng hiện tại từ res.locals
 */
const getProfile = async (res: Response) => {
        const { user } = res.locals;
        return user;
    }

/**
 * Xác nhận email của người dùng bằng token xác nhận
 * Cập nhật trạng thái emailVerified và xóa token sau khi xác nhận thành công
 */
const verifyEmail = async (token: string) => {
    // Tìm user với token hợp lệ và chưa hết hạn
    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationTokenExpires: { $gt: new Date() },
        deletedAt: null
    });

    if (!user) {
        throw createError(400, 'Token xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email xác nhận.');
    }

    // Kiểm tra xem email đã được xác nhận chưa
    if (user.emailVerified) {
        throw createError(400, 'Email đã được xác nhận trước đó.');
    }

    // Cập nhật trạng thái xác nhận email
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    return { message: 'Email đã được xác nhận thành công. Bạn có thể đăng nhập ngay bây giờ.' };
}

/**
 * Yêu cầu đặt lại mật khẩu: tạo và gửi mã OTP 6 số đến email của người dùng
 * OTP có thời hạn 10 phút
 */
const requestForgotPassword = async (email: string) => {
    // Tìm user theo email
    const user = await User.findOne({ email, deletedAt: null });
    
    // Không tiết lộ email có tồn tại hay không (bảo mật)
    if (!user) {
        // Vẫn trả về success để không tiết lộ email có tồn tại
        return { message: 'Nếu email tồn tại, chúng tôi đã gửi mã xác nhận đến email của bạn.' };
    }
    
    // Kiểm tra tài khoản có bị vô hiệu hóa không
    if (user.status === 'blocked') {
        throw createError(403, 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
    }
    
    // Tạo mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Lưu OTP và thời gian hết hạn (10 phút)
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
    await user.save();
    
    // Gửi email OTP
    try {
        await emailService.sendPasswordResetOTP({
            to: user.email,
            fullName: user.fullName,
            otp: otp
        });
        console.log(`✅ Đã gửi OTP đặt lại mật khẩu đến ${user.email}`);
    } catch (emailError) {
        console.error("❌ Lỗi gửi email OTP:", emailError);
        // Xóa OTP nếu gửi email thất bại
        user.passwordResetOTP = undefined;
        user.passwordResetOTPExpires = undefined;
        await user.save();
        throw createError(500, 'Không thể gửi email. Vui lòng thử lại sau.');
    }
    
    return { message: 'Nếu email tồn tại, chúng tôi đã gửi mã xác nhận đến email của bạn.' };
}

/**
 * Xác nhận mã OTP để đặt lại mật khẩu
 * Kiểm tra OTP có hợp lệ và chưa hết hạn hay không
 */
const verifyOTP = async (email: string, otp: string) => {
    const user = await User.findOne({
        email,
        passwordResetOTP: otp,
        passwordResetOTPExpires: { $gt: new Date() },
        deletedAt: null
    });
    
    if (!user) {
        throw createError(400, 'Mã xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại mã.');
    }
    
    // OTP hợp lệ, trả về success (không xóa OTP ngay, sẽ xóa khi reset password)
    return { message: 'Mã xác nhận hợp lệ. Bạn có thể đặt lại mật khẩu.' };
}

/**
 * Đặt lại mật khẩu mới cho người dùng sau khi xác nhận OTP thành công
 * Xóa OTP sau khi đặt lại mật khẩu và gửi email xác nhận
 */
const resetPassword = async (email: string, otp: string, newPassword: string) => {
    // Tìm user với OTP hợp lệ
    const user = await User.findOne({
        email,
        passwordResetOTP: otp,
        passwordResetOTPExpires: { $gt: new Date() },
        deletedAt: null
    });
    
    if (!user) {
        throw createError(400, 'Mã xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại mã.');
    }
    
    // Kiểm tra mật khẩu mới
    if (!newPassword || newPassword.length < 6) {
        throw createError(400, 'Mật khẩu mới phải có ít nhất 6 ký tự.');
    }
    
    // Đặt lại mật khẩu (middleware pre-save sẽ tự động hash)
    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();
    
    // Gửi email xác nhận đã đặt lại mật khẩu
    try {
        await emailService.sendPasswordResetConfirmation({
            to: user.email,
            fullName: user.fullName
        });
        console.log(`✅ Đã gửi email xác nhận đặt lại mật khẩu đến ${user.email}`);
    } catch (emailError) {
        console.error("❌ Lỗi gửi email xác nhận đặt lại mật khẩu:", emailError);
        // Không throw error vì mật khẩu đã được đặt lại thành công
    }
    
    return { message: 'Mật khẩu đã được đặt lại thành công. Email xác nhận đã được gửi đến bạn. Bạn có thể đăng nhập ngay bây giờ.' };
}

export default {
    login,
    getProfile,
    verifyEmail,
    requestForgotPassword,
    verifyOTP,
    resetPassword
}