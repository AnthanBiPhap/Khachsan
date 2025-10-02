import { NextFunction, Request, Response } from 'express';
import chatService from "../services/chats.service";
import { sendJsonSuccess, httpStatus } from '../helpers/response.helper';

/**
 * Controller Chat:
 * - Nhận request từ route
 * - Nhận kết quả từ service
 * - Response lại cho client
 * - Không xử lý logic nghiệp vụ ở controller
 */

// Lấy tất cả chat
const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chats = await chatService.getAll(req.query);
        sendJsonSuccess(res, chats, httpStatus.OK.statusCode, httpStatus.OK.message);
    } catch (error) {
        next(error);
    }
};

// Lấy chat theo id
const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const chat = await chatService.getById(id);
        sendJsonSuccess(res, chat, httpStatus.OK.statusCode, httpStatus.OK.message);
    } catch (error) {
        next(error);
    }
};

// Tạo tin nhắn mới
const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        const chat = await chatService.create(payload);
        sendJsonSuccess(res, chat, httpStatus.CREATED.statusCode, httpStatus.CREATED.message);
    } catch (error) {
        next(error);
    }
};

// Cập nhật tin nhắn
const updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const payload = req.body;
        const chat = await chatService.updateById(id, payload);
        sendJsonSuccess(res, chat, httpStatus.OK.statusCode, httpStatus.OK.message);
    } catch (error) {
        next(error);
    }
};

// Xoá tin nhắn
const deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await chatService.deleteById(id);
        res.status(204).json({
            message: 'Chat deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getAll,
    getById,
    create,
    updateById,
    deleteById
};
