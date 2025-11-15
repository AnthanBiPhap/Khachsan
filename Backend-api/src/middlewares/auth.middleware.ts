import jwt, { JwtPayload }  from 'jsonwebtoken';
import User from '../models/users.model';
import { Request, Response, NextFunction } from "express";
import createError from 'http-errors';
import { env } from '../helpers/env.helper';

interface decodedJWT extends JwtPayload {
   _id?: string
 }

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  //Get the jwt token from the head
  const authHeader = req.headers['authorization'];
  if(!authHeader) {
    return next(createError(401, 'Unauthorized'));
  }
    const token = authHeader && authHeader.split(' ')[1];

     //If token is not valid, respond with 401 (unauthorized)
    if (!token) {
      return next(createError(401, 'Unauthorized'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET as string) as decodedJWT;
      //try verify user exits in database (chỉ lấy user chưa bị xóa)
      const user = await User
      .findOne({
        _id: decoded._id,
        deletedAt: null
      })
      .select('-password -__v');

      if (!user) {
        return next(createError(401, 'Unauthorized'));
      }
      
      // Kiểm tra tài khoản có bị vô hiệu hóa không
      if(user.status === 'blocked') {
        return next(createError(403, 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.'));
      }
      
      //Đăng ký biến user global trong app
      res.locals.user = user;

      next();
    } catch (err: any) {
      // Token không hợp lệ, hết hạn, hoặc có lỗi khi verify
      if (err.name === 'TokenExpiredError') {
        return next(createError(401, 'Token đã hết hạn. Vui lòng đăng nhập lại.'));
      }
      if (err.name === 'JsonWebTokenError') {
        return next(createError(401, 'Token không hợp lệ. Vui lòng đăng nhập lại.'));
      }
      return next(createError(401, 'Xác thực thất bại. Vui lòng đăng nhập lại.'));
    }
};

export const authorize = (roles: string[] = []) => {
    // roles param can be a single role string (e.g. Role.user or 'user') 
    // or an array of roles (e.g. [Role.Admin, Role.user] or ['Admin', 'user'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req: Request, res: Response, next: NextFunction) => {
      if (roles.length && res.locals.user.role && !roles.includes(res.locals.user.role)) {
        return next(createError(403, 'Forbidden'));
      }
        // authentication and authorization successful
        next();
    }
}