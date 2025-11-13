import { NextFunction, Request, Response } from "express";
import notificationsService from "../services/notifications.service";
import { sendJsonSuccess, httpStatus } from "../helpers/response.helper";

// Get all notifications
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await notificationsService.getAll(req.query);
    sendJsonSuccess(
      res,
      notifications,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};

// Get notifications by user ID
const getByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const notifications = await notificationsService.getByUserId(
      userId,
      req.query
    );
    sendJsonSuccess(
      res,
      notifications,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};

// Get notification by id
const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const notification = await notificationsService.getById(id);
    sendJsonSuccess(
      res,
      notification,
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = res.locals.user?._id || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const notification = await notificationsService.markAsRead(id, userId.toString());
    sendJsonSuccess(
      res,
      notification,
      httpStatus.OK.statusCode,
      "Notification marked as read"
    );
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user?._id || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await notificationsService.markAllAsRead(userId.toString());
    sendJsonSuccess(
      res,
      result,
      httpStatus.OK.statusCode,
      "All notifications marked as read"
    );
  } catch (error) {
    next(error);
  }
};

// Get unread count
const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user?._id || req.params.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const count = await notificationsService.getUnreadCount(userId.toString());
    sendJsonSuccess(
      res,
      { unreadCount: count },
      httpStatus.OK.statusCode,
      httpStatus.OK.message
    );
  } catch (error) {
    next(error);
  }
};

// Delete notification
const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const notification = await notificationsService.deleteById(id);
    sendJsonSuccess(
      res,
      notification,
      httpStatus.OK.statusCode,
      "Notification deleted"
    );
  } catch (error) {
    next(error);
  }
};

// Delete all read notifications
const deleteAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await notificationsService.deleteAllRead(userId);
    sendJsonSuccess(
      res,
      result,
      httpStatus.OK.statusCode,
      "All read notifications deleted"
    );
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getByUserId,
  getById,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteById,
  deleteAllRead,
};

