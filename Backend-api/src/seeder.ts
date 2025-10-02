import mongoose from "mongoose";
import User from "./models/users.model";

export const seedAdmin = async () => {
  try {
    const ADMIN_ID = new mongoose.Types.ObjectId("68dcbc941c2f49bbfc7e6ed2"); // ID cố định

    // Kiểm tra xem admin với _id này đã tồn tại chưa
    const existingAdmin = await User.findById(ADMIN_ID);
    if (existingAdmin) {
      console.log("Admin đã tồn tại, bỏ qua seed.");
      return;
    }

    // Tạo admin mặc định với _id cố định
    const adminData = {
      _id: ADMIN_ID,
      fullName: "admin",
      email: "admin@gmail.com",
      password: "123456", // sẽ hash nhờ pre-save middleware
      phoneNumber: "0362310328",
      role: "admin",
      status: "active",
    };

    const admin = new User(adminData);
    await admin.save();

    console.log("Admin mặc định đã được tạo thành công với _id cố định!");
  } catch (err) {
    console.error("Lỗi khi seed admin:", err);
  }
};

export default seedAdmin;
