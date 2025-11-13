import express, { Request, Response, NextFunction } from "express";
import notificationsController from "../../controllers/notifications.controller";
import notificationsService from "../../services/notifications.service";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { sendJsonSuccess, httpStatus } from "../../helpers/response.helper";

const router = express.Router();

// Get all notifications (with filters)
router.get("/notifications", authenticateToken, notificationsController.getAll);

// Get notifications by user ID
router.get(
  "/notifications/user/:userId",
  authenticateToken,
  notificationsController.getByUserId
);

// Get my notifications (current user)
router.get(
  "/notifications/me",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.user._id.toString();
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
  }
);

// Get unread count for current user
router.get(
  "/notifications/unread/count",
  authenticateToken,
  notificationsController.getUnreadCount
);

// Get notification by id
router.get(
  "/notifications/:id",
  authenticateToken,
  notificationsController.getById
);

// Mark notification as read
router.patch(
  "/notifications/:id/read",
  authenticateToken,
  notificationsController.markAsRead
);

// Mark all notifications as read
router.patch(
  "/notifications/read/all",
  authenticateToken,
  notificationsController.markAllAsRead
);

// Delete notification
router.delete(
  "/notifications/:id",
  authenticateToken,
  notificationsController.deleteById
);

// Delete all read notifications
router.delete(
  "/notifications/read/all",
  authenticateToken,
  notificationsController.deleteAllRead
);

export default router;

