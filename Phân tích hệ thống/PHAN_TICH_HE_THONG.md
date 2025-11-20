# 📊 PHÂN TÍCH TOÀN BỘ HỆ THỐNG MIKO HOTEL

## 🎯 TỔNG QUAN

Hệ thống quản lý khách sạn **Miko Hotel** là một hệ thống quản lý khách sạn toàn diện với 3 thành phần chính:
1. **Backend API** - Xử lý logic nghiệp vụ và API
2. **Admin Panel** - Giao diện quản trị cho admin/staff
3. **Customer Frontend** - Website đặt phòng cho khách hàng

---

## 📝 MÔ TẢ ĐỀ TÀI

**Miko Hotel** mang đến cho bạn trải nghiệm đặt phòng trực tuyến tiện lợi và nhanh chóng. Với giao diện thân thiện, dễ sử dụng, bạn có thể dễ dàng tìm kiếm phòng phù hợp, xem thông tin chi tiết, đặt phòng chỉ với vài cú click và thanh toán an toàn qua các cổng thanh toán trực tuyến. 

Hệ thống tự động gửi email xác nhận đặt phòng và cho phép bạn quản lý toàn bộ thông tin đặt chỗ của mình một cách dễ dàng. Ngoài ra, website còn cung cấp thông tin về các địa điểm du lịch nổi bật xung quanh, dịch vụ và tiện ích tại khách sạn, giúp bạn lên kế hoạch chuyến đi một cách hoàn hảo và có trải nghiệm nghỉ dưỡng trọn vẹn tại Miko Hotel.

Nghiên cứu cũng đề xuất các phương pháp quản lý dữ liệu khách hàng, cập nhật phòng trống theo thời gian thực, cùng chiến lược bảo trì và mở rộng hệ thống trong dài hạn. Website Miko Hotel hứa hẹn trở thành công cụ hỗ trợ hiệu quả cho cả khách hàng lẫn bộ phận quản lý khách sạn, góp phần tối ưu hóa quy trình đặt phòng, quảng bá hình ảnh và nâng cao chất lượng dịch vụ.

---

## 1.4. ĐỐI TƯỢNG, PHẠM VI NGHIÊN CỨU

### 1.4.1. Đối tượng nghiên cứu

Đối tượng nghiên cứu của đề tài là **Hệ thống quản lý khách sạn Miko Hotel**, một hệ thống quản lý toàn diện được xây dựng trên nền tảng web hiện đại, bao gồm:

1. **Hệ thống Backend API:**
   - Kiến trúc RESTful API sử dụng Node.js và Express
   - Hệ thống xác thực và phân quyền (JWT, RBAC)
   - Quản lý cơ sở dữ liệu MongoDB với Mongoose ODM
   - Real-time communication với Socket.IO (chat, notifications)
   - Validation và error handling (Yup, Express Validator)
   - File upload (Multer)
   - Export dữ liệu (PDF, Excel)
   - Tích hợp các dịch vụ bên thứ ba (Stripe, Email, Groq AI)

2. **Giao diện Admin Panel:**
   - Ứng dụng React với TypeScript và Ant Design
   - Dashboard với charts và statistics
   - Quản lý người dùng (admin/staff/customer) với phân quyền RBAC
   - Quản lý phòng và loại phòng
   - Quản lý đặt phòng (cá nhân và nhóm)
   - Quản lý khách (Guests)
   - Quản lý dịch vụ và đặt dịch vụ
   - Quản lý thanh toán và hóa đơn
   - Quản lý đánh giá (Reviews)
   - Quản lý địa điểm (Locations)
   - Hệ thống chat và thông báo real-time
   - Export dữ liệu (PDF, Excel)
   - Audit logs

3. **Website đặt phòng cho khách hàng:**
   - Ứng dụng Next.js với App Router và TypeScript
   - Giao diện tìm kiếm và đặt phòng trực tuyến (cá nhân và nhóm)
   - Tích hợp thanh toán Stripe
   - Dashboard cá nhân quản lý đặt phòng
   - Xem và đặt dịch vụ khách sạn
   - Khám phá địa điểm du lịch xung quanh
   - Chat real-time với staff
   - AI chat assistant (Groq) hỗ trợ tư vấn
   - Hệ thống thông báo real-time
   - Đánh giá và phản hồi


4. **Các quy trình nghiệp vụ:**
   - Quy trình đặt phòng cá nhân và nhóm
   - Quy trình thanh toán và quản lý hóa đơn
   - Quy trình check-in/check-out
   - Quy trình quản lý dịch vụ và khách hàng

5. **Công nghệ và kỹ thuật áp dụng:**
   - TypeScript cho type safety và code quality
   - Real-time communication (Socket.IO)
   - Payment gateway integration (Stripe)
   - Email automation (Nodemailer)
   - State management và data fetching hiện đại

### 1.4.2. Phạm vi nghiên cứu

#### **Phạm vi về chức năng:**

1. **Quản lý người dùng:**
   - Đăng ký, đăng nhập, xác thực email
   - Quản lý hồ sơ cá nhân
   - Phân quyền theo vai trò (Admin, Staff, Customer)
   - Quản lý tài khoản và trạng thái người dùng

2. **Quản lý phòng và loại phòng:**
   - CRUD phòng và loại phòng
   - Quản lý trạng thái phòng (available, booked, maintenance, etc.)
   - Tìm kiếm và lọc phòng theo tiêu chí
   - Hiển thị thông tin chi tiết phòng

3. **Quản lý đặt phòng:**
   - Đặt phòng cá nhân (individual booking)
   - Đặt phòng nhóm (group booking) với quy trình duyệt và báo giá
   - Quản lý trạng thái đặt phòng (pending, confirmed, checked_in, checked_out, cancelled)
   - Check-in và check-out
   - Gia hạn thời gian check-out

4. **Quản lý thanh toán và hóa đơn:**
   - Thanh toán online qua Stripe
   - Thanh toán tiền mặt và chuyển khoản
   - Tạo và quản lý hóa đơn
   - Xuất hóa đơn PDF
   - Xử lý hoàn tiền

5. **Quản lý dịch vụ:**
   - Danh mục dịch vụ khách sạn
   - Đặt dịch vụ kèm theo booking
   - Quản lý trạng thái đặt dịch vụ

6. **Hệ thống chat và thông báo:**
   - Chat real-time giữa khách hàng và staff
   - Hệ thống thông báo real-time
   - Lịch sử chat và thông báo

7. **Quản lý địa điểm:**
   - Danh mục địa điểm du lịch xung quanh
   - Tìm kiếm và xem chi tiết địa điểm

9. **Dashboard và báo cáo:**
   - Thống kê tổng quan
   - Biểu đồ và xu hướng
   - Xuất báo cáo Excel/PDF

#### **Phạm vi về công nghệ:**

1. **Frontend:**
   - React 19 với TypeScript cho Admin Panel (Vite build tool)
   - Next.js 14 (App Router) với TypeScript cho Customer Frontend
   - UI Libraries: Ant Design, shadcn/ui, Tailwind CSS
   - Routing: React Router 7.9.1 (Admin), Next.js App Router (Customer)
   - State Management: Zustand, React Context
   - Data Fetching: TanStack React Query
   - Forms: React Hook Form + Zod validation
   - Charts: Recharts
   - Export: jsPDF, XLSX
   - Icons: Lucide React, Ant Design Icons
   - Analytics: Vercel Analytics

2. **Backend:**
   - Node.js với Express framework
   - MongoDB với Mongoose ODM
   - JWT authentication
   - Socket.IO cho real-time features
   - File Upload: Multer
   - Validation: Yup, Express Validator
   - PDF Generation: PDFKit
   - Excel Export: XLSX
   - Integration với Stripe, Nodemailer, Groq AI

3. **Infrastructure:**
   - Database: MongoDB (có thể triển khai trên MongoDB Atlas)
   - File storage: Local hoặc cloud storage
   - Email service: Gmail SMTP (Nodemailer)
   - Payment: Stripe payment gateway
   - AI service: Groq API

#### **Phạm vi về người dùng:**

1. **Khách hàng (Customer):**
   - **Xác thực:** Đăng ký, đăng nhập, xác thực email, quên mật khẩu (OTP)
   - **Quản lý tài khoản:** Quản lý hồ sơ cá nhân, đổi mật khẩu
   - **Tìm kiếm và xem phòng:** Tìm kiếm phòng, xem danh sách phòng, xem chi tiết phòng, xem loại phòng
   - **Đặt phòng:** Đặt phòng cá nhân, đặt phòng nhóm (group booking)
   - **Quản lý đặt phòng:** Xem đặt phòng của mình, hủy đặt phòng
   - **Thanh toán:** Thanh toán online (Stripe), xem lịch sử thanh toán
   - **Hóa đơn:** Xem hóa đơn, xuất hóa đơn PDF
   - **Dịch vụ:** Xem danh sách dịch vụ, xem chi tiết dịch vụ, đặt dịch vụ, xem đặt dịch vụ của mình
   - **Địa điểm:** Xem danh sách địa điểm, xem chi tiết địa điểm, tìm kiếm địa điểm
   - **Chat:** Chat real-time với staff, xem lịch sử chat, nhận thông báo real-time
   - **Thông báo:** Xem thông báo, đếm thông báo chưa đọc, đánh dấu đã đọc
   - **Dashboard:** Xem dashboard cá nhân với thông tin đặt phòng, thanh toán

2. **Nhân viên (Staff):**
   - **Xác thực:** Đăng nhập, đăng xuất, quản lý thông tin cá nhân, đổi mật khẩu
   - **Xem phòng:** Xem danh sách phòng, tìm kiếm phòng, xem chi tiết phòng, xem loại phòng (read-only)
   - **Quản lý đặt phòng:** Xem danh sách và chi tiết bookings, cập nhật trạng thái booking, duyệt hủy đặt phòng
   - **Check-in/Check-out:** Thực hiện check-in, check-out khách, gia hạn thời gian check-out
   - **Đặt phòng nhóm:** Duyệt đặt phòng nhóm, tạo báo giá đặt phòng nhóm
   - **Quản lý khách (Guests):** Xem danh sách khách, xem chi tiết khách, tạo/sửa thông tin khách, xem lịch sử đặt phòng của khách
   - **Thanh toán:** Thanh toán tiền mặt, thanh toán chuyển khoản, quản lý payments, cập nhật trạng thái payment, thống kê thanh toán, đồng bộ payment với booking
   - **Hóa đơn:** Xem hóa đơn, tạo hóa đơn
   - **Quản lý dịch vụ:** Quản lý đặt dịch vụ, cập nhật trạng thái đặt dịch vụ, hủy đặt dịch vụ, hạch toán dịch vụ vào hóa đơn
   - **Chat:** Chat real-time với khách hàng, xem lịch sử chat, quản lý hội thoại, đánh dấu đã đọc, chat theo booking (ngữ cảnh)
   - **Thông báo:** Xem thông báo, đếm thông báo chưa đọc, đánh dấu đã đọc, gửi thông báo thủ công


3. **Quản trị viên (Admin):**
   - **Xác thực:** Đăng nhập, đăng xuất, quản lý thông tin cá nhân, đổi mật khẩu
   - **Quản lý người dùng:** Tạo/sửa/xóa người dùng, khóa/mở khóa tài khoản, phân quyền người dùng, xem danh sách người dùng đã xóa
   - **Quản lý phòng:** Tạo/sửa/xóa phòng, quản lý loại phòng (CRUD), cập nhật trạng thái phòng
   - **Quản lý đặt phòng:** Tất cả tính năng của Staff (xem, cập nhật trạng thái, check-in/check-out, duyệt hủy, duyệt đặt phòng nhóm, tạo báo giá)
   - **Quản lý khách (Guests):** Xem danh sách, chi tiết, tạo/sửa thông tin khách, xóa/khôi phục khách, xem lịch sử đặt phòng
   - **Quản lý thanh toán:** Tất cả tính năng của Staff + xử lý hoàn tiền
   - **Quản lý hóa đơn:** Xem, tạo hóa đơn
   - **Quản lý dịch vụ:** Tạo/sửa/xóa dịch vụ (catalog), quản lý đặt dịch vụ, cập nhật trạng thái, hủy, hạch toán vào hóa đơn
   - **Quản lý địa điểm:** Tạo/sửa/xóa địa điểm, bật/tắt hiển thị
   - **Chat:** Chat real-time với khách hàng, xem lịch sử chat, quản lý hội thoại, đánh dấu đã đọc, chat theo booking
   - **Thông báo:** Xem thông báo, gửi thông báo thủ công, cấu hình kênh/ưu tiên thông báo, quản trị thông báo (template, TTL, chính sách)
   - **Dashboard & Báo cáo:** Xem dashboard, xem thống kê, xem biểu đồ, xuất báo cáo Excel, xuất báo cáo PDF, xem báo cáo tài chính

#### **Phạm vi ngoài nghiên cứu:**

Những vấn đề không nằm trong phạm vi nghiên cứu của đề tài:

1. **Ứng dụng di động (Mobile App):** Đề tài chỉ tập trung vào ứng dụng web, không bao gồm phát triển ứng dụng mobile native.

2. **Tích hợp hệ thống POS:** Không bao gồm tích hợp với hệ thống điểm bán hàng (Point of Sale) tại khách sạn.

3. **Quản lý nhân sự và lương:** Không bao gồm module quản lý nhân viên, chấm công, tính lương.

4. **Quản lý kho và vật tư:** Không bao gồm quản lý kho hàng, vật tư, thiết bị khách sạn.

5. **Tích hợp hệ thống kế toán:** Không bao gồm tích hợp sâu với hệ thống kế toán doanh nghiệp.

6. **Multi-language support:** Hiện tại hệ thống chỉ hỗ trợ tiếng Việt, chưa bao gồm đa ngôn ngữ.

7. **Tích hợp CRM nâng cao:** Không bao gồm các tính năng CRM phức tạp như marketing automation, customer segmentation nâng cao.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### 1. Backend API (Node.js + Express + MongoDB)

**Công nghệ:**
- **Runtime:** Node.js
- **Framework:** Express 5.1.0
- **Database:** MongoDB (Mongoose 8.18.1)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Real-time:** Socket.IO 4.8.1
- **Payment:** Stripe integration
- **Email:** Nodemailer 7.0.10
- **File Upload:** Multer 1.4.5
- **Validation:** Yup 1.7.0, Express Validator 7.2.1
- **PDF Generation:** PDFKit 0.17.2
- **Excel Export:** XLSX 0.18.5

**Cấu trúc:**
```
Backend-api/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server startup & MongoDB connection
│   ├── controllers/        # 16 controllers (auth, bookings, payments, etc.)
│   ├── services/           # 18 services (business logic)
│   ├── models/             # 15 Mongoose models
│   ├── router/v1/          # 16 API route files
│   ├── middlewares/        # Auth & validation middlewares
│   ├── helpers/            # Utility functions
│   ├── validations/        # Request validation schemas
│   └── seeder.ts           # Database seeding
├── http/                   # HTTP test files
└── package.json
```

**Environment Variables:**
- `PORT` - Server port (default: 8080)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `GMAIL_USER` - Email username
- `GMAIL_APP_PASSWORD` - Email app password

---

### 2. Admin Panel (React + Vite + Ant Design)

**Công nghệ:**
- **Framework:** React 19.1.1 + Vite 7.1.2
- **Language:** TypeScript 5.8.3
- **UI Library:** Ant Design 5.27.3
- **Styling:** Tailwind CSS 4.1.13
- **State Management:** Zustand 5.0.8
- **Routing:** React Router 7.9.1
- **Data Fetching:** TanStack React Query 5.87.4
- **Charts:** Recharts 3.2.1
- **Real-time:** Socket.IO Client 4.8.1
- **PDF Export:** jsPDF 3.0.3 + jsPDF AutoTable 5.0.2
- **Excel Export:** XLSX 0.18.5
- **Icons:** Lucide React 0.545.0, Ant Design Icons 6.0.2

**Cấu trúc:**
```
Admin/
├── src/
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # App router configuration
│   ├── components/         # 15 component modules
│   │   ├── Booking/
│   │   ├── BookingStatus/
│   │   ├── GroupBookings/
│   │   ├── Guests/
│   │   ├── Invoices/
│   │   ├── Locations/
│   │   ├── Notification/
│   │   ├── Payments/
│   │   ├── Reviews/
│   │   ├── Rooms/
│   │   ├── RoomTypes/
│   │   ├── ServiceBookings/
│   │   ├── Services/
│   │   └── User/
│   ├── pages/              # 16 page components
│   ├── services/           # 14 API service files
│   ├── stores/             # Zustand stores (authStore)
│   ├── types/              # TypeScript type definitions
│   ├── layouts/            # Defaultlayout, Emptylayout
│   ├── hooks/              # Custom hooks (useWebSocket)
│   ├── utils/              # Utility functions
│   └── constanst/          # Constants (getEnvs)
├── public/
└── package.json
```

**Tính năng Admin:**
- Dashboard với charts và statistics
- User management (admin/staff/customer)
- Booking management (individual & group)
- Room & Room Type management
- Service management
- Payment management
- Invoice management
- Review management
- Notification system
- Real-time chat với customers
- Export data (PDF, Excel)
- Role-based access control

---

### 3. Customer Frontend (Next.js 14)

**Công nghệ:**
- **Framework:** Next.js 14.2.16 (App Router)
- **Language:** TypeScript 5
- **UI Components:** Radix UI + shadcn/ui
- **Styling:** Tailwind CSS 4.1.9
- **Forms:** React Hook Form 7.60.0 + Zod 3.25.67
- **Payment:** Stripe 19.1.0
- **Real-time:** Socket.IO Client 4.8.1
- **AI:** Groq API (llama-3.1-8b-instant)
- **Charts:** Recharts 2.15.4
- **Icons:** Lucide React 0.454.0
- **State:** React Context (AuthContext)
- **Analytics:** Vercel Analytics

**Cấu trúc:**
```
hotel-management/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── auth/               # Login/Register
│   ├── dashboard/          # User dashboard
│   ├── rooms/              # Room listing
│   ├── room-detail/        # Room detail page
│   ├── my-bookings/        # User bookings
│   ├── group-booking/      # Group booking
│   ├── explore/            # Explore locations
│   ├── location-detail/    # Location detail
│   ├── service-detail/     # Service detail
│   ├── stripe/             # Stripe success/cancel
│   └── api/                # Next.js API routes
│       ├── stripe/         # Stripe checkout
│       ├── payments/       # Payment API proxy
│       └── ...
├── components/
│   ├── ui/                 # 53 shadcn/ui components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── hero-section.tsx
│   ├── featured-rooms.tsx
│   ├── services-section.tsx
│   ├── booking-services.tsx
│   ├── nearby-attractions.tsx
│   ├── room-search-new.tsx
│   ├── customer-chat.tsx
│   └── ai-chat-bubble.tsx
├── contexts/
│   └── AuthContext.tsx
├── services/               # API service files
├── hooks/                  # Custom hooks
├── lib/                    # Utilities (stripe, utils)
└── public/                 # Static assets
```

**Tính năng Customer:**
- Browse rooms & services
- Room search & filtering
- Individual booking
- Group booking
- Online payment (Stripe)
- Booking management
- Real-time chat với staff
- Reviews & ratings
- Location exploration
- User dashboard

---

## 📊 DATABASE SCHEMA

### Core Models

#### 1. **User Model**
- `_id`, `fullName`, `email`, `password`, `phoneNumber`
- `dateOfBirth`, `role` (customer/staff/admin)
- `status` (active/blocked)
- `preferences` (array)
- `deletedAt` (soft delete)
- `timestamps`

#### 2. **Location Model**
- `_id`, `name`, `address`, `city`, `province`
- `description`, `images`
- `coordinates` (lat/lng)
- `amenities`

#### 3. **RoomType Model**
- `_id`, `name`, `description`
- `pricePerNight`, `extraHourPrice`, `maxExtendHours`
- `capacity`, `amenities`, `images`
- `timestamps`

#### 4. **Room Model**
- `_id`, `roomNumber`, `typeId` (ref: RoomType)
- `status` (available/booked/maintenance/checked_in/occupied/unavailable)
- `amenities`, `images`
- `timestamps`

#### 5. **Booking Model**
- `_id`, `customerId` (ref: User)
- `guests` (array với fullName, idNumber, dateOfBirth, phoneNumber, email)
- `guestCount`, `roomId` (ref: Room)
- `checkIn`, `checkOut`
- `services` (array với serviceId, name, price, quantity)
- `source` (online/walk_in)
- `totalPrice`, `discount`, `finalPrice`
- `status` (pending/confirmed/checked_in/checked_out/cancelled)
- `timestamps`

#### 6. **GroupBooking Model**
- `_id`, `requesterId` (ref: User), `requesterName`, `requesterPhone`, `requesterEmail`
- `checkIn`, `checkOut`
- `peopleCount`, `roomCount`
- `notes`
- `status` (pending_approval/approved/info_uploaded/quoted/awaiting_payment/deposit_paid/paid/confirmed/refund_requested/refunded/cancelled/rejected)
- `allocatedRoomIds` (array ref: Room)
- `members` (array với fullName, idNumber, dateOfBirth, phoneNumber, email, isLeader, roomNumber)
- `quoteAmount`, `paymentLink`, `paidAmount`, `remainingAmount`
- `refundRequestedAt`, `refundProcessedAt`, `refundAmount`, `rejectedAt`
- `timestamps`

#### 7. **Service Model**
- `_id`, `name`, `description`
- `price`, `category`, `duration`
- `isAvailable`, `images`
- `timestamps`

#### 8. **ServiceBooking Model**
- `_id`, `bookingId` (ref: Booking)
- `serviceId` (ref: Service)
- `customerId` (ref: User)
- `quantity`, `totalPrice`
- `bookingDate`, `status`
- `timestamps`

#### 9. **Invoice Model**
- `_id`, `bookingId` (ref: Booking) hoặc `groupBookingId` (ref: GroupBooking)
- `customerId` (ref: User)
- `totalAmount`, `paidAmount`, `remainingAmount`
- `paymentStatus` (pending/partial_paid/paid/failed/refunded/refund_requested/cancelled)
- `status` (pending/paid/failed/refunded)
- `issuedAt`, `timestamps`

#### 10. **Payment Model**
- `_id`, `bookingId` (ref: Booking) hoặc `groupBookingId` (ref: GroupBooking)
- `customerId` (ref: User)
- `paymentMethod` (stripe/cash/bank_transfer/other)
- `amount`, `currency` (VND)
- `status` (pending/completed/failed/cancelled/refunded)
- `stripeSessionId`, `stripePaymentIntentId`, `stripeCustomerId`
- `transactionId`, `bankInfo`, `cashInfo`, `refundInfo`
- `metadata`, `notes`, `expiresAt`, `paidAt`
- `timestamps`

#### 11. **BookingStatus Model**
- `_id`, `bookingId` (ref: Booking)
- `status`, `notes`
- `changedBy` (ref: User)
- `timestamps`

#### 12. **Review Model**
- `_id`, `bookingId` (ref: Booking)
- `customerId` (ref: User)
- `roomId` (ref: Room)
- `rating` (1-5)
- `comment`, `images`
- `status` (pending/approved/rejected)
- `timestamps`

#### 13. **Conversation Model**
- `_id`, `participants` (array với userId, role, lastReadAt)
- `lastMessage` (ref: Message)
- `lastMessageAt`, `status` (active/archived/deleted)
- `unreadCount` (Map)
- `timestamps`

#### 14. **Message Model**
- `_id`, `conversationId` (ref: Conversation)
- `senderId` (ref: User)
- `content`, `type` (text/image/file)
- `attachments` (array)
- `readBy` (array)
- `deliveredAt`, `readAt`
- `timestamps`

#### 15. **Notification Model**
- `_id`, `userId` (ref: User)
- `type`, `title`, `message`
- `relatedId`, `relatedType`
- `isRead`, `readAt`
- `metadata`
- `timestamps`

---

## 🔄 WORKFLOW CHÍNH

### 1. Individual Booking Flow

```
Customer browses rooms
    ↓
Select room & dates
    ↓
Add services (optional)
    ↓
Fill guest information
    ↓
Proceed to payment
    ↓
Stripe Checkout
    ↓
Payment Success → Create Booking
    ↓
Generate Invoice
    ↓
Create Payment Record
    ↓
Send confirmation email
    ↓
Real-time notification
```

### 2. Group Booking Flow

```
Customer submits group booking request
    ↓
Status: pending_approval
    ↓
Admin/Staff reviews request
    ↓
Status: approved → Customer uploads member info
    ↓
Status: info_uploaded → Admin creates quote
    ↓
Status: quoted → Admin sends payment link
    ↓
Status: awaiting_payment
    ↓
Customer pays (full/deposit)
    ↓
Status: paid/deposit_paid → Admin confirms
    ↓
Status: confirmed → Allocate rooms
    ↓
Check-in process
```

### 3. Payment Flow

**Stripe Payment:**
```
Create Stripe Checkout Session
    ↓
Customer pays on Stripe
    ↓
Stripe redirects to success page
    ↓
Create Booking + Invoice
    ↓
Create Payment record with Stripe metadata
    ↓
Update Invoice payment status
```

**Cash/Bank Transfer:**
```
Admin creates payment record
    ↓
Update payment status manually
    ↓
Update Invoice payment status
```

### 4. Chat Flow

```
Customer opens chat
    ↓
Connect to Socket.IO server (with JWT token)
    ↓
Join conversation room
    ↓
Real-time messaging via Socket.IO
    ↓
Notifications via Socket.IO
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Authentication
- Token-based authentication
- Access token stored in localStorage (Admin) / Context (Frontend)
- Token validation middleware
- Token expiration handling

### Role-Based Access Control (RBAC)

**Roles:**
1. **Admin** - Full access to all features
2. **Staff** - Limited access:
   - Dashboard
   - Bookings
   - Booking Status
   - Guests
   - Service Bookings
   - Users
   - Invoices
   - Group Bookings
3. **Customer** - Limited access:
   - Browse rooms
   - Make bookings
   - View own bookings
   - Chat with staff
   - Leave reviews

**Authorization Middleware:**
```typescript
authenticateToken() - Verify JWT token
authorize([roles]) - Check user role
```

---

## 💳 PAYMENT INTEGRATION

### Stripe Integration
- Stripe Checkout for online payments
- Support VND currency
- Payment session creation
- Webhook handling (potential)
- Payment record tracking

### Payment Methods Supported:
1. **Stripe** - Credit/debit cards (online)
2. **Cash** - Tiền mặt (walk-in)
3. **Bank Transfer** - Chuyển khoản ngân hàng

### Payment Status:
- `pending` - Chờ thanh toán
- `completed` - Đã thanh toán
- `failed` - Thanh toán thất bại
- `cancelled` - Đã hủy
- `refunded` - Đã hoàn tiền

---

## 💬 REAL-TIME FEATURES

### Socket.IO
- WebSocket server cho real-time chat và notifications
- User connection tracking
- Room-based messaging (conversation rooms, user rooms, role rooms)
- Broadcast messages
- Connection status monitoring
- Real-time message delivery
- Message history management
- Typing indicators
- Read receipts

---

## 📧 EMAIL NOTIFICATIONS

**Nodemailer Integration:**
- Booking confirmations
- Payment receipts
- Booking status updates
- Group booking notifications

**Configuration:**
- Gmail SMTP
- HTML email templates
- Attachment support (PDF invoices)

---

## 🤖 AI INTEGRATION (GROQ)

**Groq AI Integration:**
- AI chat assistant cho khách hàng
- Gợi ý phòng và dịch vụ theo sở thích
- Hướng dẫn du lịch và địa điểm
- Trả lời câu hỏi về khách sạn và dịch vụ

**Configuration:**
- Groq API (https://api.groq.com)
- Model: llama-3.1-8b-instant
- API Key: `GROQ_API_KEY` environment variable
- Endpoint: `/api/ai-chat` (Next.js API route)

**Features:**
- AI Chat Bubble component
- Context-aware responses (location info, user preferences)
- Fallback responses khi API lỗi
- Hỗ trợ tiếng Việt

---

## 📊 EXPORT FUNCTIONALITY

### PDF Export
- Invoice PDF generation (jsPDF + PDFKit)
- Booking confirmations
- Payment receipts

### Excel Export
- Booking data export (XLSX)
- User data export
- Financial reports

---

## 🎨 UI/UX FEATURES

### Admin Panel:
- Ant Design components
- Responsive design
- Charts & statistics (Recharts)
- Data tables với filtering & sorting
- Modal forms
- Toast notifications
- Loading states

### Customer Frontend:
- Modern UI với shadcn/ui
- Responsive design
- Room search & filtering
- Image galleries
- Payment forms
- Chat interface
- Review system

---

## 🔧 TECHNICAL HIGHLIGHTS

### Performance:
- MongoDB indexing
- Query optimization
- React Query caching
- Image optimization
- Code splitting (Next.js)

### Security:
- Password hashing (bcryptjs)
- JWT token security
- CORS configuration
- Input validation
- SQL injection prevention (NoSQL)

### Error Handling:
- Global error handler (Express)
- Try-catch blocks
- Error logging
- User-friendly error messages

### Validation:
- Request validation (Yup, Zod, Express Validator)
- Database validation (Mongoose)
- Type safety (TypeScript)

---

## 💻 TYPESCRIPT - NGÔN NGỮ LẬP TRÌNH

TypeScript là một ngôn ngữ lập trình được phát triển bởi Microsoft, dựa trên nền tảng của JavaScript nhưng được mở rộng với hệ thống kiểu tĩnh (static typing) và các tính năng hướng đối tượng mạnh mẽ hơn. Đây là một siêu ngôn ngữ của JavaScript (superset), tức là mọi mã JavaScript hợp lệ cũng là mã TypeScript hợp lệ. Nhờ vậy, TypeScript giữ nguyên được sự linh hoạt và phổ biến của JavaScript, đồng thời bổ sung các tính năng giúp quá trình phát triển phần mềm trở nên an toàn, dễ bảo trì và dễ mở rộng hơn.

Việc sử dụng ngôn ngữ JavaScript có thể ứng dụng cho mọi trình duyệt khác nhau, hiện được sử dụng phổ biến như Chrome, hay Firefox, ... Hơn nữa, đây còn là ngôn ngữ lập trình hoạt động hiệu quả, được hỗ trợ đầy đủ trên các trình duyệt của thiết bị di động. Bởi thế mà việc sử dụng đa dạng, có thể đáp ứng tốt cho nhiều nhu cầu, những đòi hỏi khác nhau của người dùng.

### Những ưu điểm làm nên chất lượng của ngôn ngữ TypeScript:

• **Kiểm tra lỗi ngay từ thời điểm biên dịch (compile-time):** Với hệ thống kiểu tĩnh, TypeScript cho phép phát hiện lỗi trong quá trình lập trình thay vì chờ đến khi chạy chương trình. Điều này giúp giảm thiểu rủi ro lỗi thời gian chạy, đặc biệt quan trọng với các ứng dụng quy mô lớn hoặc có tính phức tạp cao.

• **Tăng cường khả năng đọc hiểu và bảo trì mã nguồn:** Nhờ việc khai báo kiểu dữ liệu rõ ràng (string, number, boolean, array, enum,...), TypeScript giúp lập trình viên khác dễ dàng hiểu được ý nghĩa và mục đích của từng thành phần trong mã. Điều này hỗ trợ rất lớn trong việc quản lý mã nguồn theo nhóm hoặc trong các dự án lâu dài cần bảo trì, nâng cấp.

• **Hỗ trợ lập trình hướng đối tượng (OOP):** TypeScript cung cấp đầy đủ các khái niệm lập trình hướng đối tượng như class, interface, inheritance, polymorphism, encapsulation,... Đây là điều mà JavaScript truyền thống không có hoặc hỗ trợ kém. Việc này giúp viết mã có cấu trúc rõ ràng, tổ chức tốt và dễ mở rộng hơn.

• **Hỗ trợ công cụ phát triển (IDE) mạnh mẽ:** TypeScript cung cấp khả năng tự động hoàn thiện mã (IntelliSense), kiểm tra lỗi cú pháp tức thì, điều hướng dễ dàng giữa các thành phần mã, gợi ý phương thức, v.v. Các IDE như Visual Studio Code có thể tận dụng tối đa lợi ích này để cải thiện năng suất lập trình.

• **Khả năng mở rộng quy mô dự án dễ dàng:** Khi dự án lớn dần lên, việc quản lý mã trở nên khó khăn với JavaScript. TypeScript giúp tổ chức mã nguồn bằng cách chia thành module, định nghĩa interface, kiểu tùy chỉnh,... Nhờ đó, việc phát triển có hệ thống và mở rộng quy mô dự án trở nên hiệu quả hơn.

• **Tương thích ngược với JavaScript:** Tất cả các đoạn mã JavaScript đều có thể chạy được trong TypeScript. Điều này giúp việc chuyển đổi từ JavaScript sang TypeScript diễn ra dần dần, không cần viết lại toàn bộ mã nguồn. Bạn có thể áp dụng TypeScript một cách linh hoạt tùy vào nhu cầu.

• **Hỗ trợ refactoring an toàn:** Nhờ hệ thống kiểu tĩnh, TypeScript cho phép thực hiện các thao tác refactoring như đổi tên biến, hàm, class một cách an toàn và tự động trên toàn bộ dự án. IDE có thể tự động cập nhật tất cả các tham chiếu đến các thành phần được đổi tên, giảm thiểu rủi ro gây lỗi trong quá trình tái cấu trúc mã nguồn.

• **Tài liệu mã nguồn tự động:** Các khai báo kiểu dữ liệu trong TypeScript hoạt động như một dạng tài liệu mã nguồn tự động, giúp lập trình viên hiểu rõ cấu trúc dữ liệu, tham số đầu vào và giá trị trả về của các hàm mà không cần phải đọc toàn bộ implementation. Điều này đặc biệt hữu ích khi làm việc với các thư viện hoặc API của bên thứ ba.

• **Tích hợp mạnh mẽ với hệ sinh thái JavaScript:** TypeScript hỗ trợ sử dụng các thư viện JavaScript hiện có thông qua các file định nghĩa kiểu (Type Definitions) với phần mở rộng `.d.ts`. Cộng đồng đã tạo ra hàng nghìn gói `@types` trên npm để cung cấp định nghĩa kiểu cho hầu hết các thư viện JavaScript phổ biến, cho phép lập trình viên tận dụng toàn bộ hệ sinh thái JavaScript với đầy đủ hỗ trợ về kiểu dữ liệu và tự động hoàn thành mã.

• **Hỗ trợ các tính năng nâng cao:** TypeScript cung cấp nhiều tính năng nâng cao như Generics (kiểu tổng quát) cho phép tạo các hàm và lớp có thể làm việc với nhiều loại dữ liệu khác nhau, Decorators để mở rộng chức năng của các class và method, Union Types và Intersection Types để kết hợp các kiểu dữ liệu một cách linh hoạt, cùng với Type Guards để kiểm soát và xác định kiểu dữ liệu trong quá trình chạy chương trình. Những tính năng này giúp TypeScript trở thành một công cụ mạnh mẽ cho việc xây dựng các ứng dụng phức tạp.

**Ví dụ:**

```typescript
// Định nghĩa interface và hàm với type annotations
interface Room {
  roomNumber: string;
  pricePerNight: number;
}

function calculateTotalPrice(room: Room, nights: number): number {
  return room.pricePerNight * nights;
}

const room: Room = {
  roomNumber: "101",
  pricePerNight: 500000
};

const totalPrice = calculateTotalPrice(room, 3);
```

### Lợi ích của TypeScript:

• **Nâng cao hiệu suất làm việc nhóm:** Với hệ thống kiểu rõ ràng, các thành viên trong nhóm dễ dàng hiểu mã của nhau, hạn chế hiểu sai logic. Việc sử dụng interface và kiểu dữ liệu chung giúp phối hợp giữa các thành viên trong nhóm chặt chẽ và hiệu quả hơn.

• **Phát triển ứng dụng lớn, có tính phức tạp cao:** TypeScript đặc biệt phù hợp với những dự án cần độ ổn định cao, ví dụ như ứng dụng doanh nghiệp, hệ thống ERP, web app nhiều thành phần. Việc có thể chia nhỏ hệ thống thành các module rõ ràng giúp ứng dụng dễ phát triển và bảo trì.

• **Cải thiện trải nghiệm người dùng cuối:** Do mã TypeScript thường ít lỗi hơn JavaScript thuần, nên ứng dụng hoạt động ổn định và mượt mà hơn. Điều này dẫn đến việc cải thiện đáng kể trải nghiệm người dùng, giảm thiểu các lỗi vặt hoặc lỗi chức năng trong quá trình sử dụng.

• **Tối ưu hiệu suất xây dựng giao diện người dùng (UI):** TypeScript kết hợp hiệu quả với các thư viện như React, Angular, Vue,... giúp xây dựng UI có cấu trúc tốt, có thể tái sử dụng nhiều lần và dễ kiểm soát hành vi người dùng.

• **Chạy tốt cả phía client và server:** Với sự hỗ trợ của Node.js, TypeScript không chỉ được dùng trong trình duyệt (client-side), mà còn dùng được để viết ứng dụng backend (server-side), tạo ra sự đồng nhất trong toàn bộ hệ thống từ giao diện đến máy chủ.

• **Hệ sinh thái phong phú và cộng đồng hỗ trợ lớn:** TypeScript có cộng đồng phát triển rất mạnh, thường xuyên cập nhật tính năng mới và tích hợp tốt với các công cụ hiện đại. Nhiều thư viện mã nguồn mở nổi tiếng cũng cung cấp sẵn định nghĩa kiểu (*.d.ts) cho TypeScript, giúp dễ dàng tích hợp và sử dụng.

---

## ⚛️ REACTJS - THƯ VIỆN JAVASCRIPT

ReactJS là một thư viện JavaScript mã nguồn mở được phát triển bởi Facebook (nay là Meta), dùng để xây dựng giao diện người dùng (UI) cho các ứng dụng web. ReactJS giúp các nhà phát triển tạo ra các ứng dụng web có khả năng tương tác cao và hiệu suất tốt bằng cách sử dụng khái niệm component-based architecture (kiến trúc dựa trên thành phần). Mỗi component trong React là một đơn vị độc lập, có thể tái sử dụng và quản lý trạng thái riêng của mình, giúp việc xây dựng và bảo trì ứng dụng trở nên dễ dàng và có tổ chức hơn.

Một trong những điểm mạnh nổi bật của ReactJS là khái niệm Virtual DOM (Document Object Model ảo). Thay vì thao tác trực tiếp với DOM thật của trình duyệt - một quá trình tốn kém về mặt hiệu suất - React tạo ra một bản sao ảo của DOM trong bộ nhớ. Khi có thay đổi trong dữ liệu, React so sánh Virtual DOM mới với phiên bản cũ (quá trình gọi là "diffing") và chỉ cập nhật những phần thực sự thay đổi lên DOM thật. Cơ chế này giúp tối ưu hóa hiệu suất render, đặc biệt quan trọng với các ứng dụng có nhiều tương tác và cập nhật giao diện thường xuyên.

ReactJS sử dụng cú pháp JSX (JavaScript XML), một phần mở rộng của JavaScript cho phép viết mã HTML-like trực tiếp trong JavaScript. Trong dự án này, ReactJS được kết hợp với TypeScript thông qua các file có phần mở rộng `.tsx` (TypeScript + JSX), cho phép tận dụng cả type safety của TypeScript và cú pháp JSX của React trong cùng một file. JSX giúp mã nguồn trở nên dễ đọc và dễ hiểu hơn, đồng thời cho phép lập trình viên mô tả cấu trúc giao diện một cách trực quan và gần gũi với HTML truyền thống. Mặc dù JSX trông giống HTML, nhưng nó được biên dịch thành các lời gọi hàm JavaScript thuần túy, đảm bảo hiệu suất và tính linh hoạt. Việc sử dụng `.tsx` giúp các component React có được đầy đủ lợi ích của TypeScript như kiểm tra kiểu dữ liệu cho props và state, tự động hoàn thành mã trong IDE, và phát hiện lỗi sớm trong quá trình phát triển.

Khi sử dụng ReactJS, người dùng có thể khai thác được nhiều tính năng khác nhau, trong đó có:

• **Xây dựng giao diện người dùng (UI) linh hoạt và tái sử dụng:** ReactJS cho phép tạo ra các component có thể tái sử dụng, giúp xây dựng giao diện một cách linh hoạt và hiệu quả. Mỗi component có thể được sử dụng ở nhiều nơi khác nhau trong ứng dụng, giảm thiểu việc lặp lại mã và tăng tính nhất quán của giao diện.

• **Tối ưu hóa hiệu suất với Virtual DOM:** ReactJS sử dụng Virtual DOM để tối ưu hóa quá trình render và cập nhật giao diện. Cơ chế này giúp ứng dụng chạy mượt mà và nhanh chóng hơn, đặc biệt với các ứng dụng có nhiều tương tác và cập nhật giao diện thường xuyên.

• **Tích hợp dễ dàng với các công nghệ khác:** ReactJS có thể dễ dàng tích hợp với nhiều công nghệ và thư viện khác như Redux, Zustand cho quản lý state, React Router cho routing, React Query cho data fetching, và nhiều UI libraries như Ant Design, Material-UI. Điều này giúp lập trình viên có thể xây dựng ứng dụng với đầy đủ các tính năng cần thiết.

• **Tính năng cập nhật nhanh chóng với ES6+:** ReactJS hỗ trợ đầy đủ các tính năng của ES6+ (ECMAScript 2015 và các phiên bản mới hơn) như arrow functions, destructuring, template literals, async/await, và nhiều tính năng hiện đại khác. Điều này giúp viết mã ngắn gọn, dễ đọc và tận dụng được các kỹ thuật lập trình hiện đại.

### Những ưu điểm làm nên chất lượng của ReactJS:

• **Kiến trúc dựa trên component (Component-Based Architecture):** ReactJS cho phép chia nhỏ giao diện thành các component độc lập, có thể tái sử dụng. Mỗi component quản lý logic và giao diện riêng của nó, giúp mã nguồn có cấu trúc rõ ràng, dễ bảo trì và mở rộng. Việc này đặc biệt hữu ích khi làm việc theo nhóm, vì mỗi thành viên có thể phát triển và test các component một cách độc lập.

• **Virtual DOM và hiệu suất tối ưu:** ReactJS sử dụng Virtual DOM để tối ưu hóa quá trình cập nhật giao diện. Thay vì cập nhật toàn bộ DOM mỗi khi có thay đổi, React chỉ cập nhật những phần cần thiết, giúp ứng dụng chạy mượt mà và nhanh chóng hơn, đặc biệt với các ứng dụng có nhiều tương tác phức tạp.

• **Unidirectional Data Flow (Luồng dữ liệu một chiều):** ReactJS tuân theo nguyên tắc luồng dữ liệu một chiều, trong đó dữ liệu chỉ chảy từ component cha xuống component con thông qua props. Điều này giúp dễ dàng theo dõi và debug ứng dụng, vì luồng dữ liệu rõ ràng và có thể dự đoán được. Khi cần cập nhật dữ liệu, React sử dụng state và các phương thức như setState hoặc hooks để quản lý trạng thái.

• **Hệ sinh thái phong phú và cộng đồng lớn:** ReactJS có hệ sinh thái rất phong phú với hàng nghìn thư viện và công cụ hỗ trợ như React Router cho routing, Redux hoặc Zustand cho quản lý state toàn cục, React Query cho data fetching, và nhiều UI libraries như Ant Design, Material-UI. Cộng đồng React rất tích cực, thường xuyên cập nhật và chia sẻ best practices, giúp lập trình viên dễ dàng tìm kiếm giải pháp cho các vấn đề gặp phải.

• **Hooks API cho quản lý state và side effects:** Từ phiên bản 16.8, ReactJS giới thiệu Hooks - một cách tiếp cận mới cho phép sử dụng state và các tính năng khác của React trong functional components. Các hooks như useState, useEffect, useContext giúp viết mã ngắn gọn hơn, dễ hiểu hơn và tái sử dụng logic giữa các component dễ dàng hơn so với class components truyền thống.

• **Server-Side Rendering (SSR) và Static Site Generation (SSG):** ReactJS có thể được sử dụng với các framework như Next.js để hỗ trợ Server-Side Rendering và Static Site Generation. Điều này giúp cải thiện hiệu suất tải trang ban đầu, tối ưu hóa SEO, và cung cấp trải nghiệm người dùng tốt hơn, đặc biệt với các ứng dụng cần hiển thị nội dung nhanh chóng.

• **Tích hợp tốt với TypeScript:** ReactJS kết hợp mạnh mẽ với TypeScript, cho phép thêm type safety vào các component và props. Điều này giúp phát hiện lỗi sớm trong quá trình phát triển, cải thiện khả năng đọc mã và hỗ trợ tốt hơn từ IDE với IntelliSense và auto-completion.

• **Học một lần, viết mọi nơi (Learn Once, Write Anywhere):** ReactJS không chỉ dùng cho web mà còn có React Native - một framework cho phép sử dụng kiến thức React để phát triển ứng dụng mobile cho cả iOS và Android. Điều này giúp lập trình viên có thể tận dụng kỹ năng React để mở rộng sang phát triển ứng dụng di động mà không cần học ngôn ngữ mới.

**Ví dụ:**

```tsx
// RoomCard.tsx - Component React với TypeScript và JSX
interface RoomCardProps {
  roomNumber: string;
  pricePerNight: number;
}

const RoomCard: React.FC<RoomCardProps> = ({ roomNumber, pricePerNight }) => {
  const [isBooked, setIsBooked] = React.useState(false);

  return (
    <div>
      <h3>Phòng {roomNumber}</h3>
      <p>Giá: {pricePerNight.toLocaleString('vi-VN')} VNĐ/đêm</p>
      <button onClick={() => setIsBooked(!isBooked)}>
        {isBooked ? 'Đã đặt' : 'Đặt phòng'}
      </button>
    </div>
  );
};
```

### Lý do ReactJS được nhiều doanh nghiệp phần mềm hướng tới trong thương mại điện tử:

• **Hiệu suất cao và tối ưu trải nghiệm người dùng:** Virtual DOM giúp React sử dụng DOM ảo, giúp tối ưu hóa quá trình cập nhật giao diện khi có thay đổi. Điều này đặc biệt quan trọng trong thương mại điện tử, nơi người dùng thường xuyên tương tác với trang, như tìm kiếm sản phẩm, thêm sản phẩm vào giỏ hàng, thanh toán, v.v. Tốc độ tải nhanh và trải nghiệm mượt mà giúp cải thiện tỷ lệ chuyển đổi. Lazy Loading giúp React hỗ trợ tính năng tải lười (lazy loading), giúp tải nội dung khi cần thiết, làm cho trang thương mại điện tử tải nhanh hơn và tối ưu trải nghiệm người dùng.

• **Tính linh hoạt và tái sử dụng cao:** Component-based Architecture: Trong thương mại điện tử, nhiều phần của trang web có thể được sử dụng lại như các danh sách sản phẩm, biểu mẫu thanh toán, hoặc thanh điều hướng. React giúp tạo các component có thể tái sử dụng, từ đó giảm chi phí phát triển, bảo trì và cập nhật hệ thống. Điều này cũng giúp dễ dàng mở rộng quy mô ứng dụng khi thêm tính năng mới. Modular Development: Kiến trúc mô-đun của React cho phép đội ngũ phát triển làm việc song song trên các phần khác nhau của ứng dụng, tăng tốc độ triển khai và cải thiện tính linh hoạt trong phát triển.

• **Khả năng tối ưu hóa SEO:** Server-side Rendering (SSR): Mặc dù React là thư viện JavaScript, nó có thể được tích hợp với các framework như Next.js để hỗ trợ render phía máy chủ (Server-side Rendering), giúp tối ưu hóa SEO cho các trang thương mại điện tử. Điều này giúp cải thiện xếp hạng trang web trên các công cụ tìm kiếm, tăng lưu lượng truy cập và khả năng bán hàng. Improved SEO Performance: Các trang thương mại điện tử cần tối ưu hóa cho SEO để tăng khả năng hiển thị sản phẩm trên các công cụ tìm kiếm. React, khi được kết hợp với SSR hoặc prerendering, giúp cải thiện khả năng lập chỉ mục của trang web và làm tăng thứ hạng tìm kiếm.

• **Khả năng cá nhân hóa trải nghiệm người dùng:** Personalized Shopping Experience: React hỗ trợ việc tạo ra trải nghiệm mua sắm cá nhân hóa theo hành vi và sở thích của người dùng, từ đó tăng tỷ lệ chuyển đổi và doanh thu. Các tính năng như đề xuất sản phẩm, danh sách yêu thích, hoặc bộ lọc tìm kiếm sản phẩm được thực hiện dễ dàng và hiệu quả với React.

### Lợi ích của ReactJS:

• **Tái sử dụng thành phần (Reusable Components):** React cho phép bạn xây dựng các thành phần UI độc lập, có thể tái sử dụng trong toàn bộ ứng dụng, giúp tiết kiệm thời gian phát triển. Mỗi component có thể được thiết kế để nhận props (properties) khác nhau, cho phép tùy biến hành vi và giao diện mà không cần viết lại mã. Điều này đặc biệt hữu ích trong các dự án lớn, nơi nhiều trang hoặc màn hình có thể chia sẻ các thành phần chung như buttons, forms, cards, hoặc navigation bars. Việc tái sử dụng component không chỉ giảm thiểu code duplication mà còn đảm bảo tính nhất quán trong thiết kế và hành vi của ứng dụng.

• **Hiệu suất cao (High Performance):** Với Virtual DOM, React chỉ cập nhật những phần giao diện thay đổi thay vì làm mới toàn bộ trang, giúp tăng tốc độ xử lý. Khi có thay đổi trong state hoặc props, React tạo ra một Virtual DOM mới và so sánh nó với phiên bản trước đó (quá trình gọi là "reconciliation"). Chỉ những phần khác biệt mới được cập nhật lên DOM thật, giảm thiểu số lượng thao tác DOM tốn kém. Cơ chế này giúp ứng dụng React chạy mượt mà ngay cả khi có nhiều component và tương tác phức tạp, đặc biệt quan trọng với các ứng dụng real-time hoặc có nhiều cập nhật giao diện liên tục.

• **Định hướng dữ liệu (Unidirectional Data Flow):** React quản lý dữ liệu theo hướng đơn chiều, giúp dễ dàng kiểm soát trạng thái và luồng dữ liệu trong ứng dụng. Dữ liệu chỉ chảy từ component cha xuống component con thông qua props, và khi cần cập nhật, các component con gọi callback functions được truyền từ component cha. Luồng dữ liệu một chiều này làm cho ứng dụng dễ dự đoán và debug hơn, vì bạn luôn biết dữ liệu đến từ đâu và thay đổi như thế nào. Điều này đặc biệt quan trọng trong các ứng dụng lớn với nhiều component lồng nhau, giúp tránh các vấn đề về state management phức tạp.

• **Dễ bảo trì:** Cấu trúc thành phần của React giúp mã nguồn rõ ràng và dễ bảo trì, đặc biệt đối với các dự án lớn. Mỗi component là một đơn vị độc lập với logic và giao diện riêng của nó, giúp dễ dàng tìm và sửa lỗi khi có vấn đề. Khi cần thay đổi hoặc cập nhật một tính năng, bạn chỉ cần tập trung vào component liên quan mà không ảnh hưởng đến các phần khác của ứng dụng. Cấu trúc module hóa này cũng giúp việc testing trở nên dễ dàng hơn, vì mỗi component có thể được test độc lập. Ngoài ra, việc sử dụng TypeScript với React càng tăng cường khả năng bảo trì nhờ type safety và IntelliSense trong IDE.

• **SEO thân thiện (SEO-Friendly):** React có thể sử dụng kèm với server-side rendering (SSR) để tăng cường khả năng SEO. Mặc dù React là một thư viện client-side, nó có thể được tích hợp với các framework như Next.js để render component trên server trước khi gửi HTML đến trình duyệt. Điều này giúp các công cụ tìm kiếm có thể đọc và lập chỉ mục nội dung của trang web một cách đầy đủ, cải thiện xếp hạng SEO. SSR cũng giúp cải thiện thời gian tải trang ban đầu (First Contentful Paint), mang lại trải nghiệm người dùng tốt hơn và tăng tỷ lệ chuyển đổi.

• **Hỗ trợ cộng đồng và công cụ mạnh mẽ:** React có một cộng đồng lớn và một hệ sinh thái mạnh mẽ, bao gồm các thư viện như React Router cho routing, Redux và Zustand cho quản lý state toàn cục, React Query cho data fetching và caching, và Next.js cho server-side rendering và static site generation. Cộng đồng React rất tích cực, thường xuyên cập nhật, chia sẻ best practices, và tạo ra các thư viện hỗ trợ mới. Điều này giúp lập trình viên dễ dàng tìm kiếm giải pháp cho các vấn đề gặp phải, học hỏi từ các dự án mã nguồn mở, và nhận được hỗ trợ từ cộng đồng. Ngoài ra, React có nhiều công cụ phát triển mạnh mẽ như React DevTools để debug và kiểm tra component tree, giúp quá trình phát triển trở nên hiệu quả hơn.

### Khi nào nên sử dụng ReactJS:

• **Khi bạn cần xây dựng một giao diện người dùng phức tạp và cần hiệu suất cao:** ReactJS là lựa chọn lý tưởng cho các ứng dụng có giao diện phức tạp với nhiều tương tác động, cập nhật real-time, hoặc xử lý lượng dữ liệu lớn. Virtual DOM của React giúp tối ưu hóa hiệu suất render, đảm bảo ứng dụng chạy mượt mà ngay cả khi có nhiều component và state changes. Điều này đặc biệt quan trọng với các ứng dụng như dashboard quản trị, hệ thống quản lý, hoặc các ứng dụng thương mại điện tử có nhiều tính năng tương tác như tìm kiếm, lọc, sắp xếp sản phẩm, giỏ hàng động, và thanh toán.

• **Khi bạn muốn phát triển ứng dụng web với khả năng tái sử dụng mã nguồn:** ReactJS phù hợp khi bạn cần xây dựng một hệ thống với nhiều trang hoặc màn hình có thể chia sẻ các thành phần chung. Kiến trúc component-based của React cho phép tạo ra các component có thể tái sử dụng, giúp giảm thiểu code duplication và đảm bảo tính nhất quán trong toàn bộ ứng dụng. Điều này đặc biệt hữu ích cho các dự án lớn, nơi nhiều nhà phát triển làm việc song song, hoặc khi bạn cần xây dựng một design system hoặc component library để sử dụng trong nhiều dự án khác nhau.

• **Khi bạn muốn tạo một ứng dụng single-page application (SPA) mượt mà:** ReactJS là công cụ hoàn hảo để xây dựng các Single Page Application (SPA) - ứng dụng web chỉ tải một lần và sau đó cập nhật nội dung động mà không cần reload toàn bộ trang. Kết hợp với React Router, bạn có thể tạo ra các ứng dụng SPA với routing mượt mà, chuyển đổi giữa các trang nhanh chóng và không bị gián đoạn. Điều này mang lại trải nghiệm người dùng tương tự như ứng dụng desktop hoặc mobile native, với khả năng điều hướng nhanh, không có thời gian chờ tải trang, và các animation mượt mà. SPA phù hợp cho các ứng dụng như quản lý khách sạn, hệ thống quản lý nội dung, hoặc các ứng dụng web có nhiều tính năng tương tác.

---

## ⚡ NEXT.JS - FRAMEWORK REACT

Next.js là một framework mã nguồn mở được xây dựng trên nền tảng React, được phát triển bởi Vercel. Next.js mở rộng khả năng của React bằng cách cung cấp các tính năng như server-side rendering (SSR), static site generation (SSG), routing tự động, và tích hợp API routes. Framework này giúp giải quyết nhiều thách thức của React thuần túy, đặc biệt là về hiệu suất, SEO, và trải nghiệm người dùng.

### Những tính năng nổi bật của Next.js:

• **Kết hợp SSR và SSG:** Next.js hỗ trợ kết xuất trang phía máy chủ (Server-Side Rendering - SSR) và tạo trang tĩnh (Static Site Generation - SSG) để tối ưu tốc độ tải. Với SSR, mỗi request sẽ render trang trên server và gửi HTML đã render sẵn đến trình duyệt, giúp cải thiện thời gian tải ban đầu và SEO. Với SSG, các trang được tạo sẵn tại thời điểm build, giúp tải cực kỳ nhanh vì chỉ cần serve các file HTML tĩnh. Next.js cho phép bạn lựa chọn phương thức render phù hợp cho từng trang: sử dụng `getServerSideProps` cho SSR, `getStaticProps` cho SSG, hoặc kết hợp cả hai tùy theo nhu cầu. Điều này đặc biệt hữu ích cho các ứng dụng như website đặt phòng khách sạn, nơi một số trang như danh sách phòng có thể được tạo tĩnh, trong khi các trang như dashboard người dùng cần render động.

• **Tối ưu SEO:** Nhờ render sẵn nội dung trước khi gửi đến trình duyệt, Next.js giúp công cụ tìm kiếm dễ lập chỉ mục. Các bot tìm kiếm như Google có thể đọc và lập chỉ mục toàn bộ nội dung HTML ngay từ lần đầu truy cập, không cần phải chờ JavaScript chạy như các SPA thuần túy. Next.js cũng hỗ trợ các tính năng SEO như meta tags động, Open Graph tags, và structured data, giúp cải thiện khả năng hiển thị trên các công cụ tìm kiếm. Điều này đặc biệt quan trọng cho các website thương mại điện tử, blog, hoặc các trang web cần tăng lưu lượng truy cập từ tìm kiếm tự nhiên.

• **Routing tự động:** Mỗi file trong thư mục `pages` (hoặc `app` với App Router) tự động trở thành một route, giúp tổ chức dự án đơn giản. Bạn không cần cấu hình routing phức tạp như với React Router - chỉ cần tạo file trong thư mục pages và Next.js sẽ tự động tạo route tương ứng. Ví dụ, file `pages/about.tsx` sẽ tự động trở thành route `/about`, và file `pages/blog/[slug].tsx` sẽ tạo dynamic route cho các bài viết blog. Hệ thống routing này giúp code organization rõ ràng, dễ bảo trì, và giảm thiểu boilerplate code. Với App Router mới trong Next.js 13+, routing còn mạnh mẽ hơn với các tính năng như nested layouts, loading states, và error boundaries tự động.

• **Tích hợp API Routes:** Next.js cho phép tạo các API backend ngay trong cùng dự án Next.js thông qua thư mục `pages/api` (hoặc `app/api` với App Router). Mỗi file trong thư mục này tự động trở thành một API endpoint, giúp bạn có thể xây dựng full-stack application trong một codebase duy nhất. API routes trong Next.js là các serverless functions, có thể xử lý các request HTTP, kết nối với database, tích hợp với các dịch vụ bên thứ ba, hoặc thực hiện các tác vụ backend phức tạp. Điều này đặc biệt hữu ích cho các dự án nhỏ đến trung bình, nơi bạn không cần một backend server riêng biệt, hoặc khi bạn muốn tạo các API proxy, webhook handlers, hoặc middleware functions.

• **Hỗ trợ TypeScript và ES6+:** Next.js hỗ trợ đầy đủ TypeScript và các tính năng ES6+ ngay từ đầu, giúp dễ dàng phát triển với cú pháp hiện đại. Bạn chỉ cần đổi phần mở rộng file từ `.js` sang `.ts` hoặc `.tsx`, và Next.js sẽ tự động cấu hình TypeScript cho dự án. Framework này cũng hỗ trợ các tính năng JavaScript hiện đại như async/await, destructuring, template literals, arrow functions, và nhiều tính năng khác của ES6+. Next.js còn tích hợp sẵn các công cụ như ESLint và có thể cấu hình để sử dụng các linter và formatter khác, giúp đảm bảo code quality và consistency trong toàn bộ dự án.

### Lý do Next.js được nhiều doanh nghiệp phần mềm hướng tới trong đặt booking:

• **Hiệu suất cao và tối ưu trải nghiệm người dùng:** Nhờ kết hợp Server-side Rendering (SSR) và Static Site Generation (SSG), Next.js giúp ứng dụng tải nhanh, phản hồi mượt mà, đặc biệt quan trọng trong các trang đặt phòng khách sạn có nhiều tương tác như tìm kiếm phòng, xem chi tiết phòng, chọn ngày check-in/check-out, thêm dịch vụ kèm theo, và thanh toán. Với SSR, các trang danh sách phòng và chi tiết phòng có thể được render sẵn trên server với dữ liệu mới nhất về tình trạng phòng, giúp khách hàng nhận được thông tin chính xác ngay lập tức. Ngoài ra, Next.js hỗ trợ Lazy Loading và Image Optimization, giúp trang hiển thị hình ảnh phòng và các tiện ích nhanh hơn, tiết kiệm băng thông và cải thiện trải nghiệm người dùng, đặc biệt quan trọng khi khách hàng duyệt qua nhiều hình ảnh phòng chất lượng cao.

• **Tính linh hoạt và tái sử dụng cao:** Dựa trên kiến trúc component của React, các thành phần trong ứng dụng đặt phòng có thể tái sử dụng dễ dàng. Các component như RoomCard, BookingForm, DatePicker, ServiceSelector, và PaymentForm có thể được sử dụng lại ở nhiều trang khác nhau trong hệ thống. Điều này giúp tiết kiệm thời gian phát triển, giảm chi phí bảo trì và dễ dàng mở rộng hệ thống khi cần bổ sung tính năng mới như đặt phòng nhóm, đặt dịch vụ bổ sung, hoặc tích hợp các phương thức thanh toán mới. Kiến trúc component-based cũng giúp đảm bảo tính nhất quán trong giao diện và trải nghiệm người dùng trên toàn bộ website đặt phòng.

• **Khả năng tối ưu hóa SEO vượt trội:** Với Server-side Rendering (SSR), Next.js giúp hiển thị đầy đủ nội dung trước khi gửi đến trình duyệt, giúp công cụ tìm kiếm lập chỉ mục tốt hơn. Đây là lợi thế lớn cho các website đặt phòng khách sạn, giúp thông tin về phòng, giá cả, tiện ích, và địa điểm hiển thị cao hơn trên kết quả tìm kiếm. Khi khách hàng tìm kiếm "khách sạn ở [địa điểm]" hoặc "đặt phòng khách sạn [tên khách sạn]", website có thể xuất hiện với đầy đủ thông tin như hình ảnh, mô tả, giá cả, và đánh giá, từ đó tăng lượt truy cập và tỷ lệ đặt phòng. Next.js cũng hỗ trợ các tính năng SEO như meta tags động cho từng loại phòng, structured data cho thông tin khách sạn, và Open Graph tags cho chia sẻ mạng xã hội.

• **Khả năng cá nhân hóa trải nghiệm người dùng:** Next.js hỗ trợ tốt việc xây dựng trải nghiệm đặt phòng cá nhân hóa, chẳng hạn như đề xuất phòng phù hợp dựa trên lịch sử đặt phòng, danh sách yêu thích, hoặc lịch sử đặt phòng trước đó. Hệ thống có thể ghi nhớ sở thích của khách hàng như loại phòng ưa thích, tiện ích cần thiết, hoặc khoảng giá mong muốn, và tự động đề xuất các phòng phù hợp trong các lần đặt tiếp theo. Điều này giúp tăng tỷ lệ chuyển đổi và mức độ hài lòng của khách hàng, vì họ không cần phải tìm kiếm và lọc lại từ đầu mỗi lần đặt phòng. Next.js cũng hỗ trợ việc tạo các trang dashboard cá nhân nơi khách hàng có thể xem lịch sử đặt phòng, quản lý thông tin cá nhân, và nhận các ưu đãi đặc biệt dựa trên hành vi đặt phòng.

**Ví dụ:**

```tsx
"use client"
import { HeroSection } from "@/components/hero-section"
import { RoomSearch } from "@/components/room-search-new"
import { FeaturedRooms } from "@/components/featured-rooms"
import { ServicesSection } from "@/components/services-section"
import { NearbyAttractions } from "@/components/nearby-attractions"
import { Footer } from "@/components/footer"

// Tạo trang chủ Next.js với App Router (file app/page.tsx)
export default function MikoHotelHome() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <RoomSearch />
        <FeaturedRooms />
        <section className="py-12 md:py-16 lg:py-20">
          <ServicesSection />
        </section>
        <NearbyAttractions />
      </main>
      <Footer />
    </div>
  )
}
```

Next.js tự động render trang này khi người dùng truy cập đường dẫn `/`. Với App Router, mỗi file trong thư mục `app` tự động trở thành một route. Directive `"use client"` cho phép sử dụng các tính năng client-side như hooks và event handlers. Trang này có thể kết hợp với SSR hoặc SSG để tối ưu tốc độ tải trang và SEO, đặc biệt hữu ích cho các component như `FeaturedRooms` có thể được pre-render với dữ liệu phòng mới nhất.

### Lợi ích của Next.js:

• **Hiệu suất cao:** Kết hợp SSR (Server-Side Rendering), SSG (Static Site Generation), và ISR (Incremental Static Regeneration) giúp tối ưu tốc độ tải trang. SSR render trang trên server mỗi request, đảm bảo dữ liệu luôn mới nhất. SSG tạo các trang tĩnh tại thời điểm build, giúp tải cực kỳ nhanh. ISR cho phép cập nhật các trang tĩnh theo định kỳ mà không cần rebuild toàn bộ site, đặc biệt hữu ích cho các trang có dữ liệu thay đổi thường xuyên như danh sách phòng hoặc giá cả. Sự kết hợp linh hoạt này giúp ứng dụng đạt được hiệu suất tối ưu cho từng loại trang.

• **Tối ưu SEO:** Nội dung được render trước trên server giúp công cụ tìm kiếm dễ lập chỉ mục. Các bot tìm kiếm có thể đọc toàn bộ HTML ngay từ lần đầu truy cập, không cần phải chờ JavaScript chạy như các SPA thuần túy. Next.js cũng hỗ trợ các tính năng SEO như meta tags động, Open Graph tags, structured data, và sitemap tự động, giúp cải thiện khả năng hiển thị trên các công cụ tìm kiếm và tăng lưu lượng truy cập tự nhiên.

• **Routing tự động và API tích hợp:** Next.js tự động tạo routes từ cấu trúc thư mục, giảm thời gian cấu hình và tăng tốc độ phát triển. Bạn không cần cấu hình routing phức tạp - chỉ cần tạo file trong thư mục `app` hoặc `pages` và route sẽ tự động được tạo. Ngoài ra, Next.js cho phép tạo API routes ngay trong cùng dự án thông qua thư mục `app/api` hoặc `pages/api`, giúp xây dựng full-stack application trong một codebase duy nhất mà không cần backend server riêng biệt.

• **Hỗ trợ tốt cho thương mại điện tử và đặt phòng:** Next.js dễ dàng tích hợp với các dịch vụ thanh toán như Stripe, quản lý sản phẩm/dịch vụ, và tối ưu UX/UI. Với SSR, các trang sản phẩm hoặc phòng có thể được render với dữ liệu mới nhất về giá cả, tình trạng, và đánh giá, giúp khách hàng nhận được thông tin chính xác ngay lập tức. Next.js cũng hỗ trợ các tính năng như image optimization, lazy loading, và code splitting tự động, giúp cải thiện trải nghiệm người dùng và tỷ lệ chuyển đổi.

• **Tái sử dụng thành phần:** Next.js kế thừa sức mạnh component từ React, cho phép tạo các component có thể tái sử dụng trong toàn bộ ứng dụng. Các component như RoomCard, BookingForm, DatePicker có thể được sử dụng lại ở nhiều trang khác nhau, giúp giảm thiểu code duplication và đảm bảo tính nhất quán trong giao diện. Điều này đặc biệt hữu ích cho các dự án lớn với nhiều trang và tính năng tương tự.

• **Cộng đồng mạnh mẽ và hệ sinh thái phong phú:** Next.js có cộng đồng phát triển rất mạnh và hệ sinh thái phong phú, dễ dàng mở rộng và tích hợp với các công cụ như Stripe cho thanh toán, MongoDB cho database, TailwindCSS cho styling, và nhiều thư viện khác. Cộng đồng thường xuyên cập nhật, chia sẻ best practices, và tạo ra các plugin và thư viện hỗ trợ mới, giúp lập trình viên dễ dàng tìm kiếm giải pháp cho các vấn đề gặp phải và mở rộng tính năng của ứng dụng.

### Khi nào nên sử dụng Next.js:

• **Khi cần xây dựng ứng dụng web hiệu suất cao, thân thiện SEO:** Next.js là lựa chọn lý tưởng khi bạn cần một ứng dụng web có hiệu suất cao và tối ưu SEO. Với SSR và SSG, Next.js giúp cải thiện thời gian tải trang, First Contentful Paint, và khả năng lập chỉ mục của công cụ tìm kiếm. Điều này đặc biệt quan trọng cho các website cần tăng lưu lượng truy cập từ tìm kiếm tự nhiên hoặc cung cấp trải nghiệm người dùng tốt nhất có thể.

• **Khi muốn kết hợp frontend và backend trong cùng một dự án:** Next.js cho phép tạo API routes ngay trong cùng dự án, giúp xây dựng full-stack application trong một codebase duy nhất. Điều này đặc biệt hữu ích cho các dự án nhỏ đến trung bình, nơi bạn không cần một backend server riêng biệt, hoặc khi bạn muốn tạo các API proxy, webhook handlers, hoặc middleware functions. API routes trong Next.js là các serverless functions, có thể deploy dễ dàng trên các platform như Vercel, Netlify, hoặc AWS.

• **Khi phát triển ứng dụng thương mại điện tử, website du lịch hoặc đặt phòng khách sạn trực tuyến:** Next.js đặc biệt phù hợp cho các ứng dụng thương mại điện tử, website du lịch, hoặc đặt phòng khách sạn trực tuyến. Với SSR, các trang sản phẩm, phòng, hoặc tour có thể được render với dữ liệu mới nhất về giá cả, tình trạng, và đánh giá. Next.js cũng dễ dàng tích hợp với các dịch vụ thanh toán như Stripe, các hệ thống quản lý đặt chỗ, và các công cụ phân tích để theo dõi hành vi người dùng và tối ưu hóa tỷ lệ chuyển đổi.

• **Khi cần ứng dụng có khả năng mở rộng, dễ bảo trì và cập nhật nhanh chóng:** Next.js giúp xây dựng các ứng dụng có khả năng mở rộng và dễ bảo trì nhờ kiến trúc component-based, routing tự động, và code splitting tự động. Khi dự án lớn dần lên, bạn có thể dễ dàng thêm các trang mới, tính năng mới, hoặc tích hợp các dịch vụ bên thứ ba mà không ảnh hưởng đến các phần khác của ứng dụng. Next.js cũng hỗ trợ hot reload trong quá trình phát triển, giúp cập nhật và test các thay đổi nhanh chóng.

---

## 🗄️ MONGODB - HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU NOSQL

MongoDB là một hệ quản trị cơ sở dữ liệu NoSQL mã nguồn mở phổ biến, được phát triển bởi công ty MongoDB Inc. Khác với các hệ quản trị cơ sở dữ liệu quan hệ như MySQL, MongoDB lưu trữ dữ liệu dưới dạng tài liệu (document) trong các bộ sưu tập (collection), sử dụng định dạng BSON (Binary JSON) để thao tác với dữ liệu linh hoạt hơn. Mỗi document trong MongoDB là một đối tượng JSON-like có thể chứa các trường lồng nhau, mảng, và các kiểu dữ liệu phức tạp, cho phép lưu trữ dữ liệu theo cấu trúc tự nhiên và gần gũi với cách ứng dụng sử dụng dữ liệu.

MongoDB không yêu cầu schema cố định như các cơ sở dữ liệu quan hệ, cho phép các document trong cùng một collection có cấu trúc khác nhau. Điều này đặc biệt hữu ích trong quá trình phát triển, khi bạn cần thay đổi cấu trúc dữ liệu thường xuyên hoặc khi làm việc với dữ liệu không có cấu trúc rõ ràng. Tuy nhiên, MongoDB vẫn hỗ trợ schema validation thông qua Mongoose ODM (Object Document Mapper) để đảm bảo tính nhất quán của dữ liệu trong các ứng dụng production.

### Những ưu điểm làm nên chất lượng của MongoDB:

• **Kiến trúc phi quan hệ:** MongoDB lưu trữ dữ liệu theo dạng tài liệu (document) thay vì bảng (table). Mỗi document là một bản ghi dữ liệu có cấu trúc linh hoạt, thường được biểu diễn dưới dạng JSON hoặc BSON, giúp dễ dàng mở rộng và thay đổi cấu trúc dữ liệu mà không cần chỉnh sửa toàn bộ hệ thống. Điều này đặc biệt hữu ích cho các ứng dụng như quản lý khách sạn, nơi bạn có thể thêm các trường mới như `specialRequests`, `preferences`, hoặc `loyaltyPoints` vào document booking mà không cần alter table như trong cơ sở dữ liệu quan hệ.

• **Hiệu suất cao và khả năng mở rộng:** MongoDB được thiết kế cho hiệu suất cao, tối ưu hóa cho các ứng dụng cần xử lý lượng dữ liệu lớn và truy cập nhanh. MongoDB hỗ trợ scaling theo chiều ngang (horizontal scaling) thông qua sharding (phân mảnh dữ liệu), cho phép mở rộng hệ thống dễ dàng khi lượng dữ liệu tăng lên. Với indexing thông minh, MongoDB có thể truy vấn dữ liệu nhanh chóng, đặc biệt quan trọng cho các ứng dụng cần tìm kiếm phòng, lọc booking, hoặc truy xuất lịch sử đặt phòng một cách nhanh chóng.

• **Tính bảo mật cao:** MongoDB cung cấp nhiều lớp bảo mật như kiểm soát truy cập dựa trên vai trò (Role-Based Access Control), xác thực người dùng, mã hóa dữ liệu trong quá trình truyền và lưu trữ, giúp đảm bảo an toàn cho cơ sở dữ liệu. Với các tính năng như field-level encryption, audit logging, và network encryption, MongoDB đảm bảo rằng thông tin nhạy cảm như thông tin khách hàng, số thẻ tín dụng, hoặc mật khẩu được bảo vệ một cách an toàn.

• **Tính nhất quán và khả năng chịu lỗi:** MongoDB hỗ trợ các mô hình nhất quán mạnh mẽ (strong consistency) và cơ chế sao lưu tự động, replicaset (bản sao tự động) để đảm bảo hệ thống có thể phục hồi nhanh chóng khi xảy ra sự cố. Với replica sets, MongoDB tự động sao chép dữ liệu sang nhiều server, đảm bảo tính sẵn sàng cao và khả năng phục hồi khi một server gặp sự cố. Điều này đặc biệt quan trọng cho các hệ thống quản lý khách sạn cần hoạt động 24/7 và không được mất dữ liệu đặt phòng.

• **Tương thích với nhiều ngôn ngữ lập trình:** MongoDB tích hợp tốt với các ngôn ngữ như Node.js, Python, Java, C#, PHP, v.v. Đây là một lựa chọn phổ biến cho các ứng dụng web hiện đại, đặc biệt khi yêu cầu khả năng mở rộng và linh hoạt dữ liệu. Trong dự án này, MongoDB được sử dụng với Node.js và Mongoose ODM, cho phép định nghĩa schema với TypeScript và có được type safety khi làm việc với dữ liệu. Điều này giúp phát triển nhanh chóng và giảm thiểu lỗi trong quá trình coding.

### Lợi ích của MongoDB:

• **Hiệu suất cao:** MongoDB tối ưu hóa cho truy vấn nhanh, lưu trữ linh hoạt, và phù hợp với các ứng dụng quy mô lớn. Với cơ chế indexing thông minh và khả năng truy vấn phức tạp, MongoDB có thể xử lý hàng triệu document một cách hiệu quả. Điều này đặc biệt quan trọng cho các hệ thống quản lý khách sạn cần tìm kiếm phòng, lọc booking theo nhiều tiêu chí, hoặc truy xuất lịch sử đặt phòng một cách nhanh chóng. MongoDB cũng hỗ trợ aggregation pipeline mạnh mẽ, cho phép thực hiện các phép tính phức tạp và phân tích dữ liệu trực tiếp trong database.

• **Mã nguồn mở và miễn phí:** MongoDB Community Edition hoàn toàn miễn phí, phù hợp với các dự án từ nhỏ đến lớn. Điều này giúp giảm chi phí phát triển và triển khai, đặc biệt quan trọng cho các startup hoặc dự án có ngân sách hạn chế. MongoDB Community Edition cung cấp đầy đủ các tính năng cần thiết cho hầu hết các ứng dụng, bao gồm replication, sharding, và các công cụ quản lý cơ bản. Khi dự án phát triển và cần các tính năng nâng cao, bạn có thể nâng cấp lên MongoDB Enterprise Edition.

• **Tương thích tốt:** MongoDB hỗ trợ tốt cho Node.js, Python, Java và nhiều nền tảng hiện đại. Với driver chính thức cho hơn 10 ngôn ngữ lập trình, MongoDB có thể tích hợp dễ dàng vào bất kỳ stack công nghệ nào. Trong dự án này, MongoDB được sử dụng với Node.js và Mongoose ODM, cung cấp một lớp abstraction mạnh mẽ giúp làm việc với database trở nên dễ dàng và an toàn hơn. Mongoose cũng hỗ trợ TypeScript, cho phép có type safety khi định nghĩa schema và truy vấn dữ liệu.

• **Khả năng mở rộng mạnh mẽ:** Dễ dàng mở rộng dữ liệu theo chiều ngang với sharding, phù hợp cho hệ thống lớn. Sharding cho phép phân chia dữ liệu trên nhiều server, giúp hệ thống có thể xử lý lượng dữ liệu lớn và số lượng request cao. Điều này đặc biệt quan trọng khi hệ thống quản lý khách sạn phát triển, với hàng nghìn booking mỗi ngày, hàng triệu document trong database, và cần phục vụ nhiều người dùng đồng thời. MongoDB tự động quản lý việc phân phối dữ liệu và cân bằng tải giữa các shard.

• **Bảo mật cao:** Bao gồm cơ chế mã hóa dữ liệu, phân quyền người dùng và xác thực truy cập an toàn. MongoDB cung cấp nhiều lớp bảo mật như authentication, authorization, encryption at rest, encryption in transit, và audit logging. Với Role-Based Access Control (RBAC), bạn có thể kiểm soát chính xác ai có thể truy cập vào collection nào và thực hiện thao tác gì. Điều này đặc biệt quan trọng cho hệ thống quản lý khách sạn, nơi cần bảo vệ thông tin nhạy cảm của khách hàng, dữ liệu thanh toán, và thông tin nội bộ của khách sạn.

• **Linh hoạt:** Cho phép lưu trữ dữ liệu không đồng nhất trong cùng một collection, lý tưởng cho các ứng dụng thay đổi nhanh. Không giống như cơ sở dữ liệu quan hệ yêu cầu schema cố định, MongoDB cho phép các document trong cùng một collection có cấu trúc khác nhau. Điều này đặc biệt hữu ích trong quá trình phát triển, khi bạn cần thêm các trường mới hoặc thay đổi cấu trúc dữ liệu mà không cần migrate toàn bộ database. Ví dụ, bạn có thể thêm trường `specialRequests` vào một số booking document mà không ảnh hưởng đến các document khác.

• **Dễ học và sử dụng:** Với cú pháp đơn giản và mô hình dữ liệu tự nhiên theo JSON, MongoDB dễ tiếp cận cho cả người mới lẫn chuyên gia. Cú pháp truy vấn của MongoDB gần gũi với JavaScript và JSON, giúp các developer web dễ dàng làm quen. Mongoose ODM cung cấp một API trực quan và mạnh mẽ, giúp việc định nghĩa schema, validation, và truy vấn dữ liệu trở nên đơn giản hơn. Điều này giúp giảm thời gian học tập và tăng năng suất phát triển, đặc biệt quan trọng cho các dự án cần phát triển nhanh như hệ thống quản lý khách sạn.

### Ứng dụng thực tế của MongoDB:

• **Lưu trữ dữ liệu người dùng cho các ứng dụng web và mobile:** MongoDB là lựa chọn lý tưởng để lưu trữ thông tin người dùng, profile, preferences, và lịch sử hoạt động. Với cấu trúc document linh hoạt, bạn có thể lưu trữ thông tin người dùng với các trường khác nhau tùy theo loại tài khoản (admin, staff, customer). Trong hệ thống quản lý khách sạn, MongoDB lưu trữ thông tin khách hàng, nhân viên, và quản trị viên, cùng với các preferences, lịch sử đặt phòng, và thông tin thanh toán một cách hiệu quả.

• **Xây dựng hệ thống quản lý nội dung (CMS) cho website/blog:** MongoDB phù hợp cho việc lưu trữ nội dung động như bài viết, trang, media files, và metadata. Với khả năng lưu trữ nested documents và arrays, MongoDB có thể lưu trữ toàn bộ cấu trúc của một bài viết bao gồm title, content, images, tags, categories, và comments trong một document duy nhất. Điều này giúp truy vấn nhanh chóng và giảm số lượng join operations so với cơ sở dữ liệu quan hệ.

• **Lưu trữ sản phẩm cho các website thương mại điện tử:** MongoDB lý tưởng cho việc lưu trữ thông tin sản phẩm với các thuộc tính đa dạng và thay đổi thường xuyên. Trong ngữ cảnh quản lý khách sạn, MongoDB lưu trữ thông tin phòng, loại phòng, dịch vụ, và địa điểm với các thuộc tính như giá cả, tiện ích, hình ảnh, mô tả, và đánh giá. Cấu trúc linh hoạt cho phép thêm các thuộc tính mới như `seasonalPricing`, `promotions`, hoặc `availabilityCalendar` mà không cần thay đổi schema.

• **Phát triển các ứng dụng cần lưu trữ dữ liệu phi cấu trúc hoặc thay đổi thường xuyên:** MongoDB đặc biệt phù hợp cho các ứng dụng cần lưu trữ dữ liệu không có cấu trúc rõ ràng hoặc có cấu trúc thay đổi thường xuyên. Trong hệ thống quản lý khách sạn, các document như booking có thể chứa thông tin khách hàng với số lượng và cấu trúc khác nhau, các dịch vụ bổ sung tùy chọn, và các ghi chú đặc biệt. MongoDB cho phép lưu trữ tất cả thông tin này trong một document duy nhất mà không cần normalize như trong cơ sở dữ liệu quan hệ.

### Một số công cụ hỗ trợ MongoDB:

• **MongoDB Compass:** Công cụ giao diện đồ họa để quản lý và trực quan hóa cơ sở dữ liệu MongoDB. Compass cung cấp giao diện trực quan để xem, chỉnh sửa, và quản lý dữ liệu trong MongoDB mà không cần sử dụng command line. Với Compass, bạn có thể dễ dàng xem cấu trúc của collections, thực hiện queries, xem execution plans, và phân tích hiệu suất. Điều này đặc biệt hữu ích khi debug, kiểm tra dữ liệu booking, hoặc tối ưu hóa queries trong hệ thống quản lý khách sạn.

• **Mongoose (thư viện Node.js):** Giúp mô hình hóa dữ liệu và thao tác dễ dàng trong ứng dụng Node.js. Mongoose cung cấp một lớp abstraction mạnh mẽ trên MongoDB driver, cho phép định nghĩa schema với validation, middleware, và methods. Trong dự án này, Mongoose được sử dụng để định nghĩa các model như Room, Booking, User, Service với TypeScript, đảm bảo type safety và validation tự động. Mongoose cũng hỗ trợ các tính năng như population (join), virtual fields, và pre/post hooks, giúp xử lý business logic phức tạp một cách dễ dàng.

• **Robo 3T (RoboMongo):** Phần mềm miễn phí để quản lý MongoDB với giao diện đơn giản và thân thiện. Robo 3T là một công cụ lightweight và dễ sử dụng, phù hợp cho các developer muốn quản lý MongoDB một cách nhanh chóng. Với Robo 3T, bạn có thể kết nối đến MongoDB server, xem và chỉnh sửa documents, thực hiện queries, và quản lý collections. Công cụ này đặc biệt hữu ích trong quá trình phát triển và testing, khi bạn cần kiểm tra dữ liệu hoặc thực hiện các thao tác nhanh trên database.

**Ví dụ:**

```javascript
// Tạo một document phòng mới trong collection rooms (theo schema thực tế)
db.rooms.insertOne({
    roomNumber: "101",
    typeId: ObjectId("68f24eb903d5b253c7bc6bea"), 
    status: "available", 
    amenities: ["wifi", "air conditioning", "television", "kitchen", "bathroom", "balcony"],
    createdAt: new Date(),
    updatedAt: new Date()
});
```

Trong ví dụ trên, MongoDB lưu trữ thông tin phòng dưới dạng document với các trường như `roomNumber`, `typeId` (tham chiếu đến loại phòng), `status`, `amenities` (mảng các tiện ích), và `images` (mảng các đường dẫn hình ảnh). Cấu trúc này linh hoạt và dễ dàng mở rộng khi cần thêm các trường mới như `description`, `price`, hoặc `reviews` mà không cần thay đổi schema của toàn bộ collection.

**Ví dụ TypeScript với Mongoose ODM:**

```typescript
import { Schema, model } from "mongoose";

// Định nghĩa schema cho Room với TypeScript
const roomSchema = new Schema(
  {
    roomNumber: {
      type: String,
      required: [true, "Số phòng là bắt buộc"],
      trim: true,
    },
    typeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType", // liên kết tới collection roomTypes
      required: [true, "Loại phòng là bắt buộc"],
    },
    status: {
      type: String,
      enum: ["available", "booked", "maintenance", "checked_in", "occupied", "unavailable"],
      default: "available",
    },
    amenities: {
      type: [String],
      default: ["wifi", "air conditioning", "television", "kitchen", "bathroom", "balcony"],
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    versionKey: false,
  }
);

// Tạo model từ schema
export default model("Room", roomSchema);

// Sử dụng model để tạo document mới
const newRoom = new Room({
  roomNumber: "101",
  typeId: "68f24eb903d5b253c7bc6bea",
  status: "available",
  amenities: ["wifi", "air conditioning", "television", "balcony"],
  images: ["/uploads/rooms/room101-1.jpg", "/uploads/rooms/room101-2.jpg"]
});

await newRoom.save(); // Lưu vào MongoDB
```

Với Mongoose và TypeScript, bạn có được type safety khi làm việc với MongoDB, giúp phát hiện lỗi sớm trong quá trình phát triển và đảm bảo tính nhất quán của dữ liệu thông qua schema validation.

**Ví dụ về response từ API với dữ liệu MongoDB:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "bookings": [
      {
        "_id": "69194d519d93b01852f23476",
        "customerId": {
          "_id": "691947511cdff7a83a331d6f",
          "fullName": "Nguyễn Văn Tứ",
          "email": "nguyenvantu1472003@gmail.com",
          "phoneNumber": "0704627401"
        },
        "guests": [
          {
            "fullName": "Nguyen van tu",
            "idNumber": "474629543",
            "dateOfBirth": "2003-11-17T00:00:00.000Z",
            "phoneNumber": "0704627402",
            "email": "",
            "isMainGuest": true,
            "_id": "69194d519d93b01852f23477"
          }
        ],
        "guestCount": 1,
        "roomId": {
          "_id": "68f251dd03d5b253c7bc6c3e",
          "roomNumber": "101",
          "typeId": "68f24eb903d5b253c7bc6bea"
        },
        "checkIn": "2025-11-17T07:00:00.000Z",
        "checkOut": "2025-11-18T05:00:00.000Z",
        "services": [
          {
            "serviceId": "68f2596a98b375d2c649ea5c",
            "name": "Hồ bơi",
            "price": 1000000,
            "quantity": 1,
            "_id": "69194ea3d67bbd6745a00934"
          }
        ],
        "source": "online",
        "totalPrice": 3000000,
        "paidAmount": 3000000,
        "remainingAmount": 0,
        "paymentStatus": "paid",
        "notes": "",
        "createdAt": "2025-11-16T04:04:33.099Z",
        "updatedAt": "2025-11-16T04:10:11.228Z"
      }
    ]
  }
}
```

Ví dụ trên minh họa cách MongoDB lưu trữ và trả về dữ liệu booking với cấu trúc phức tạp bao gồm:
- **Nested objects:** `customerId` và `roomId` là các object lồng nhau chứa thông tin chi tiết
- **Arrays:** `guests` và `services` là các mảng chứa nhiều document con
- **References:** Các trường như `typeId` trong `roomId` là tham chiếu đến document khác, có thể được populate bằng Mongoose để lấy thông tin đầy đủ
- **Timestamps:** `createdAt` và `updatedAt` được tự động quản lý bởi Mongoose
- **Flexible structure:** Document có thể chứa các trường như `notes` có thể để trống mà không ảnh hưởng đến cấu trúc tổng thể

---

## 🚀 EXPRESS.JS - FRAMEWORK WEB CHO NODE.JS

Express.js là một framework web nhẹ và linh hoạt cho Node.js, được thiết kế để xây dựng các ứng dụng web và API một cách nhanh chóng và hiệu quả. Express.js đơn giản hóa quy trình phát triển ứng dụng phía server, cung cấp một bộ công cụ mạnh mẽ giúp các nhà phát triển dễ dàng xử lý yêu cầu HTTP, định tuyến, quản lý session, và nhiều tính năng khác mà không cần viết quá nhiều mã. Framework này được xây dựng trên nền tảng của Node.js HTTP module, nhưng cung cấp các tính năng bổ sung như routing, middleware, template engines, và nhiều plugin mở rộng, giúp phát triển ứng dụng backend trở nên nhanh chóng và có tổ chức hơn.

Express.js sử dụng mô hình middleware để xử lý các request và response. Middleware là các hàm có thể truy cập vào request object, response object, và next function trong chuỗi xử lý request-response. Điều này cho phép bạn thực hiện các tác vụ như authentication, logging, parsing request body, validation, error handling, và nhiều tác vụ khác một cách modular và có thể tái sử dụng. Trong dự án này, Express.js được sử dụng để xây dựng RESTful API với các middleware như CORS, body parser, authentication, validation, và error handling.

### Những ưu điểm làm nên chất lượng của Express.js:

• **Dựa trên Node.js:** Express.js được xây dựng trên nền tảng của Node.js, sử dụng môi trường JavaScript phía server. Điều này giúp các nhà phát triển sử dụng JavaScript cho cả phía server và client, tạo nên tính đồng nhất và giảm thiểu thời gian học tập khi chỉ cần sử dụng một ngôn ngữ duy nhất. Trong dự án này, việc sử dụng TypeScript cho cả frontend và backend càng tăng cường tính đồng nhất, cho phép chia sẻ type definitions và đảm bảo type safety xuyên suốt toàn bộ ứng dụng.

• **Tối ưu hóa tốc độ và hiệu suất:** Với kiến trúc nhẹ và không dư thừa tính năng, Express.js giúp tối ưu hóa tốc độ xử lý của các ứng dụng. Điều này rất quan trọng đối với các ứng dụng web yêu cầu hiệu suất cao như thương mại điện tử, mạng xã hội, hoặc các dịch vụ trực tuyến có lượng truy cập lớn. Trong hệ thống quản lý khách sạn, Express.js xử lý hàng nghìn request mỗi ngày từ các client (web và mobile), đảm bảo thời gian phản hồi nhanh chóng cho các thao tác như tìm kiếm phòng, đặt phòng, hoặc truy vấn lịch sử booking.

• **Middleware mạnh mẽ:** Middleware là một tính năng quan trọng trong Express.js, cho phép bạn thêm các lớp xử lý giữa yêu cầu và phản hồi. Các middleware có thể được sử dụng để xử lý xác thực, ghi log, quản lý session, phân tích yêu cầu (request parsing), hoặc thực hiện bất kỳ chức năng nào trước khi gửi phản hồi tới client. Trong dự án này, các middleware được sử dụng bao gồm authentication middleware để kiểm tra JWT token, validation middleware để kiểm tra dữ liệu đầu vào, CORS middleware để xử lý cross-origin requests, và error handling middleware để xử lý lỗi một cách thống nhất.

• **Hỗ trợ đầy đủ REST API:** Express.js là framework lý tưởng để xây dựng các API RESTful. Nó cung cấp các công cụ để xây dựng các endpoint, xử lý yêu cầu từ phía client, và trả về phản hồi theo chuẩn REST, phù hợp cho việc phát triển dịch vụ web và các ứng dụng di động. Trong dự án này, Express.js được sử dụng để xây dựng RESTful API với các endpoint như `/api/v1/bookings`, `/api/v1/rooms`, `/api/v1/users`, mỗi endpoint hỗ trợ các phương thức HTTP chuẩn như GET, POST, PUT, DELETE, và trả về dữ liệu dưới dạng JSON.

• **Hệ sinh thái lớn:** Express.js có hệ sinh thái lớn và cộng đồng phát triển mạnh mẽ. Điều này có nghĩa là có rất nhiều module và middleware sẵn có mà bạn có thể dễ dàng tích hợp vào ứng dụng của mình để tăng cường chức năng, chẳng hạn như bảo mật, xác thực, quản lý session, hoặc xử lý dữ liệu. Trong dự án này, các package như `jsonwebtoken` cho authentication, `yup` và `express-validator` cho validation, `multer` cho file upload, `nodemailer` cho email, và `socket.io` cho real-time communication đều tích hợp mượt mà với Express.js.

• **Hỗ trợ nhiều chế độ xem (view engines):** Express.js hỗ trợ nhiều engine cho phép tạo ra các tệp HTML động. Các engine phổ biến bao gồm Pug (trước đây là Jade), EJS, Handlebars, và nhiều lựa chọn khác. Điều này giúp dễ dàng render giao diện người dùng với dữ liệu động. Mặc dù trong dự án này, Express.js chủ yếu được sử dụng để xây dựng RESTful API (không render HTML), nhưng khả năng này vẫn hữu ích khi cần tạo các trang admin, email templates, hoặc PDF reports với dữ liệu động.

• **Cộng đồng lớn:** Express.js có một cộng đồng phát triển mạnh mẽ và rất nhiều tài liệu và ví dụ trực tuyến giúp bạn học và sử dụng nó dễ dàng. Cộng đồng Express.js rất tích cực, thường xuyên cập nhật, chia sẻ best practices, và tạo ra các middleware và plugin mới. Điều này giúp lập trình viên dễ dàng tìm kiếm giải pháp cho các vấn đề gặp phải, học hỏi từ các dự án mã nguồn mở, và nhận được hỗ trợ từ cộng đồng khi gặp khó khăn trong quá trình phát triển.

### Lợi ích của Express.js:

• **Dễ học và sử dụng:** Express.js có cú pháp đơn giản, phù hợp với cả người mới học lập trình. Với cú pháp gần gũi với JavaScript thuần túy và cấu trúc rõ ràng, Express.js giúp các developer dễ dàng nắm bắt và bắt đầu xây dựng ứng dụng web. Tài liệu phong phú và nhiều ví dụ trực tuyến cũng giúp quá trình học tập trở nên dễ dàng hơn. Trong dự án này, Express.js kết hợp với TypeScript giúp tăng cường type safety và khả năng đọc mã, nhưng vẫn giữ được sự đơn giản và dễ hiểu.

• **Xử lý nhanh:** Nhờ sự kết hợp với Node.js, Express có thể xử lý hàng ngàn kết nối đồng thời. Node.js sử dụng event-driven, non-blocking I/O model, cho phép Express.js xử lý nhiều request cùng lúc một cách hiệu quả mà không bị block. Điều này đặc biệt quan trọng cho các ứng dụng cần xử lý nhiều request đồng thời như hệ thống quản lý khách sạn, nơi có nhiều người dùng cùng lúc tìm kiếm phòng, đặt phòng, hoặc truy vấn dữ liệu.

• **Tùy chỉnh linh hoạt:** Bạn có thể thêm các middleware và module tùy chỉnh để đáp ứng yêu cầu dự án. Express.js không ép buộc bạn sử dụng một cấu trúc cụ thể nào, cho phép bạn tổ chức code theo cách phù hợp nhất với dự án. Trong dự án này, các middleware tùy chỉnh được tạo ra để xử lý authentication, validation, error handling, và logging, mỗi middleware có thể được tái sử dụng ở nhiều route khác nhau.

• **Phát triển nhanh:** Với hệ sinh thái module phong phú, bạn có thể dễ dàng thêm các tính năng như xác thực, ghi log, và cache. NPM có hàng nghìn package có thể tích hợp với Express.js, giúp bạn không cần phải viết lại code từ đầu cho các tính năng phổ biến. Trong dự án này, các package như `jsonwebtoken` cho authentication, `winston` hoặc `morgan` cho logging, `express-rate-limit` cho rate limiting, và `helmet` cho security đều có thể được tích hợp dễ dàng.

• **Hỗ trợ tốt cho API:** Express.js là lựa chọn hàng đầu để xây dựng các API RESTful hiện đại. Với khả năng định nghĩa routes linh hoạt, xử lý các phương thức HTTP chuẩn (GET, POST, PUT, DELETE, PATCH), và trả về dữ liệu dưới dạng JSON, Express.js giúp xây dựng API một cách nhanh chóng và có tổ chức. Trong dự án này, Express.js được sử dụng để xây dựng RESTful API với các endpoint như `/api/v1/bookings`, `/api/v1/rooms`, `/api/v1/users`, mỗi endpoint được tổ chức trong các file route riêng biệt để dễ quản lý.

### Khi nào nên sử dụng Express.js:

• **Khi bạn muốn xây dựng API nhanh chóng và hiệu quả:** Express.js là lựa chọn lý tưởng khi bạn cần xây dựng RESTful API hoặc GraphQL API một cách nhanh chóng. Với cú pháp đơn giản và hệ sinh thái phong phú, bạn có thể tạo ra các endpoint API trong thời gian ngắn. Trong dự án này, Express.js được sử dụng để xây dựng backend API cho hệ thống quản lý khách sạn, cung cấp các endpoint cho frontend và mobile app để tương tác với dữ liệu.

• **Khi cần tạo các ứng dụng web với cấu trúc linh hoạt:** Express.js không ép buộc bạn sử dụng một cấu trúc cụ thể, cho phép bạn tổ chức code theo cách phù hợp nhất với dự án. Điều này đặc biệt hữu ích cho các dự án có yêu cầu đặc biệt hoặc cần tích hợp với các hệ thống hiện có. Trong dự án này, code được tổ chức theo mô hình MVC với các thư mục riêng cho controllers, services, models, và routes, giúp code dễ đọc và bảo trì.

• **Khi làm việc với Node.js và cần một framework tối ưu:** Express.js là framework phổ biến nhất cho Node.js, được sử dụng rộng rãi trong cộng đồng và có nhiều tài liệu, ví dụ, và hỗ trợ. Nếu bạn đã quen thuộc với Node.js và JavaScript/TypeScript, Express.js sẽ là lựa chọn tự nhiên để xây dựng ứng dụng backend. Trong dự án này, Express.js được sử dụng cùng với TypeScript, MongoDB, và Socket.IO để xây dựng một hệ thống backend hoàn chỉnh và mạnh mẽ.

**Ví dụ:**

```typescript
import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

// Định nghĩa route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(8080, () => {
  console.log("Server đang chạy tại http://localhost:8080");
});
```

---

## 🟢 NODE.JS - NỀN TẢNG JAVASCRIPT PHÍA SERVER

Node.js là một nền tảng chạy JavaScript phía server, giúp các nhà phát triển xây dựng các ứng dụng mạng nhanh chóng, hiệu quả và có khả năng mở rộng cao. Node.js được phát triển dựa trên V8 JavaScript Engine của Google, trình thông dịch JavaScript được sử dụng trong trình duyệt Chrome. Điểm đặc trưng của Node.js là kiến trúc hướng sự kiện (event-driven) và mô hình không đồng bộ (asynchronous), giúp xử lý các yêu cầu từ client nhanh chóng và hiệu quả.

Với kiến trúc event-driven và non-blocking I/O, Node.js có thể xử lý hàng nghìn kết nối đồng thời mà không cần tạo thread mới cho mỗi kết nối như các ngôn ngữ truyền thống. Điều này giúp Node.js đặc biệt phù hợp cho các ứng dụng real-time như chat, notifications, hoặc các ứng dụng cần xử lý nhiều I/O operations như đọc/ghi file, truy vấn database, hoặc gọi API. Trong dự án này, Node.js được sử dụng để xây dựng backend API với Express.js, xử lý các request từ frontend, tương tác với MongoDB, và cung cấp real-time communication thông qua Socket.IO.

### Những ưu điểm làm nên chất lượng của Node.js:

• **Không đồng bộ và hướng sự kiện:** Node.js sử dụng mô hình non-blocking I/O (nhập/xuất không chặn) và xử lý theo hướng sự kiện, giúp hệ thống có thể xử lý nhiều yêu cầu cùng lúc mà không bị chặn bởi các yêu cầu trước đó. Điều này giúp tối ưu hiệu suất, đặc biệt trong các ứng dụng có nhiều người dùng hoặc yêu cầu thời gian phản hồi nhanh. Trong hệ thống quản lý khách sạn, khi có nhiều người dùng cùng lúc tìm kiếm phòng, đặt phòng, hoặc truy vấn dữ liệu, Node.js có thể xử lý tất cả các request này một cách hiệu quả mà không bị block, đảm bảo thời gian phản hồi nhanh chóng cho tất cả người dùng.

• **Cross-platform:** Node.js hoạt động trên nhiều hệ điều hành như Windows, macOS, Linux và thậm chí trên các thiết bị nhúng như Raspberry Pi, giúp nó trở thành một nền tảng linh hoạt cho các loại dự án khác nhau. Điều này cho phép các developer phát triển ứng dụng trên một hệ điều hành và deploy trên hệ điều hành khác mà không cần thay đổi code. Trong dự án này, backend có thể được phát triển trên Windows và deploy trên Linux server (như Ubuntu trên cloud), đảm bảo tính nhất quán và dễ dàng triển khai.

• **Xử lý đơn luồng với Event Loop:** Mặc dù Node.js chỉ sử dụng một luồng để xử lý các yêu cầu, nó sử dụng Event Loop để quản lý nhiều kết nối cùng một lúc mà không cần nhiều luồng. Điều này giúp Node.js có thể xử lý nhiều yêu cầu đồng thời mà không gặp các vấn đề thường gặp với các hệ thống đa luồng như cạnh tranh tài nguyên (resource contention). Event Loop của Node.js quản lý các callback và promise một cách hiệu quả, đảm bảo các I/O operations không block thread chính, giúp ứng dụng luôn responsive và có thể xử lý nhiều request đồng thời.

• **Hỗ trợ WebSockets:** Node.js hỗ trợ các kết nối WebSocket, giúp dễ dàng xây dựng các ứng dụng thời gian thực (real-time) như ứng dụng chat, các trò chơi nhiều người chơi, hoặc hệ thống theo dõi sự kiện. Với Socket.IO (được xây dựng trên WebSocket), Node.js có thể cung cấp real-time bidirectional communication giữa client và server. Trong dự án này, Socket.IO được sử dụng để xây dựng hệ thống chat real-time giữa khách hàng và staff, cũng như hệ thống thông báo real-time, cho phép người dùng nhận thông báo ngay lập tức khi có booking mới, payment thành công, hoặc message mới.

### Ứng dụng của Node.js:

• **API Backend:** Node.js rất phổ biến để xây dựng các API RESTful với các thư viện như Express.js. Với khả năng xử lý nhiều request đồng thời và hiệu suất cao, Node.js là lựa chọn lý tưởng cho việc xây dựng backend API cho các ứng dụng web và mobile. Trong dự án này, Node.js kết hợp với Express.js được sử dụng để xây dựng RESTful API cho hệ thống quản lý khách sạn, xử lý các request từ frontend như tìm kiếm phòng, đặt phòng, thanh toán, quản lý booking, và nhiều tính năng khác.

• **Ứng dụng real-time:** Node.js lý tưởng cho các ứng dụng thời gian thực như chat hoặc hệ thống thông báo. Với kiến trúc event-driven và hỗ trợ WebSocket, Node.js có thể xử lý hàng nghìn kết nối đồng thời, đảm bảo thời gian phản hồi nhanh chóng cho các ứng dụng real-time. Trong dự án này, Node.js được sử dụng để xây dựng hệ thống chat real-time giữa khách hàng và staff, cũng như hệ thống thông báo real-time để thông báo ngay lập tức khi có booking mới, payment thành công, hoặc các sự kiện quan trọng khác.

• **Xử lý file:** Node.js có thể xử lý file (đọc, ghi, xoá) trên server một cách dễ dàng. Với các module như `fs` (file system) và các thư viện như `multer` để xử lý file upload, Node.js cung cấp các công cụ mạnh mẽ để quản lý file trên server. Trong dự án này, Node.js được sử dụng để xử lý upload ảnh phòng, ảnh dịch vụ, avatar người dùng, và các file khác, đảm bảo việc lưu trữ và quản lý file một cách hiệu quả.

• **Microservices:** Node.js rất phù hợp cho các kiến trúc microservices nhờ khả năng nhẹ và hiệu suất cao. Với khả năng xử lý nhiều request đồng thời và tài nguyên nhẹ, Node.js cho phép xây dựng các microservices độc lập, dễ dàng scale và maintain. Trong dự án này, backend có thể được chia thành các microservices như service quản lý booking, service quản lý payment, service quản lý chat, mỗi service có thể được deploy và scale độc lập.

• **Ứng dụng IoT:** Các thiết bị IoT thường sử dụng Node.js để xử lý dữ liệu cảm biến trong thời gian thực. Với khả năng xử lý event-driven và real-time communication, Node.js là lựa chọn phù hợp cho các ứng dụng IoT cần xử lý dữ liệu từ nhiều thiết bị cảm biến đồng thời. Trong hệ thống quản lý khách sạn, Node.js có thể được sử dụng để tích hợp với các thiết bị IoT như cảm biến nhiệt độ, cảm biến chuyển động, hoặc hệ thống quản lý năng lượng, giúp tự động hóa và tối ưu hóa hoạt động của khách sạn.

### Các thư viện phổ biến của Node.js được sử dụng trong dự án:

• **Express.js:** Framework nhẹ, linh hoạt để xây dựng web server và API. Express.js là framework phổ biến nhất cho Node.js, cung cấp các công cụ mạnh mẽ để xây dựng RESTful API, xử lý middleware, routing, và nhiều tính năng khác. Trong dự án này, Express.js được sử dụng làm framework chính để xây dựng backend API, xử lý các request từ frontend, định nghĩa routes, middleware, và quản lý các endpoint cho các tính năng như booking, payment, authentication, và nhiều tính năng khác.

• **Socket.io:** Hỗ trợ giao tiếp real-time giữa client và server. Socket.io là thư viện mạnh mẽ để xây dựng các ứng dụng real-time, sử dụng WebSocket để tạo kết nối hai chiều giữa client và server. Trong dự án này, Socket.io được sử dụng để xây dựng hệ thống chat real-time giữa khách hàng và staff, cũng như hệ thống thông báo real-time, cho phép người dùng nhận thông báo ngay lập tức khi có booking mới, payment thành công, hoặc message mới.

• **Mongoose:** Thư viện để làm việc với MongoDB dễ dàng hơn. Mongoose là ODM (Object Document Mapper) cho MongoDB, cung cấp schema-based solution để mô hình hóa dữ liệu, validation, query building, và nhiều tính năng khác. Trong dự án này, Mongoose được sử dụng để định nghĩa các schema cho các model như Room, Booking, User, Payment, và nhiều model khác, giúp quản lý dữ liệu MongoDB một cách dễ dàng và an toàn.

• **JWT (jsonwebtoken):** Dùng để xác thực người dùng qua token. JWT là một phương pháp xác thực phổ biến, cho phép server tạo token chứa thông tin người dùng và client sử dụng token này để xác thực các request tiếp theo. Trong dự án này, JWT được sử dụng để xác thực người dùng, cho phép người dùng đăng nhập và sử dụng token để truy cập các API được bảo vệ, đảm bảo tính bảo mật và quản lý session hiệu quả.

• **bcryptjs:** Thư viện mã hóa mật khẩu. bcryptjs được sử dụng để hash mật khẩu người dùng trước khi lưu vào database, đảm bảo tính bảo mật. Trong dự án này, bcryptjs được sử dụng để mã hóa mật khẩu khi người dùng đăng ký hoặc thay đổi mật khẩu, và so sánh mật khẩu khi đăng nhập.

• **CORS:** Middleware để xử lý Cross-Origin Resource Sharing. CORS cho phép frontend (chạy trên domain khác) có thể gọi API từ backend. Trong dự án này, CORS được sử dụng để cho phép frontend Next.js gọi API từ backend Express.js, đảm bảo các request từ client được xử lý đúng cách.

• **dotenv:** Thư viện quản lý biến môi trường. dotenv cho phép load các biến môi trường từ file `.env`, giúp quản lý cấu hình ứng dụng một cách an toàn. Trong dự án này, dotenv được sử dụng để quản lý các biến môi trường như MongoDB URI, JWT secret, port, và các thông tin cấu hình khác.

• **express-validator:** Thư viện validation cho Express.js. express-validator cung cấp các middleware để validate và sanitize dữ liệu đầu vào từ request. Trong dự án này, express-validator được sử dụng để validate các dữ liệu từ form như email, password, booking information, và nhiều dữ liệu khác, đảm bảo tính toàn vẹn dữ liệu.

• **multer:** Middleware xử lý file upload. multer cho phép xử lý multipart/form-data, thường được sử dụng để upload file. Trong dự án này, multer được sử dụng để xử lý upload ảnh phòng, ảnh dịch vụ, avatar người dùng, và các file khác.

• **nodemailer:** Thư viện gửi email. nodemailer cho phép gửi email từ Node.js application. Trong dự án này, nodemailer được sử dụng để gửi email xác nhận booking, email thông báo, email reset password, và nhiều loại email khác.

• **yup:** Thư viện validation schema. yup cung cấp cách định nghĩa và validate schema cho dữ liệu. Trong dự án này, yup được sử dụng để validate dữ liệu đầu vào, đảm bảo tính toàn vẹn và đúng định dạng của dữ liệu trước khi xử lý.

• **moment:** Thư viện xử lý ngày tháng. moment cung cấp các hàm tiện ích để format, parse, và manipulate ngày tháng. Trong dự án này, moment được sử dụng để xử lý các ngày check-in, check-out, tính toán số đêm, và nhiều thao tác liên quan đến ngày tháng khác.

• **pdfkit:** Thư viện tạo file PDF. pdfkit cho phép tạo file PDF từ Node.js. Trong dự án này, pdfkit được sử dụng để tạo hóa đơn PDF, báo cáo, và các tài liệu PDF khác.

• **xlsx:** Thư viện xử lý file Excel. xlsx cho phép đọc và ghi file Excel. Trong dự án này, xlsx được sử dụng để export dữ liệu booking, báo cáo, và các dữ liệu khác ra file Excel.

• **axios:** HTTP client cho Node.js. axios cho phép gọi API từ server-side. Trong dự án này, axios được sử dụng để gọi các API bên ngoài, tích hợp với các dịch vụ third-party, và nhiều mục đích khác.

• **compression:** Middleware nén response. compression giúp nén response trước khi gửi về client, giảm kích thước dữ liệu và tăng tốc độ truyền tải. Trong dự án này, compression được sử dụng để tối ưu hóa hiệu suất, giảm băng thông và tăng tốc độ phản hồi.

• **stream-chat:** Thư viện tích hợp Stream Chat API. stream-chat cung cấp các tính năng chat real-time mạnh mẽ. Trong dự án này, stream-chat được sử dụng để xây dựng hệ thống chat real-time giữa khách hàng và staff, cung cấp các tính năng như messaging, typing indicators, và nhiều tính năng chat khác.

### Lợi ích của Node.js:

• **Đơn giản hóa ngăn xếp công nghệ:** Cả frontend và backend đều dùng JavaScript, giúp dễ dàng quản lý và đồng bộ mã nguồn. Với Node.js, các developer có thể sử dụng cùng một ngôn ngữ (JavaScript/TypeScript) cho cả frontend và backend, giảm thiểu thời gian học tập và chuyển đổi giữa các ngôn ngữ khác nhau. Trong dự án này, TypeScript được sử dụng cho cả frontend (Next.js) và backend (Node.js với Express), giúp team phát triển có thể chia sẻ code, types, và utilities giữa frontend và backend, tăng tính nhất quán và giảm thiểu lỗi.

• **Hiệu suất cao:** Xử lý hàng ngàn yêu cầu đồng thời mà không bị nghẽn. Với kiến trúc event-driven và non-blocking I/O, Node.js có thể xử lý nhiều request đồng thời một cách hiệu quả, đảm bảo thời gian phản hồi nhanh chóng ngay cả khi có nhiều người dùng truy cập cùng lúc. Trong dự án này, Node.js giúp hệ thống có thể xử lý hàng trăm request đồng thời từ nhiều người dùng đang tìm kiếm phòng, đặt phòng, thanh toán, hoặc chat real-time mà không bị nghẽn, đảm bảo trải nghiệm người dùng mượt mà.

• **Cộng đồng lớn:** Node.js có một cộng đồng nhà phát triển sôi động, luôn cập nhật công cụ và giải pháp mới. Với hàng triệu developer trên toàn thế giới, Node.js có một hệ sinh thái phong phú với vô số package, thư viện, và công cụ hỗ trợ. Cộng đồng lớn này cũng đảm bảo rằng các vấn đề thường gặp đã có giải pháp, và có nhiều tài liệu, tutorial, và hỗ trợ sẵn có. Trong dự án này, việc sử dụng Node.js giúp team có thể dễ dàng tìm kiếm giải pháp cho các vấn đề kỹ thuật, tích hợp các thư viện phổ biến, và nhận được hỗ trợ từ cộng đồng khi cần thiết.

• **Tối ưu chi phí:** Hiệu suất cao của Node.js giúp giảm tài nguyên phần cứng cần thiết, từ đó tiết kiệm chi phí. Với khả năng xử lý nhiều request đồng thời trên một server, Node.js giúp giảm số lượng server cần thiết để phục vụ cùng một lượng người dùng, từ đó giảm chi phí hosting và infrastructure. Trong dự án này, Node.js giúp hệ thống có thể phục vụ nhiều người dùng với ít tài nguyên hơn, giảm chi phí vận hành và mở rộng hệ thống khi cần thiết.

### Khi nào sử dụng Node.js:

• **Khi cần xử lý real-time (chat, thông báo):** Node.js với kiến trúc event-driven và hỗ trợ WebSocket là lựa chọn lý tưởng cho các ứng dụng real-time. Với khả năng xử lý nhiều kết nối đồng thời và thời gian phản hồi nhanh, Node.js phù hợp cho các ứng dụng cần giao tiếp real-time như chat, hoặc hệ thống thông báo. Trong dự án này, Node.js được sử dụng để xây dựng hệ thống chat real-time giữa khách hàng và staff, cũng như hệ thống thông báo real-time để thông báo ngay lập tức khi có booking mới, payment thành công, hoặc các sự kiện quan trọng khác.

• **Khi cần xây dựng API backend nhanh chóng:** Node.js kết hợp với Express.js cho phép xây dựng RESTful API một cách nhanh chóng và hiệu quả. Với hệ sinh thái phong phú và nhiều middleware sẵn có, Node.js giúp giảm thời gian phát triển và tăng tốc độ triển khai. Trong dự án này, Node.js được sử dụng để xây dựng backend API cho hệ thống quản lý khách sạn, cung cấp các endpoint cho booking, payment, authentication, và nhiều tính năng khác một cách nhanh chóng và hiệu quả.

• **Khi làm việc với các ứng dụng nhiều kết nối như IoT:** Node.js với khả năng xử lý nhiều kết nối đồng thời và event-driven architecture là lựa chọn phù hợp cho các ứng dụng IoT cần xử lý dữ liệu từ nhiều thiết bị cảm biến đồng thời. Trong hệ thống quản lý khách sạn, Node.js có thể được sử dụng để tích hợp với các thiết bị IoT như cảm biến nhiệt độ, cảm biến chuyển động, hoặc hệ thống quản lý năng lượng, giúp tự động hóa và tối ưu hóa hoạt động của khách sạn.

• **Khi cần hiệu suất cao với tài nguyên tối thiểu:** Node.js với kiến trúc non-blocking I/O và event-driven cho phép xử lý nhiều request đồng thời trên một server với tài nguyên tối thiểu. Điều này giúp giảm chi phí hosting và infrastructure, đặc biệt quan trọng cho các startup hoặc dự án có ngân sách hạn chế. Trong dự án này, Node.js giúp hệ thống có thể phục vụ nhiều người dùng với ít tài nguyên hơn, đảm bảo hiệu suất cao và chi phí thấp.

**Ví dụ:**

```typescript
// server.ts - Khởi động Node.js server với Express và Socket.IO
import app from "./app";
import { createServer } from "http";
import socketService from "./services/socket.service";

// Tạo HTTP server từ Express app (Node.js http module)
const httpServer = createServer(app);

// Khởi tạo WebSocket server cho real-time communication
socketService.initialize(httpServer);

// Khởi động server tại cổng 8080
httpServer.listen(8080, () => {
  console.log("Server is running on port http://localhost:8080");
});
```

Ví dụ trên minh họa cách Node.js được sử dụng trong dự án: sử dụng module `http` của Node.js để tạo HTTP server từ Express app và khởi tạo WebSocket server cho real-time communication.

---

## 📁 API STRUCTURE

### API Endpoints Overview:

**Authentication:**
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/get-profile` - Lấy thông tin user

**Users:**
- `GET /api/v1/users` - Danh sách users
- `GET /api/v1/users/:id` - Chi tiết user
- `PUT /api/v1/users/:id` - Cập nhật user
- `DELETE /api/v1/users/:id` - Xóa user (soft delete)

**Bookings:**
- `GET /api/v1/bookings` - Danh sách bookings
- `POST /api/v1/bookings` - Tạo booking
- `GET /api/v1/bookings/:id` - Chi tiết booking
- `PUT /api/v1/bookings/:id` - Cập nhật booking
- `DELETE /api/v1/bookings/:id` - Hủy booking

**Group Bookings:**
- `GET /api/v1/groupBookings` - Danh sách group bookings
- `POST /api/v1/groupBookings` - Tạo group booking
- `PUT /api/v1/groupBookings/:id` - Cập nhật group booking
- `POST /api/v1/groupBookings/:id/approve` - Duyệt group booking
- `POST /api/v1/groupBookings/:id/quote` - Tạo báo giá

**Payments:**
- `GET /api/v1/payments` - Danh sách payments
- `POST /api/v1/payments` - Tạo payment
- `GET /api/v1/payments/:id` - Chi tiết payment
- `PUT /api/v1/payments/:id` - Cập nhật payment

**Rooms:**
- `GET /api/v1/rooms` - Danh sách rooms
- `POST /api/v1/rooms` - Tạo room
- `GET /api/v1/rooms/:id` - Chi tiết room
- `PUT /api/v1/rooms/:id` - Cập nhật room

**...và nhiều endpoints khác**

---

## 🚀 DEPLOYMENT CONSIDERATIONS

### Environment Variables Required:

**Backend:**
- `PORT`, `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`

**Frontend:**
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`
- `GROQ_API_KEY` - Groq AI API key

### Recommended Setup:
- MongoDB Atlas (cloud database)
- Vercel/Netlify (Frontend hosting)
- Railway/Heroku/Render (Backend hosting)
- Stripe account (production keys)

---

## 📈 FUTURE ENHANCEMENTS

Potential improvements:
1. Mobile app (React Native)
2. Advanced analytics dashboard
3. Multi-language support (i18n)
4. Advanced search với filters
5. Recommendation engine
6. Loyalty program
7. Inventory management
8. Staff scheduling
9. Financial reporting
10. Automated email campaigns

---

## 🎯 KẾT LUẬN

Hệ thống Miko Hotel là một hệ thống quản lý khách sạn hoàn chỉnh với:
- ✅ Architecture rõ ràng và scalable
- ✅ Full-stack TypeScript
- ✅ Modern UI/UX
- ✅ Real-time features
- ✅ Payment integration
- ✅ Comprehensive business logic
- ✅ Security best practices

Hệ thống sẵn sàng cho production với các tính năng cơ bản đã được triển khai đầy đủ.

