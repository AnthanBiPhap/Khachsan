import nodemailer from "nodemailer";
import { env } from "../helpers/env.helper";

// Tạo transporter với Gmail
const createTransporter = () => {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail credentials chưa được cấu hình. Vui lòng thiết lập GMAIL_USER và GMAIL_APP_PASSWORD trong file .env");
  }
  
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD.replace(/\s/g, ""), // Loại bỏ khoảng trắng trong app password
    },
  });
};

interface BookingConfirmationEmailData {
  to: string;
  bookingId: string;
  guestName: string;
  roomNumber: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  services?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

// Hàm gửi email xác nhận đặt phòng
const sendBookingConfirmation = async (data: BookingConfirmationEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email đến ${data.to}`);
    console.log(`📧 Email service: GMAIL_USER=${env.GMAIL_USER}, GMAIL_APP_PASSWORD có tồn tại=${!!env.GMAIL_APP_PASSWORD}`);
    
    const transporter = createTransporter();
    
    // Verify transporter connection
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    // Format ngày tháng
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Format tiền VND
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    // Tạo HTML cho danh sách dịch vụ
    let servicesHtml = "";
    if (data.services && data.services.length > 0) {
      servicesHtml = `
        <h3 style="color: #333; margin-top: 20px;">Dịch vụ đã đặt:</h3>
        <ul style="list-style: none; padding: 0;">
          ${data.services
            .map(
              (service) => `
            <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>${service.name}</strong> - Số lượng: ${service.quantity} - ${formatCurrency(service.price * service.quantity)}
            </li>
          `
            )
            .join("")}
        </ul>
      `;
    }

    const mailOptions = {
      from: `"Khách sạn" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: "Xác nhận đặt phòng thành công",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .booking-info {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #ddd;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            .value {
              color: #333;
            }
            .price-highlight {
              color: #4CAF50;
              font-size: 18px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Đặt phòng thành công!</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${data.guestName}</strong>,</p>
              
              <p>Cảm ơn bạn đã đặt phòng tại khách sạn của chúng tôi. Đặt phòng của bạn đã được xác nhận thành công!</p>
              
              <div class="booking-info">
                <h2 style="margin-top: 0; color: #4CAF50;">Thông tin đặt phòng</h2>
                
                <div class="info-row">
                  <span class="label">Mã đặt phòng:</span>
                  <span class="value"><strong>${data.bookingId}</strong></span>
                </div>
                
                <div class="info-row">
                  <span class="label">Số phòng:</span>
                  <span class="value"><strong>${data.roomNumber}</strong></span>
                </div>
                
                <div class="info-row">
                  <span class="label">Ngày nhận phòng:</span>
                  <span class="value">${formatDate(data.checkIn)}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Ngày trả phòng:</span>
                  <span class="value">${formatDate(data.checkOut)}</span>
                </div>
                
                ${servicesHtml}
                
                <div class="info-row">
                  <span class="label">Tổng tiền:</span>
                  <span class="value price-highlight">${formatCurrency(data.totalPrice)}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Đã thanh toán:</span>
                  <span class="value">${formatCurrency(data.paidAmount)}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Còn lại:</span>
                  <span class="value">${formatCurrency(data.remainingAmount)}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Trạng thái:</span>
                  <span class="value">
                    ${
                      data.paymentStatus === "paid"
                        ? "✅ Đã thanh toán đầy đủ"
                        : data.paymentStatus === "partial_paid"
                        ? "⏳ Đã thanh toán một phần"
                        : "⏸️ Chưa thanh toán"
                    }
                  </span>
                </div>
              </div>
              
              <p><strong>Lưu ý quan trọng:</strong></p>
              <ul>
                <li>Vui lòng mang theo CMND/CCCD khi nhận phòng</li>
                <li>Giờ check-in tiêu chuẩn: 14:00</li>
                <li>Giờ check-out tiêu chuẩn: 12:00</li>
                <li>Nếu có bất kỳ thay đổi nào, vui lòng liên hệ với chúng tôi sớm nhất có thể</li>
              </ul>
              
              <p>Chúng tôi rất mong được đón tiếp bạn!</p>
              
              <p>Trân trọng,<br><strong>Đội ngũ Khách sạn</strong></p>
            </div>
            
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>
              <p>Nếu có thắc mắc, vui lòng liên hệ qua số hotline hoặc email hỗ trợ.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email xác nhận đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email xác nhận đặt phòng:", error);
    throw error;
  }
};

interface GroupBookingConfirmationEmailData {
  to: string;
  groupBookingId: string;
  requesterName: string;
  checkIn: Date;
  checkOut: Date;
  peopleCount: number;
  roomCount: number;
  quoteAmount?: number;
  status: string;
  allocatedRooms?: Array<{
    roomNumber: string;
    typeName?: string;
  }>;
}

// Hàm gửi email xác nhận đặt phòng nhóm
const sendGroupBookingConfirmation = async (data: GroupBookingConfirmationEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email group booking đến ${data.to}`);
    console.log(`📧 Email service: GMAIL_USER=${env.GMAIL_USER}, GMAIL_APP_PASSWORD có tồn tại=${!!env.GMAIL_APP_PASSWORD}`);
    
    const transporter = createTransporter();
    
    // Verify transporter connection
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    
    // Format ngày tháng
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Format tiền VND
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    // Tạo HTML cho danh sách phòng
    let roomsHtml = "";
    if (data.allocatedRooms && data.allocatedRooms.length > 0) {
      roomsHtml = `
        <h3 style="color: #333; margin-top: 20px;">Phòng đã được phân bổ:</h3>
        <ul style="list-style: none; padding: 0;">
          ${data.allocatedRooms
            .map(
              (room) => `
            <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>Phòng ${room.roomNumber}</strong>${room.typeName ? ` - ${room.typeName}` : ""}
            </li>
          `
            )
            .join("")}
        </ul>
      `;
    } else {
      roomsHtml = `
        <p style="color: #666; font-style: italic;">Phòng sẽ được phân bổ sau khi admin duyệt yêu cầu.</p>
      `;
    }

    // Xác định trạng thái và thông điệp
    let statusMessage = "";
    let statusColor = "#666";
    switch (data.status) {
      case "pending_approval":
        statusMessage = "⏳ Đang chờ duyệt";
        statusColor = "#FF9800";
        break;
      case "approved":
        statusMessage = "✅ Đã được duyệt";
        statusColor = "#4CAF50";
        break;
      case "quoted":
        statusMessage = "💰 Đã có báo giá";
        statusColor = "#2196F3";
        break;
      case "awaiting_payment":
        statusMessage = "💳 Đang chờ thanh toán";
        statusColor = "#FF9800";
        break;
      case "deposit_paid":
        statusMessage = "✅ Đã đặt cọc";
        statusColor = "#4CAF50";
        break;
      case "paid":
        statusMessage = "✅ Đã thanh toán đầy đủ";
        statusColor = "#4CAF50";
        break;
      case "confirmed":
        statusMessage = "✅ Đã xác nhận";
        statusColor = "#4CAF50";
        break;
      default:
        statusMessage = data.status;
    }

    const mailOptions = {
      from: `"Khách sạn" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: "Xác nhận yêu cầu đặt phòng nhóm",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .booking-info {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #ddd;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            .value {
              color: #333;
            }
            .price-highlight {
              color: #4CAF50;
              font-size: 18px;
              font-weight: bold;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 10px;
              border-radius: 3px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Yêu cầu đặt phòng nhóm đã được gửi!</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${data.requesterName}</strong>,</p>
              
              <p>Cảm ơn bạn đã gửi yêu cầu đặt phòng nhóm tại khách sạn của chúng tôi. Yêu cầu của bạn đã được tiếp nhận và đang chờ admin duyệt.</p>
              
              <div class="booking-info">
                <h2 style="margin-top: 0; color: #4CAF50;">Thông tin yêu cầu đặt phòng nhóm</h2>
                
                <div class="info-row">
                  <span class="label">Mã yêu cầu:</span>
                  <span class="value"><strong>${data.groupBookingId}</strong></span>
                </div>
                
                <div class="info-row">
                  <span class="label">Ngày nhận phòng:</span>
                  <span class="value">${formatDate(data.checkIn)}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Ngày trả phòng:</span>
                  <span class="value">${formatDate(data.checkOut)}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Số lượng người:</span>
                  <span class="value"><strong>${data.peopleCount}</strong> người</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Số lượng phòng:</span>
                  <span class="value"><strong>${data.roomCount}</strong> phòng</span>
                </div>
                
                ${data.quoteAmount ? `
                <div class="info-row">
                  <span class="label">Tổng tiền:</span>
                  <span class="value price-highlight">${formatCurrency(data.quoteAmount)}</span>
                </div>
                ` : ""}
                
                <div class="info-row">
                  <span class="label">Trạng thái:</span>
                  <span class="value">
                    <span class="status-badge" style="background-color: ${statusColor}; color: white;">
                      ${statusMessage}
                    </span>
                  </span>
                </div>
                
                ${roomsHtml}
              </div>
              
              <p><strong>Lưu ý quan trọng:</strong></p>
              <ul>
                <li>Yêu cầu của bạn đang chờ admin xem xét và duyệt</li>
                <li>Sau khi được duyệt, bạn sẽ nhận được thông báo về phòng đã được phân bổ và báo giá</li>
                <li>Vui lòng mang theo CMND/CCCD khi nhận phòng</li>
                <li>Giờ check-in tiêu chuẩn: 14:00</li>
                <li>Giờ check-out tiêu chuẩn: 12:00</li>
                <li>Nếu có bất kỳ thay đổi nào, vui lòng liên hệ với chúng tôi sớm nhất có thể</li>
              </ul>
              
              <p>Chúng tôi sẽ liên hệ với bạn sớm nhất có thể!</p>
              
              <p>Trân trọng,<br><strong>Đội ngũ Khách sạn</strong></p>
            </div>
            
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>
              <p>Nếu có thắc mắc, vui lòng liên hệ qua số hotline hoặc email hỗ trợ.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email xác nhận group booking đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email xác nhận đặt phòng nhóm:", error);
    throw error;
  }
};

export default {
  sendBookingConfirmation,
  sendGroupBookingConfirmation,
};

