import mongoose from "mongoose";
import User from "./models/users.model";
import Service from "./models/services.model";
import ContactInfo from "./models/contactInfo.model";
import AboutInfo from "./models/aboutInfo.model";

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

export const seedServices = async () => {
  try {
    // Kiểm tra xem đã có services chưa
    const existingServices = await Service.countDocuments();
    if (existingServices > 0) {
      console.log("Services đã tồn tại, bỏ qua seed.");
      return;
    }

    const servicesData = [
      {
        name: "Massage Thư Giãn",
        description: "Dịch vụ massage chuyên nghiệp giúp thư giãn cơ thể và tinh thần sau một ngày dài.",
        basePrice: 500000,
        workingHours: {
          startTime: "08:00",
          endTime: "22:00"
        },
        images: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500"],
        status: "active"
      },
      {
        name: "Phòng Tập Gym",
        description: "Phòng tập hiện đại với đầy đủ thiết bị tập luyện cho mọi nhu cầu thể dục.",
        basePrice: 200000,
        workingHours: {
          startTime: "06:00",
          endTime: "22:00"
        },
        images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500"],
        status: "active"
      },
      {
        name: "Spa & Chăm Sóc Da",
        description: "Dịch vụ spa cao cấp với các liệu pháp chăm sóc da chuyên nghiệp.",
        basePrice: 800000,
        workingHours: {
          startTime: "09:00",
          endTime: "21:00"
        },
        images: ["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500"],
        status: "active"
      }
    ];

    for (const serviceData of servicesData) {
      const service = new Service(serviceData);
      await service.save();
    }

    console.log("Services mẫu đã được tạo thành công!");
  } catch (err) {
    console.error("Lỗi khi seed services:", err);
  }
};

export const seedContactInfo = async () => {
  try {
    // Kiểm tra xem đã có contactInfo chưa
    const existingContactInfo = await ContactInfo.findOne();
    if (existingContactInfo) {
      console.log("ContactInfo đã tồn tại, bỏ qua seed.");
      return;
    }

    // Tạo contactInfo mặc định (sẽ dùng default values từ model)
    const contactInfo = new ContactInfo();
    await contactInfo.save();

    console.log("ContactInfo mặc định đã được tạo thành công!");
  } catch (err) {
    console.error("Lỗi khi seed contactInfo:", err);
  }
};

export const seedAboutInfo = async () => {
  try {
    // Kiểm tra xem đã có aboutInfo chưa
    const existingAboutInfo = await AboutInfo.findOne();
    if (existingAboutInfo) {
      console.log("AboutInfo đã tồn tại, bỏ qua seed.");
      return;
    }

    // Tạo aboutInfo mặc định (sẽ dùng default values từ model)
    const aboutInfo = new AboutInfo();
    await aboutInfo.save();

    console.log("AboutInfo mặc định đã được tạo thành công!");
  } catch (err) {
    console.error("Lỗi khi seed aboutInfo:", err);
  }
};

export default seedAdmin;
