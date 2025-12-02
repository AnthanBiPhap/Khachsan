import nodemailer from "nodemailer";
import { env } from "../helpers/env.helper";

/**
 * Tạo transporter với Gmail để gửi email:
 * Kiểm tra thông tin đăng nhập Gmail và tạo transporter với cấu hình Gmail
 */
const createTransporter = () => {
  // Nếu thiếu thông tin đăng nhập Gmail thì báo lỗi
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

/**
 * Gửi email xác nhận đặt phòng: tạo và gửi email HTML với thông tin đặt phòng,
 * bao gồm thông tin phòng, ngày check-in/check-out, giá tiền và dịch vụ
 */
const sendBookingConfirmation = async (data: BookingConfirmationEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email đến ${data.to}`);
    console.log(`📧 Email service: GMAIL_USER=${env.GMAIL_USER}, GMAIL_APP_PASSWORD có tồn tại=${!!env.GMAIL_APP_PASSWORD}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    // Định dạng ngày tháng
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

    // Tạo HTML cho danh sách dịch vụ nếu có
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
                        ? "Đã thanh toán đầy đủ"
                        : data.paymentStatus === "partial_paid"
                        ? "Đã thanh toán một phần"
                        : "Chưa thanh toán"
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

interface GroupBookingApprovalEmailData {
  to: string;
  groupBookingId: string;
  requesterName: string;
  checkIn: Date;
  checkOut: Date;
  peopleCount: number;
  roomCount: number;
  allocatedRooms: Array<{
    roomNumber: string;
    typeName?: string;
  }>;
}

interface GroupBookingQuotedEmailData {
  to: string;
  groupBookingId: string;
  requesterName: string;
  checkIn: Date;
  checkOut: Date;
  peopleCount: number;
  roomCount: number;
  quoteAmount: number;
  paymentLink?: string;
}

interface GroupBookingRejectedEmailData {
  to: string;
  groupBookingId: string;
  requesterName: string;
  checkIn: Date;
  checkOut: Date;
  reason: string;
}

interface GroupBookingConfirmedEmailData {
  to: string;
  groupBookingId: string;
  requesterName: string;
  checkIn: Date;
  checkOut: Date;
  peopleCount: number;
  roomCount: number;
}

interface GroupBookingRefundedEmailData {
  to: string;
  groupBookingId: string;
  requesterName: string;
  checkIn: Date;
  checkOut: Date;
  refundAmount: number;
  note?: string;
}

interface GroupBookingFullPaymentEmailData {
  to: string;
  groupBookingId: string;
  requesterName: string;
  checkIn: Date;
  checkOut: Date;
  peopleCount: number;
  roomCount: number;
  totalAmount: number;
  paidAmount: number;
  invoicePdfBuffer?: Buffer;
  invoiceFileName?: string;
}

/**
 * Gửi email xác nhận đặt phòng nhóm: tạo và gửi email HTML với thông tin yêu cầu đặt phòng nhóm,
 * bao gồm trạng thái, số lượng người/phòng và phòng đã được phân bổ
 */
const sendGroupBookingConfirmation = async (data: GroupBookingConfirmationEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email group booking đến ${data.to}`);
    console.log(`📧 Email service: GMAIL_USER=${env.GMAIL_USER}, GMAIL_APP_PASSWORD có tồn tại=${!!env.GMAIL_APP_PASSWORD}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    
    // Định dạng ngày tháng
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Định dạng tiền VND
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    // Tạo HTML cho danh sách phòng đã được phân bổ
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

    // Xác định thông điệp và màu sắc dựa trên trạng thái
    let statusMessage = "";
    let statusColor = "#666";
    switch (data.status) {
      case "pending_approval":
        statusMessage = "Đang chờ duyệt";
        statusColor = "#FF9800";
        break;
      case "approved":
        statusMessage = "Đã được duyệt";
        statusColor = "#4CAF50";
        break;
      case "quoted":
        statusMessage = "Đã có báo giá";
        statusColor = "#2196F3";
        break;
      case "awaiting_payment":
        statusMessage = "Đang chờ thanh toán";
        statusColor = "#FF9800";
        break;
      case "deposit_paid":
        statusMessage = "Đã đặt cọc";
        statusColor = "#4CAF50";
        break;
      case "paid":
        statusMessage = "Đã thanh toán đầy đủ";
        statusColor = "#4CAF50";
        break;
      case "confirmed":
        statusMessage = "Đã xác nhận";
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

interface EmailVerificationData {
  to: string;
  fullName: string;
  verificationToken: string;
}

/**
 * Gửi email thông báo admin đã duyệt đặt phòng nhóm:
 * Thông báo yêu cầu đã được duyệt và phòng đã được phân bổ
 */
const sendGroupBookingApproval = async (data: GroupBookingApprovalEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email duyệt group booking đến ${data.to}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    
    // Định dạng ngày tháng
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Tạo HTML cho danh sách phòng đã được phân bổ
    let roomsHtml = "";
    if (data.allocatedRooms && data.allocatedRooms.length > 0) {
      roomsHtml = `
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1890ff; margin-top: 0;">Phòng đã được phân bổ:</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${data.allocatedRooms
              .map(
                (room) => `
              <li style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                <strong style="color: #1890ff; font-size: 16px;">Phòng ${room.roomNumber}</strong>${room.typeName ? ` <span style="color: #666;">- ${room.typeName}</span>` : ""}
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      `;
    }

    const checkInDate = formatDate(data.checkIn);
    const checkOutDate = formatDate(data.checkOut);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt phòng nhóm đã được duyệt</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Yêu cầu đã được duyệt</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${data.requesterName}</strong>,</p>
          
          <p style="font-size: 16px; color: #333;">
            Chúng tôi rất vui mừng thông báo rằng <strong>yêu cầu đặt phòng nhóm của bạn đã được duyệt</strong>.
          </p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1890ff; margin-top: 0;">Thông tin đặt phòng:</h3>
            <p style="margin: 8px 0;"><strong>Mã đặt phòng:</strong> ${data.groupBookingId}</p>
            <p style="margin: 8px 0;"><strong>Ngày nhận phòng:</strong> ${checkInDate}</p>
            <p style="margin: 8px 0;"><strong>Ngày trả phòng:</strong> ${checkOutDate}</p>
            <p style="margin: 8px 0;"><strong>Số phòng:</strong> ${data.roomCount} phòng</p>
            <p style="margin: 8px 0;"><strong>Số người:</strong> ${data.peopleCount} người</p>
          </div>

          ${roomsHtml}

          <div style="background-color: #fff7e6; padding: 20px; border-left: 4px solid #faad14; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #faad14; margin-top: 0;">Bước tiếp theo:</h3>
            <ol style="padding-left: 20px; margin: 10px 0;">
              <li style="margin: 8px 0;">Vui lòng chờ khách sạn gửi báo giá chi tiết</li>
              <li style="margin: 8px 0;">Sau khi nhận báo giá, bạn có thể thanh toán qua link được cung cấp</li>
              <li style="margin: 8px 0;">Nếu có thắc mắc, vui lòng liên hệ với chúng tôi</li>
            </ol>
          </div>

          <p style="font-size: 16px; color: #333; margin-top: 30px;">
            Cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ của chúng tôi!
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Trân trọng,<br>
            <strong>Đội ngũ Miko Hotel</strong>
          </p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Miko Hotel" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: `Yêu cầu đặt phòng nhóm đã được duyệt - Mã: ${data.groupBookingId}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email duyệt group booking đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email duyệt group booking:", error);
    throw error;
  }
};

/**
 * Gửi email thông báo admin đã báo giá đặt phòng nhóm:
 * Gửi báo giá chi tiết và link thanh toán nếu có
 */
const sendGroupBookingQuoted = async (data: GroupBookingQuotedEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email báo giá group booking đến ${data.to}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    
    // Định dạng ngày tháng
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Định dạng tiền VND
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const checkInDate = formatDate(data.checkIn);
    const checkOutDate = formatDate(data.checkOut);
    const formattedAmount = formatCurrency(data.quoteAmount);

    // Tạo HTML cho link thanh toán nếu có
    let paymentLinkHtml = "";
    if (data.paymentLink) {
      paymentLinkHtml = `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.paymentLink}" style="display: inline-block; background-color: #1890ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Thanh toán ngay
          </a>
        </div>
        <p style="text-align: center; color: #666; font-size: 14px; margin-top: 10px;">
          Hoặc sao chép link sau: <a href="${data.paymentLink}" style="color: #1890ff; word-break: break-all;">${data.paymentLink}</a>
        </p>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Báo giá đặt phòng nhóm</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Báo giá đặt phòng nhóm</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${data.requesterName}</strong>,</p>
          
          <p style="font-size: 16px; color: #333;">
            Chúng tôi đã chuẩn bị báo giá cho yêu cầu đặt phòng nhóm của bạn.
          </p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1890ff; margin-top: 0;">Thông tin đặt phòng:</h3>
            <p style="margin: 8px 0;"><strong>Mã đặt phòng:</strong> ${data.groupBookingId}</p>
            <p style="margin: 8px 0;"><strong>Ngày nhận phòng:</strong> ${checkInDate}</p>
            <p style="margin: 8px 0;"><strong>Ngày trả phòng:</strong> ${checkOutDate}</p>
            <p style="margin: 8px 0;"><strong>Số phòng:</strong> ${data.roomCount} phòng</p>
            <p style="margin: 8px 0;"><strong>Số người:</strong> ${data.peopleCount} người</p>
          </div>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #1890ff;">
            <h3 style="color: #1890ff; margin-top: 0; text-align: center;">Tổng tiền</h3>
            <p style="text-align: center; font-size: 32px; font-weight: bold; color: #1890ff; margin: 10px 0;">
              ${formattedAmount}
            </p>
          </div>

          ${paymentLinkHtml}

          <div style="background-color: #fff7e6; padding: 20px; border-left: 4px solid #faad14; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #faad14; margin-top: 0;">Lưu ý:</h3>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li style="margin: 8px 0;">Vui lòng thanh toán theo hướng dẫn được cung cấp</li>
              <li style="margin: 8px 0;">Đặt phòng sẽ được xác nhận sau khi thanh toán thành công</li>
              <li style="margin: 8px 0;">Nếu có thắc mắc, vui lòng liên hệ với chúng tôi</li>
            </ul>
          </div>

          <p style="font-size: 16px; color: #333; margin-top: 30px;">
            Cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ của chúng tôi!
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Trân trọng,<br>
            <strong>Đội ngũ Miko Hotel</strong>
          </p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Miko Hotel" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: `Báo giá đặt phòng nhóm - Mã: ${data.groupBookingId}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email báo giá group booking đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email báo giá group booking:", error);
    throw error;
  }
};

/**
 * Gửi email thông báo admin đã từ chối đặt phòng nhóm:
 * Thông báo yêu cầu bị từ chối kèm lý do
 */
const sendGroupBookingRejected = async (data: GroupBookingRejectedEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email từ chối group booking đến ${data.to}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    
    // Định dạng ngày tháng
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const checkInDate = formatDate(data.checkIn);
    const checkOutDate = formatDate(data.checkOut);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Yêu cầu đặt phòng nhóm đã bị từ chối</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Yêu cầu đã bị từ chối</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${data.requesterName}</strong>,</p>
          
          <p style="font-size: 16px; color: #333;">
            Chúng tôi rất tiếc phải thông báo rằng <strong>yêu cầu đặt phòng nhóm của bạn đã bị từ chối</strong>.
          </p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1890ff; margin-top: 0;">Thông tin yêu cầu:</h3>
            <p style="margin: 8px 0;"><strong>Mã đặt phòng:</strong> ${data.groupBookingId}</p>
            <p style="margin: 8px 0;"><strong>Ngày nhận phòng:</strong> ${checkInDate}</p>
            <p style="margin: 8px 0;"><strong>Ngày trả phòng:</strong> ${checkOutDate}</p>
          </div>

          <div style="background-color: #fff1f0; padding: 20px; border-left: 4px solid #ff4d4f; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #ff4d4f; margin-top: 0;">Lý do từ chối:</h3>
            <p style="color: #333; margin: 10px 0; white-space: pre-wrap;">${data.reason}</p>
          </div>

          <div style="background-color: #f0f9ff; padding: 20px; border-left: 4px solid #1890ff; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #1890ff; margin-top: 0;">Chúng tôi có thể giúp gì?</h3>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li style="margin: 8px 0;">Vui lòng liên hệ với chúng tôi để được tư vấn về các lựa chọn khác</li>
              <li style="margin: 8px 0;">Chúng tôi có thể đề xuất các ngày khác hoặc loại phòng phù hợp hơn</li>
              <li style="margin: 8px 0;">Nếu có thắc mắc, đừng ngần ngại liên hệ với chúng tôi</li>
            </ul>
          </div>

          <p style="font-size: 16px; color: #333; margin-top: 30px;">
            Chúng tôi rất mong được phục vụ bạn trong tương lai!
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Trân trọng,<br>
            <strong>Đội ngũ Miko Hotel</strong>
          </p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Miko Hotel" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: `Yêu cầu đặt phòng nhóm đã bị từ chối - Mã: ${data.groupBookingId}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email từ chối group booking đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email từ chối group booking:", error);
    throw error;
  }
};

/**
 * Gửi email thông báo admin đã xác nhận đặt phòng nhóm:
 * Thông báo đặt phòng đã được xác nhận hoàn tất
 */
const sendGroupBookingConfirmed = async (data: GroupBookingConfirmedEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email xác nhận group booking đến ${data.to}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    
    // Định dạng ngày tháng
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const checkInDate = formatDate(data.checkIn);
    const checkOutDate = formatDate(data.checkOut);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt phòng nhóm đã được xác nhận</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Đặt phòng đã được xác nhận</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${data.requesterName}</strong>,</p>
          
          <p style="font-size: 16px; color: #333;">
            Chúng tôi rất vui mừng thông báo rằng <strong>đặt phòng nhóm của bạn đã được xác nhận hoàn tất</strong>.
          </p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1890ff; margin-top: 0;">Thông tin đặt phòng:</h3>
            <p style="margin: 8px 0;"><strong>Mã đặt phòng:</strong> ${data.groupBookingId}</p>
            <p style="margin: 8px 0;"><strong>Ngày nhận phòng:</strong> ${checkInDate}</p>
            <p style="margin: 8px 0;"><strong>Ngày trả phòng:</strong> ${checkOutDate}</p>
            <p style="margin: 8px 0;"><strong>Số phòng:</strong> ${data.roomCount} phòng</p>
            <p style="margin: 8px 0;"><strong>Số người:</strong> ${data.peopleCount} người</p>
          </div>

          <div style="background-color: #f6ffed; padding: 20px; border-left: 4px solid #52c41a; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #52c41a; margin-top: 0;">Thông tin quan trọng:</h3>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li style="margin: 8px 0;">Đặt phòng của bạn đã sẵn sàng</li>
              <li style="margin: 8px 0;">Vui lòng đến đúng giờ check-in đã đặt</li>
              <li style="margin: 8px 0;">Mang theo giấy tờ tùy thân khi check-in</li>
              <li style="margin: 8px 0;">Nếu có thay đổi, vui lòng liên hệ với chúng tôi sớm nhất có thể</li>
            </ul>
          </div>

          <div style="background-color: #fff7e6; padding: 20px; border-left: 4px solid #faad14; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #faad14; margin-top: 0;">Lưu ý:</h3>
            <p style="margin: 10px 0;">Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ bạn!</p>
          </div>

          <p style="font-size: 16px; color: #333; margin-top: 30px;">
            Chúng tôi rất mong được đón tiếp bạn tại khách sạn!
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Trân trọng,<br>
            <strong>Đội ngũ Miko Hotel</strong>
          </p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Miko Hotel" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: `Đặt phòng nhóm đã được xác nhận - Mã: ${data.groupBookingId}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email xác nhận group booking đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email xác nhận group booking:", error);
    throw error;
  }
};

/**
 * Gửi email thông báo admin đã hoàn tiền group booking:
 * Thông báo số tiền hoàn lại và thời gian xử lý
 */
const sendGroupBookingRefunded = async (data: GroupBookingRefundedEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email hoàn tiền group booking đến ${data.to}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    
    // Định dạng ngày tháng
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Định dạng tiền VND
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const checkInDate = formatDate(data.checkIn);
    const checkOutDate = formatDate(data.checkOut);
    const formattedRefundAmount = formatCurrency(data.refundAmount);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hoàn tiền đặt phòng nhóm</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Hoàn tiền đã được xử lý</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${data.requesterName}</strong>,</p>
          
          <p style="font-size: 16px; color: #333;">
            Chúng tôi thông báo rằng <strong>yêu cầu hoàn tiền của bạn đã được xử lý</strong>.
          </p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1890ff; margin-top: 0;">Thông tin đặt phòng:</h3>
            <p style="margin: 8px 0;"><strong>Mã đặt phòng:</strong> ${data.groupBookingId}</p>
            <p style="margin: 8px 0;"><strong>Ngày nhận phòng:</strong> ${checkInDate}</p>
            <p style="margin: 8px 0;"><strong>Ngày trả phòng:</strong> ${checkOutDate}</p>
          </div>

          <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #ff9800;">
            <h3 style="color: #ff9800; margin-top: 0; text-align: center;">Số tiền hoàn</h3>
            <p style="text-align: center; font-size: 32px; font-weight: bold; color: #ff9800; margin: 10px 0;">
              ${formattedRefundAmount}
            </p>
          </div>

          ${data.note ? `
          <div style="background-color: #f0f9ff; padding: 20px; border-left: 4px solid #1890ff; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #1890ff; margin-top: 0;">Ghi chú:</h3>
            <p style="color: #333; margin: 10px 0; white-space: pre-wrap;">${data.note}</p>
          </div>
          ` : ''}

          <div style="background-color: #fff7e6; padding: 20px; border-left: 4px solid #faad14; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #faad14; margin-top: 0;">Lưu ý:</h3>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li style="margin: 8px 0;">Số tiền hoàn sẽ được chuyển về tài khoản của bạn trong vòng 3-5 ngày làm việc</li>
              <li style="margin: 8px 0;">Nếu bạn có thắc mắc về thời gian hoàn tiền, vui lòng liên hệ với chúng tôi</li>
              <li style="margin: 8px 0;">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi</li>
            </ul>
          </div>

          <p style="font-size: 16px; color: #333; margin-top: 30px;">
            Chúng tôi rất mong được phục vụ bạn trong tương lai!
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Trân trọng,<br>
            <strong>Đội ngũ Miko Hotel</strong>
          </p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Miko Hotel" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: `Hoàn tiền đặt phòng nhóm - Mã: ${data.groupBookingId}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email hoàn tiền group booking đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email hoàn tiền group booking:", error);
    throw error;
  }
};

/**
 * Gửi email thông báo thanh toán đủ toàn bộ group booking kèm hóa đơn:
 * Gửi email xác nhận thanh toán đủ và đính kèm PDF hóa đơn nếu có
 */
const sendGroupBookingFullPayment = async (data: GroupBookingFullPaymentEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email thanh toán đủ group booking đến ${data.to}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    
    // Định dạng ngày tháng
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Định dạng tiền VND
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const checkInDate = formatDate(data.checkIn);
    const checkOutDate = formatDate(data.checkOut);
    const formattedTotalAmount = formatCurrency(data.totalAmount);
    const formattedPaidAmount = formatCurrency(data.paidAmount);

    const attachments: any[] = [];
    
    // Đính kèm file PDF hóa đơn nếu có
    if (data.invoicePdfBuffer && data.invoiceFileName) {
      attachments.push({
        filename: data.invoiceFileName,
        content: data.invoicePdfBuffer,
        contentType: 'application/pdf',
      });
      console.log(`✅ Đã đính kèm PDF hóa đơn: ${data.invoiceFileName}`);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thanh toán đủ đặt phòng nhóm</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thanh toán thành công</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${data.requesterName}</strong>,</p>
          
          <p style="font-size: 16px; color: #333;">
            Cảm ơn bạn đã thanh toán! <strong>Đặt phòng nhóm của bạn đã được xác nhận thanh toán đủ</strong>.
          </p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1890ff; margin-top: 0;">Thông tin đặt phòng:</h3>
            <p style="margin: 8px 0;"><strong>Mã đặt phòng:</strong> ${data.groupBookingId}</p>
            <p style="margin: 8px 0;"><strong>Ngày nhận phòng:</strong> ${checkInDate}</p>
            <p style="margin: 8px 0;"><strong>Ngày trả phòng:</strong> ${checkOutDate}</p>
            <p style="margin: 8px 0;"><strong>Số phòng:</strong> ${data.roomCount} phòng</p>
            <p style="margin: 8px 0;"><strong>Số người:</strong> ${data.peopleCount} người</p>
          </div>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #1890ff;">
            <h3 style="color: #1890ff; margin-top: 0; text-align: center;">Thông tin thanh toán</h3>
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
              <span style="color: #666;">Tổng tiền:</span>
              <span style="font-weight: bold; color: #333;">${formattedTotalAmount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 0;">
              <span style="color: #666;">Đã thanh toán:</span>
              <span style="font-size: 20px; font-weight: bold; color: #52c41a;">${formattedPaidAmount}</span>
            </div>
          </div>

          ${data.invoicePdfBuffer ? `
          <div style="background-color: #e3f2fd; padding: 20px; border-left: 4px solid #2196F3; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #2196F3; margin-top: 0;">Hóa đơn:</h3>
            <p style="margin: 10px 0;">Hóa đơn thanh toán đã được đính kèm trong email này. Vui lòng kiểm tra file PDF đính kèm.</p>
          </div>
          ` : ''}

          <div style="background-color: #fff7e6; padding: 20px; border-left: 4px solid #faad14; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #faad14; margin-top: 0;">Lưu ý:</h3>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li style="margin: 8px 0;">Vui lòng lưu giữ email này và hóa đơn để làm bằng chứng thanh toán</li>
              <li style="margin: 8px 0;">Đặt phòng của bạn đã được xác nhận hoàn tất</li>
              <li style="margin: 8px 0;">Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi</li>
            </ul>
          </div>

          <p style="font-size: 16px; color: #333; margin-top: 30px;">
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Trân trọng,<br>
            <strong>Đội ngũ Miko Hotel</strong>
          </p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Miko Hotel" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: `Thanh toán đủ đặt phòng nhóm - Hóa đơn - Mã: ${data.groupBookingId}`,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email thanh toán đủ group booking đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email thanh toán đủ group booking:", error);
    throw error;
  }
};

/**
 * Gửi email xác nhận đăng ký: gửi email với link xác nhận email để kích hoạt tài khoản
 */
const sendEmailVerification = async (data: EmailVerificationData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email xác nhận đến ${data.to}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    
    // Tạo link xác nhận email (lấy từ env hoặc config)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/auth/verify-email?token=${data.verificationToken}`;

    const mailOptions = {
      from: `"Khách sạn" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: "Xác nhận địa chỉ email của bạn",
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
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: white;
              color: #4CAF50;
              text-decoration: none;
              border: 2px solid #4CAF50;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background-color: #4CAF50;
              color: white;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Chào mừng bạn đến với chúng tôi!</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${data.fullName}</strong>,</p>
              
              <p>Cảm ơn bạn đã đăng ký tài khoản tại khách sạn của chúng tôi!</p>
              
              <p>Để hoàn tất quá trình đăng ký và kích hoạt tài khoản, vui lòng xác nhận địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
              
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Xác nhận email</a>
              </div>
              
              <div class="warning">
                <p><strong>Lưu ý quan trọng:</strong></p>
                <ul>
                  <li>Link xác nhận sẽ hết hạn sau 24 giờ</li>
                  <li>Nếu bạn không thực hiện xác nhận, bạn sẽ không thể đăng nhập vào tài khoản</li>
                  <li>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này</li>
                </ul>
              </div>
              
              <p>Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ với chúng tôi qua email hỗ trợ.</p>
              
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
    console.error("❌ Lỗi gửi email xác nhận:", error);
    throw error;
  }
};

interface PasswordResetOTPData {
  to: string;
  fullName: string;
  otp: string;
}

/**
 * Gửi email OTP đặt lại mật khẩu: gửi mã OTP 6 số để người dùng đặt lại mật khẩu
 */
const sendPasswordResetOTP = async (data: PasswordResetOTPData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email OTP đến ${data.to}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);

    const mailOptions = {
      from: `"Khách sạn" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: "Mã xác nhận đặt lại mật khẩu",
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
              background-color: #2196F3;
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
            .otp-box {
              background-color: #f5f5f5;
              border: 2px dashed #2196F3;
              padding: 20px;
              text-align: center;
              border-radius: 5px;
              margin: 20px 0;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #2196F3;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Đặt lại mật khẩu</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${data.fullName}</strong>,</p>
              
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              
              <p>Vui lòng sử dụng mã xác nhận sau để tiếp tục quá trình đặt lại mật khẩu:</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Mã xác nhận của bạn:</p>
                <div class="otp-code">${data.otp}</div>
              </div>
              
              <div class="warning">
                <p><strong>Lưu ý quan trọng:</strong></p>
                <ul>
                  <li>Mã xác nhận này chỉ có hiệu lực trong 10 phút</li>
                  <li>Không chia sẻ mã này với bất kỳ ai</li>
                  <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                </ul>
              </div>
              
              <p>Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ với chúng tôi qua email hỗ trợ.</p>
              
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
    console.log(`✅ Email OTP đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email OTP:", error);
    throw error;
  }
};

interface PasswordResetConfirmationData {
  to: string;
  fullName: string;
}

/**
 * Gửi email xác nhận đã đặt lại mật khẩu thành công:
 * Thông báo mật khẩu đã được thay đổi và cảnh báo bảo mật
 */
const sendPasswordResetConfirmation = async (data: PasswordResetConfirmationData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email xác nhận đặt lại mật khẩu đến ${data.to}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);

    const mailOptions = {
      from: `"Khách sạn" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: "Mật khẩu đã được đặt lại thành công",
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
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Mật khẩu đã được đặt lại</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${data.fullName}</strong>,</p>
              
              <p>Mật khẩu của bạn đã được đặt lại thành công vào lúc ${new Date().toLocaleString('vi-VN')}.</p>
              
              <div class="warning">
                <p><strong>Lưu ý bảo mật:</strong></p>
                <ul>
                  <li>Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức</li>
                  <li>Đảm bảo mật khẩu mới của bạn là mạnh và không chia sẻ với ai</li>
                  <li>Nếu bạn nghi ngờ tài khoản bị xâm nhập, vui lòng thay đổi mật khẩu ngay</li>
                </ul>
              </div>
              
              <p>Bạn có thể đăng nhập ngay bây giờ với mật khẩu mới.</p>
              
              <p>Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ với chúng tôi qua email hỗ trợ.</p>
              
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
    console.log(`✅ Email xác nhận đặt lại mật khẩu đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email xác nhận đặt lại mật khẩu:", error);
    throw error;
  }
};

interface BookingCancellationEmailData {
  to: string;
  bookingId: string;
  guestName: string;
  roomNumber: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  refundAmount?: number;
  cancellationReason?: string;
}

/**
 * Gửi email xác nhận hủy phòng: thông báo đặt phòng đã bị hủy,
 * bao gồm thông tin hoàn tiền nếu có
 */
const sendBookingCancellation = async (data: BookingCancellationEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email hủy phòng đến ${data.to}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    
    // Định dạng ngày tháng
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Định dạng tiền VND
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const mailOptions = {
      from: `"Khách sạn" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: "Xác nhận hủy đặt phòng",
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
              background-color: #ff9800;
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
            .refund-highlight {
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
              <h1>Đặt phòng đã được hủy</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${data.guestName}</strong>,</p>
              
              <p>Đặt phòng của bạn đã được hủy thành công. Thông tin chi tiết như sau:</p>
              
              <div class="booking-info">
                <h2 style="margin-top: 0; color: #ff9800;">Thông tin đặt phòng đã hủy</h2>
                
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
                
                <div class="info-row">
                  <span class="label">Tổng tiền:</span>
                  <span class="value">${formatCurrency(data.totalPrice)}</span>
                </div>
                
                ${data.refundAmount ? `
                <div class="info-row">
                  <span class="label">Số tiền hoàn lại:</span>
                  <span class="value refund-highlight">${formatCurrency(data.refundAmount)}</span>
                </div>
                ` : ''}
              </div>
              
              ${data.cancellationReason ? `
              <p><strong>Lý do hủy:</strong> ${data.cancellationReason}</p>
              ` : ''}
              
              <p><strong>Lưu ý:</strong></p>
              <ul>
                ${data.refundAmount ? `
                <li>Số tiền hoàn lại sẽ được xử lý trong vòng 5-7 ngày làm việc</li>
                <li>Tiền sẽ được hoàn về phương thức thanh toán ban đầu của bạn</li>
                ` : ''}
                <li>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi</li>
                <li>Chúng tôi rất tiếc vì sự bất tiện này</li>
              </ul>
              
              <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
              
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
    console.log(`✅ Email hủy phòng đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email hủy phòng:", error);
    throw error;
  }
};

interface PaymentConfirmationEmailData {
  to: string;
  bookingId: string;
  guestName: string;
  roomNumber: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  paidAmount: number;
  invoicePdfBuffer?: Buffer;
  invoiceFileName?: string;
}

/**
 * Gửi email xác nhận thanh toán đủ kèm hóa đơn:
 * Gửi email xác nhận thanh toán đủ và đính kèm PDF hóa đơn nếu có
 */
const sendPaymentConfirmation = async (data: PaymentConfirmationEmailData) => {
  try {
    console.log(`📧 Email service: Bắt đầu gửi email xác nhận thanh toán đến ${data.to}`);
    
    const transporter = createTransporter();
    
    // Xác minh kết nối transporter
    await transporter.verify();
    console.log(`✅ Email service: Đã xác minh kết nối Gmail thành công`);
    
    // Định dạng ngày tháng
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Định dạng tiền VND
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const attachments: any[] = [];
    
    // Đính kèm file PDF hóa đơn nếu có
    if (data.invoicePdfBuffer && data.invoiceFileName) {
      attachments.push({
        filename: data.invoiceFileName,
        content: data.invoicePdfBuffer,
        contentType: 'application/pdf',
      });
    }

    const mailOptions = {
      from: `"Khách sạn" <${env.GMAIL_USER}>`,
      to: data.to,
      subject: "Xác nhận thanh toán đủ - Hóa đơn",
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
            .paid-highlight {
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
            .invoice-note {
              background-color: #e3f2fd;
              border-left: 4px solid #2196F3;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thanh toán thành công</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${data.guestName}</strong>,</p>
              
              <p>Cảm ơn bạn đã thanh toán! Đặt phòng của bạn đã được xác nhận thanh toán đủ. Thông tin chi tiết như sau:</p>
              
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
                
                <div class="info-row">
                  <span class="label">Tổng tiền:</span>
                  <span class="value">${formatCurrency(data.totalPrice)}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Đã thanh toán:</span>
                  <span class="value paid-highlight">${formatCurrency(data.paidAmount)}</span>
                </div>
              </div>
              
              <div class="invoice-note">
                <p><strong>📄 Hóa đơn:</strong></p>
                <p>Hóa đơn thanh toán đã được đính kèm trong email này. Vui lòng kiểm tra file PDF đính kèm.</p>
              </div>
              
              <p><strong>Lưu ý:</strong></p>
              <ul>
                <li>Vui lòng lưu giữ email này và hóa đơn để làm bằng chứng thanh toán</li>
                <li>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi</li>
                <li>Chúng tôi rất hân hạnh được phục vụ bạn!</li>
              </ul>
              
              <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
              
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
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email xác nhận thanh toán đã được gửi đến ${data.to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Lỗi gửi email xác nhận thanh toán:", error);
    throw error;
  }
};

export default {
  sendBookingConfirmation,
  sendGroupBookingConfirmation,
  sendGroupBookingApproval,
  sendGroupBookingQuoted,
  sendGroupBookingRejected,
  sendGroupBookingConfirmed,
  sendGroupBookingRefunded,
  sendGroupBookingFullPayment,
  sendEmailVerification,
  sendPasswordResetOTP,
  sendPasswordResetConfirmation,
  sendBookingCancellation,
  sendPaymentConfirmation,
};

