# 📊 PHÂN TÍCH TOÀN BỘ HỆ THỐNG MIKO HOTEL

## 🎯 TỔNG QUAN

Hệ thống quản lý khách sạn **Miko Hotel** là một hệ thống quản lý khách sạn toàn diện với 3 thành phần chính:
1. **Backend API** - Xử lý logic nghiệp vụ và API
2. **Admin Panel** - Giao diện quản trị cho admin/staff
3. **Customer Frontend** - Website đặt phòng cho khách hàng

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### 1. Backend API (Node.js + Express + MongoDB)

**Công nghệ:**
- **Runtime:** Node.js
- **Framework:** Express 5.1.0
- **Database:** MongoDB (Mongoose 8.18.1)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Real-time:** Socket.IO 4.8.1 + Stream Chat 9.20.1
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
- `STREAM_API_KEY` - Stream Chat API key
- `STREAM_API_SECRET` - Stream Chat secret
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
- **Real-time:** Socket.IO Client 4.8.1, Stream Chat React 13.7.0
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
- **Real-time:** Socket.IO Client 4.8.1, Stream Chat React 13.7.0
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
Get Stream Chat token from backend
    ↓
Connect to Stream Chat
    ↓
Create/Get 1-1 channel with staff
    ↓
Real-time messaging via Stream Chat
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
- WebSocket server cho real-time notifications
- User connection tracking
- Room-based messaging
- Broadcast messages
- Connection status monitoring

### Stream Chat
- Chat UI component
- 1-1 conversations
- Message history
- Real-time message delivery
- User presence

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
- `STREAM_API_KEY`, `STREAM_API_SECRET`
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`

**Frontend:**
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`

### Recommended Setup:
- MongoDB Atlas (cloud database)
- Vercel/Netlify (Frontend hosting)
- Railway/Heroku/Render (Backend hosting)
- Stripe account (production keys)
- Stream Chat account

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

