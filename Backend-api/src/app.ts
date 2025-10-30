import express, { Request, Response, NextFunction } from "express";
import userRoute from "./router/v1/users.route";
import streamRoute from "./router/v1/stream.route";
import authRoute from "./router/v1/auth.route";
import locationRoute from "./router/v1/locations.route";
import roomTypeRoute from "./router/v1/roomTypes.route";
import roomRoute from "./router/v1/rooms.route";
import serviceRoute from "./router/v1/services.route";
import invoiceRoute from "./router/v1/invoices.route";
import bookingRoute from "./router/v1/bookings.route";
import serviceBookingRoute from "./router/v1/serviceBookings.route";
import reviewRoute from "./router/v1/reviews.route";
import bookingStatusRoute from "./router/v1/bookingStatus.route";
import paymentRoute from "./router/v1/payments.route";
import groupBookingRoute from "./router/v1/groupBookings.route";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/api/v1", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/get-profile", authRoute);
app.use("/api/v1", locationRoute);
app.use("/api/v1", roomTypeRoute);
app.use("/api/v1", roomRoute);
app.use("/api/v1", serviceRoute);
app.use("/api/v1", invoiceRoute);
app.use("/api/v1", bookingRoute);
app.use("/api/v1", serviceBookingRoute);
app.use("/api/v1", reviewRoute);
app.use("/api/v1", bookingStatusRoute);
app.use("/api/v1", paymentRoute);
app.use("/api/v1", groupBookingRoute);
app.use("/api/v1", streamRoute);
// Hello World
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Middleware xử lý lỗi
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // log ra console để debug

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    status,
    message,
  });
});

// Middleware 404 (route không tồn tại)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: "Not Found",
  });
});

export default app;
