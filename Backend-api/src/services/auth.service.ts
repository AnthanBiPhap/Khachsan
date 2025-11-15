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
export default {
    login,
    getProfile
}