import { NextFunction, Request, Response } from 'express';
import roomTypeService from "../services/roomTypes.service";
import  {sendJsonSuccess, httpStatus}  from '../helpers/response.helper';

/**
 * Controller:
 * - Nhận request từ route
 * - NHận kết quả từ revice tương ứng
 * - Response lai cho client
 * - Không nên xử lý logic nghiệp vụ ở controller
 */
// Get all users
const getAll = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const users = await roomTypeService.getAll(req.query);
    sendJsonSuccess(res, users, httpStatus.OK.statusCode, httpStatus.OK.message);
    }
    catch(error) {
        next(error);
    }
}
//  Get user by id
const getById = async(req: Request, res: Response, next: NextFunction) => {
    try{
        console.log("JWT_SECRET:", process.env.JWT_SECRET);
        const { id } = req.params;
        const user = await roomTypeService.getById(id);
        sendJsonSuccess(res, user, httpStatus.OK.statusCode, httpStatus.OK.message);
    }
    catch(error) {
        next(error);
    }
}

// Create user
const Create = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const payload = req.body;
        const user = await roomTypeService.create(payload);
        sendJsonSuccess(res, user, httpStatus.CREATED.statusCode, httpStatus.CREATED.message);
    } catch (error) {
        next(error);
    }
}
// Update user
const Update = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { id } = req.params;
        const payload = req.body;
        const user = await roomTypeService.updateById(id, payload);
        sendJsonSuccess(res, user, httpStatus.OK.statusCode, httpStatus.OK.message);
    }
    catch(error) {
        next (error);
    }
}
// Delete user
const Delete = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { id } = req.params;
        const user = roomTypeService.deleteById(id);
        res.status(204).json({
            user,
            message: 'users deleted successfully'
        });
    }
    catch(error) {
        next (error);
    }
}

export default {
    getAll,
    getById,
    Create,
    Update,
    Delete
}