import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import User from '../models/users.model';
import bcrypt from 'bcryptjs';
import { env } from '../helpers/env.helper';
import { Response } from 'express';
const login = async (email: string, password: string) => {
    // Chỉ tìm user chưa bị xóa
    const user = await User.findOne({email, deletedAt: null});
    if(!user) {
        throw createError(401, 'Invalid email or password');
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
        throw createError(401, 'Invalid email or password');
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
const getProfile = async (res: Response) => {
        const { user } = res.locals;
        return user;
    }

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

export default {
    login,
    getProfile,
    verifyEmail
}