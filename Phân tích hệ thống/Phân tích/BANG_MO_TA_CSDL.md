# 📊 BẢNG MÔ TẢ CƠ SỞ DỮ LIỆU - HỆ THỐNG MIKO HOTEL

## Bảng danh sách các Collections

| TT | Tên bảng (Collection) | Mô tả |
|----|----------------------|-------|
| 1 | **users** | Lưu trữ thông tin người dùng (khách hàng, nhân viên, quản trị viên) bao gồm đăng nhập, xác thực email, reset mật khẩu và quản lý trạng thái tài khoản. |
| 2 | **locations** | Lưu trữ thông tin địa điểm du lịch xung quanh khách sạn với tọa độ địa lý, hình ảnh và tiện ích. |
| 3 | **roomtypes** | Định nghĩa các loại phòng với giá cả, sức chứa, tiện ích và hình ảnh. |
| 4 | **rooms** | Lưu trữ thông tin từng phòng cụ thể với số phòng duy nhất, loại phòng và trạng thái. |
| 5 | **bookings** | Lưu trữ thông tin đặt phòng cá nhân bao gồm khách hàng, danh sách khách, phòng, ngày check-in/check-out, dịch vụ và trạng thái. |
| 6 | **groupbookings** | Lưu trữ thông tin đặt phòng nhóm với quy trình duyệt, danh sách thành viên, báo giá, thanh toán và hoàn tiền. |
| 7 | **services** | Lưu trữ danh mục dịch vụ khách sạn (spa, nhà hàng, gym) với giá cả, danh mục và trạng thái. |
| 8 | **servicebookings** | Lưu trữ thông tin đặt dịch vụ kèm theo booking với số lượng, tổng giá và ngày đặt. |
| 9 | **invoices** | Lưu trữ hóa đơn cho booking hoặc group booking với tổng số tiền, số tiền đã thanh toán và trạng thái. |
| 10 | **payments** | Lưu trữ thông tin thanh toán với nhiều phương thức (Stripe, tiền mặt, chuyển khoản) và thông tin nhúng về ngân hàng, tiền mặt, hoàn tiền. |
| 11 | **bookingstatuses** | Lưu trữ lịch sử thay đổi trạng thái booking với thông tin người thay đổi và ghi chú. |
| 12 | **reviews** | Lưu trữ đánh giá của khách hàng về phòng với điểm đánh giá (1-5), bình luận, hình ảnh và trạng thái duyệt. |
| 13 | **conversations** | Lưu trữ thông tin cuộc trò chuyện giữa khách hàng và nhân viên với danh sách người tham gia, tin nhắn cuối và số tin nhắn chưa đọc. |
| 14 | **messages** | Lưu trữ tin nhắn trong cuộc trò chuyện với nội dung, loại tin nhắn, tệp đính kèm và danh sách người đã đọc. |
| 15 | **notifications** | Lưu trữ thông báo cho người dùng về các sự kiện trong hệ thống với tham chiếu đa hình và trạng thái đã đọc. |

---



### Chú thích mối quan hệ:

- **users** → **bookings**: Một người dùng có thể tạo nhiều đặt phòng
- **users** → **groupbookings**: Một người dùng có thể tạo nhiều đặt phòng nhóm
- **users** → **reviews**: Một người dùng có thể viết nhiều đánh giá
- **users** → **conversations/messages**: Người dùng tham gia cuộc trò chuyện
- **roomtypes** → **rooms**: Một loại phòng có nhiều phòng cụ thể
- **rooms** → **bookings**: Một phòng có thể được đặt nhiều lần
- **bookings** → **servicebookings**: Một đặt phòng có thể kèm nhiều dịch vụ
- **bookings** → **invoices**: Một đặt phòng có một hóa đơn
- **groupbookings** → **invoices**: Một đặt phòng nhóm có một hóa đơn
- **invoices** → **payments**: Một hóa đơn có thể có nhiều thanh toán
- **conversations** → **messages**: Một cuộc trò chuyện có nhiều tin nhắn
- **notifications**: Tham chiếu đa hình đến bookings, groupbookings, invoices

---

## Chi tiết cấu trúc các Collections

### 1. Collection: **users**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | fullName | String | 100 | NO | - | - | trim, required, min: 2, max: 100 | Họ và tên người dùng |
| 3 | email | String | 100 | NO | Unique | - | unique, lowercase, email format, max: 100 | Email đăng nhập (duy nhất) |
| 4 | password | String | 255 | NO | - | - | minlength: 6, max: 255, hashed | Mật khẩu đã mã hóa |
| 5 | phoneNumber | String | 13 | NO | - | - | required, VN phone format | Số điện thoại Việt Nam (0xxx hoặc +84xxx) |
| 6 | dateOfBirth | Date | - | YES | - | - | - | Ngày sinh |
| 7 | role | String | 20 | NO | - | - | enum: customer/staff/admin | Vai trò người dùng |
| 8 | status | String | 20 | NO | - | - | enum: active/blocked | Trạng thái tài khoản |
| 9 | preferences | Array | - | NO | - | - | Array of strings | Sở thích người dùng |
| 10 | emailVerified | Boolean | - | NO | - | - | - | Email đã xác thực |
| 11 | emailVerificationToken | String | 255 | YES | - | - | - | Token xác thực email |
| 12 | emailVerificationTokenExpires | Date | - | YES | - | - | - | Thời hạn token xác thực |
| 13 | passwordResetOTP | String | 10 | YES | - | - | - | OTP reset mật khẩu (6-10 ký tự) |
| 14 | passwordResetOTPExpires | Date | - | YES | - | - | - | Thời hạn OTP |
| 15 | deletedAt | Date | - | YES | - | - | - | Soft delete timestamp |
| 16 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 17 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 2. Collection: **locations**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | name | String | 200 | NO | - | - | required, trim | Tên địa điểm |
| 3 | type | String | 50 | NO | - | - | enum: tham_quan/an_uong/... | Loại địa điểm |
| 4 | description | String | 1000 | YES | - | - | trim | Mô tả địa điểm |
| 5 | address | String | 500 | YES | - | - | trim | Địa chỉ |
| 6 | images | Array | - | NO | - | - | Array of URLs | Danh sách hình ảnh |
| 7 | ratingAvg | Number | - | NO | - | - | min: 0, max: 5 | Điểm đánh giá trung bình |
| 8 | status | String | 20 | NO | - | - | enum: active/hidden/deleted | Trạng thái |
| 9 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 10 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 3. Collection: **roomtypes**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | name | String | 100 | NO | - | - | required, trim, min: 2, max: 100 | Tên loại phòng |
| 3 | description | String | 1000 | NO | - | - | required, trim | Mô tả loại phòng |
| 4 | pricePerNight | Number | - | NO | - | - | required, min: 0 | Giá mỗi đêm |
| 5 | extraHourPrice | Number | - | NO | - | - | required, min: 0 | Giá phụ thu mỗi giờ |
| 6 | maxExtendHours | Number | - | NO | - | - | required, min: 1 | Số giờ tối đa được gia hạn |
| 7 | capacity | Number | - | NO | - | - | required, min: 1 | Sức chứa tối đa |
| 8 | amenities | Array | - | NO | - | - | Array of strings | Tiện ích |
| 9 | images | Array | - | NO | - | - | Array of URLs | Danh sách hình ảnh |
| 10 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 11 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 4. Collection: **rooms**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | roomNumber | String | 10 | NO | Unique | - | required, trim, unique | Số phòng (duy nhất, ví dụ: 101, A201) |
| 3 | typeId | ObjectId | - | NO | - | roomtypes._id | required, ref: RoomType | Tham chiếu loại phòng |
| 4 | status | String | 20 | NO | - | - | enum: available/booked/maintenance/checked_in/occupied/unavailable | Trạng thái phòng |
| 5 | amenities | Array | - | NO | - | - | Array of strings | Tiện ích phòng |
| 6 | images | Array | - | NO | - | - | Array of URLs | Danh sách hình ảnh |
| 7 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 8 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 5. Collection: **bookings**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | customerId | ObjectId | - | YES | - | users._id | ref: User | Tham chiếu khách hàng (có thể null cho walk-in) |
| 3 | guests | Array | - | NO | - | - | Embedded documents | Danh sách khách (fullName: 100, idNumber: 12, dateOfBirth, phoneNumber: 13, email: 100, isMainGuest) |
| 4 | guestCount | Number | - | NO | - | - | required, min: 1, max: 10, validate: match guests.length | Số lượng khách (tối đa 10) |
| 5 | roomId | ObjectId | - | NO | - | rooms._id | required, ref: Room | Tham chiếu phòng |
| 6 | checkIn | Date | - | NO | - | - | required | Ngày nhận phòng |
| 7 | checkOut | Date | - | NO | - | - | required | Ngày trả phòng |
| 8 | services | Array | - | NO | - | - | Embedded documents | Danh sách dịch vụ (serviceId, name, price, quantity) |
| 9 | source | String | 20 | NO | - | - | enum: online/walk_in | Nguồn đặt phòng |
| 10 | totalPrice | Number | - | NO | - | - | required, min: 0 | Tổng tiền (VND) |
| 11 | paidAmount | Number | - | NO | - | - | min: 0 | Số tiền đã thanh toán (VND) |
| 12 | remainingAmount | Number | - | NO | - | - | min: 0 | Số tiền còn lại (VND) |
| 13 | paymentStatus | String | 30 | NO | - | - | enum: pending/partial_paid/paid/failed/refunded/refund_requested/cancelled | Trạng thái thanh toán |
| 14 | notes | String | 500 | YES | - | - | trim, max: 500 | Ghi chú |
| 15 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 16 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 6. Collection: **groupbookings**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | requesterId | ObjectId | - | YES | - | users._id | ref: User | Tham chiếu người yêu cầu |
| 3 | requesterName | String | 100 | NO | - | - | required, min: 2, max: 100 | Tên người yêu cầu |
| 4 | requesterPhone | String | 13 | NO | - | - | required, VN phone format | SĐT người yêu cầu |
| 5 | requesterEmail | String | 100 | NO | - | - | required, email format | Email người yêu cầu |
| 6 | checkIn | Date | - | NO | - | - | required | Ngày nhận phòng |
| 7 | checkOut | Date | - | NO | - | - | required | Ngày trả phòng |
| 8 | peopleCount | Number | - | NO | - | - | required, min: 1 | Số lượng người |
| 9 | roomCount | Number | - | NO | - | - | required, min: 1 | Số lượng phòng |
| 10 | notes | String | 500 | YES | - | - | max: 500 | Ghi chú |
| 11 | status | String | 30 | NO | - | - | enum: pending_approval/approved/info_uploaded/quoted/awaiting_payment/deposit_paid/paid/confirmed/refund_requested/refunded/cancelled/rejected | Trạng thái đặt phòng nhóm |
| 12 | allocatedRoomIds | Array | - | NO | - | rooms._id | Array of ObjectId, ref: Room | Danh sách phòng được phân bổ |
| 13 | members | Array | - | NO | - | - | Embedded documents | Danh sách thành viên (fullName, idNumber, dateOfBirth, phoneNumber, email, isLeader, roomNumber) |
| 14 | quoteAmount | Number | - | YES | - | - | min: 0 | Số tiền báo giá |
| 15 | paymentLink | String | 500 | YES | - | - | URL format | Link thanh toán |
| 16 | paidAmount | Number | - | NO | - | - | min: 0 | Số tiền đã thanh toán |
| 17 | remainingAmount | Number | - | NO | - | - | min: 0 | Số tiền còn lại |
| 18 | refundRequestedAt | Date | - | YES | - | - | - | Ngày yêu cầu hoàn tiền |
| 19 | refundProcessedAt | Date | - | YES | - | - | - | Ngày xử lý hoàn tiền |
| 20 | refundAmount | Number | - | YES | - | - | min: 0 | Số tiền hoàn |
| 21 | rejectedAt | Date | - | YES | - | - | - | Ngày từ chối |
| 22 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 23 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 7. Collection: **services**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | name | String | 100 | NO | - | - | required, trim, min: 2, max: 100 | Tên dịch vụ |
| 3 | description | String | 500 | NO | - | - | required, trim, min: 10, max: 500 | Mô tả dịch vụ |
| 4 | basePrice | Number | - | NO | - | - | required, min: 0 | Giá cơ bản |
| 5 | workingHours | Object | - | NO | - | - | Embedded: {startTime: 5, endTime: 5} | Giờ làm việc (HH:MM format, 5 ký tự) |
| 6 | slots | Array | - | NO | - | - | Array of strings | Các khung giờ |
| 7 | images | Array | - | NO | - | - | Array of URLs | Danh sách hình ảnh |
| 8 | status | String | 20 | NO | - | - | enum: active/hidden/deleted | Trạng thái dịch vụ |
| 9 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 10 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 8. Collection: **servicebookings**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | bookingId | ObjectId | - | YES | - | bookings._id | ref: Booking | Tham chiếu đặt phòng (có thể null) |
| 3 | serviceId | ObjectId | - | NO | - | services._id | required, ref: Service | Tham chiếu dịch vụ |
| 4 | customerId | ObjectId | - | YES | - | users._id | ref: User | Tham chiếu khách hàng |
| 5 | guestName | String | 100 | YES | - | - | trim, min: 2, max: 100 | Tên khách (nếu không có customerId) |
| 6 | phoneNumber | String | 13 | YES | - | - | trim, VN phone format | SĐT khách |
| 7 | scheduledAt | Date | - | NO | - | - | required | Thời gian thực hiện dịch vụ |
| 8 | quantity | Number | - | NO | - | - | min: 1 | Số lượng |
| 9 | price | Number | - | NO | - | - | required, min: 0 | Giá dịch vụ |
| 10 | status | String | 20 | NO | - | - | enum: reserved/completed/cancelled | Trạng thái đặt dịch vụ |
| 11 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 12 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 9. Collection: **invoices**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | bookingId | ObjectId | - | YES | - | bookings._id | ref: Booking | Tham chiếu đặt phòng (một trong hai: bookingId hoặc groupBookingId) |
| 3 | groupBookingId | ObjectId | - | YES | - | groupbookings._id | ref: GroupBooking | Tham chiếu đặt phòng nhóm |
| 4 | customerId | ObjectId | - | YES | - | users._id | ref: User | Tham chiếu khách hàng |
| 5 | totalAmount | Number | - | NO | - | - | required, min: 0 | Tổng số tiền hóa đơn |
| 6 | paidAmount | Number | - | NO | - | - | min: 0 | Số tiền đã thanh toán |
| 7 | remainingAmount | Number | - | NO | - | - | min: 0 | Số tiền còn lại |
| 8 | paymentStatus | String | 30 | NO | - | - | enum: pending/partial_paid/paid/failed/refunded/refund_requested/cancelled | Trạng thái thanh toán |
| 9 | status | String | 20 | NO | - | - | enum: pending/paid/failed/refunded | Trạng thái hóa đơn |
| 10 | issuedAt | Date | - | NO | - | - | - | Ngày phát hành |
| 11 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 12 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 10. Collection: **payments**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | bookingId | ObjectId | - | YES | - | bookings._id | ref: Booking | Tham chiếu đặt phòng (một trong hai) |
| 3 | groupBookingId | ObjectId | - | YES | - | groupbookings._id | ref: GroupBooking | Tham chiếu đặt phòng nhóm |
| 4 | customerId | ObjectId | - | YES | - | users._id | ref: User | Tham chiếu khách hàng |
| 5 | paymentMethod | String | 20 | NO | - | - | required, enum: stripe/cash/bank_transfer/other | Phương thức thanh toán |
| 6 | amount | Number | - | NO | - | - | required, min: 0 | Số tiền thanh toán (VND) |
| 7 | currency | String | 3 | NO | - | - | - | Đơn vị tiền tệ (VND, USD, ...) |
| 8 | status | String | 20 | NO | - | - | enum: pending/completed/failed/cancelled/refunded | Trạng thái thanh toán |
| 9 | stripeSessionId | String | 100 | YES | - | - | required if paymentMethod=stripe | ID session Stripe |
| 10 | stripePaymentIntentId | String | 100 | YES | - | - | - | ID payment intent Stripe |
| 11 | stripeCustomerId | String | 100 | YES | - | - | - | ID khách hàng Stripe |
| 12 | transactionId | String | 100 | YES | Unique | - | unique, sparse | Mã giao dịch (duy nhất khi có giá trị) |
| 13 | bankInfo | Object | - | YES | - | - | Embedded: {bankName: 100, accountNumber: 50, transactionCode: 50} | Thông tin chuyển khoản |
| 14 | cashInfo | Object | - | YES | - | - | Embedded: {receivedBy: 100, receivedAt, notes: 500} | Thông tin tiền mặt |
| 15 | refundInfo | Object | - | YES | - | - | Embedded: {refundAmount, refundReason: 500, refundedAt, refundedBy: 100} | Thông tin hoàn tiền |
| 16 | metadata | Map | - | YES | - | - | Map of Mixed | Metadata bổ sung |
| 17 | notes | String | 500 | YES | - | - | trim, max: 500 | Ghi chú |
| 18 | paidAt | Date | - | YES | - | - | - | Thời gian thanh toán |
| 19 | expiresAt | Date | - | YES | - | - | - | Thời gian hết hạn |
| 20 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 21 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 11. Collection: **bookingstatuses** (BookingStatusLog)

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | bookingId | ObjectId | - | NO | - | bookings._id | required, ref: Booking | Tham chiếu đặt phòng |
| 3 | actorId | ObjectId | - | YES | - | users._id | ref: User | Tham chiếu người thực hiện (có thể null) |
| 4 | actorName | String | 100 | YES | - | - | trim | Tên người thực hiện (admin/staff hoặc tên user) |
| 5 | action | String | 50 | NO | - | - | required, enum: pending/confirmed/cancelled/checked_in/checked_out/extend/extend_check_out/paid/failed/refunded/refund_requested | Hành động/thay đổi trạng thái |
| 6 | note | String | 500 | YES | - | - | trim, max: 500 | Ghi chú |
| 7 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 8 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 12. Collection: **reviews**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | reviewerId | ObjectId | - | NO | - | users._id | required, ref: User | Tham chiếu người đánh giá |
| 3 | targetType | String | 20 | NO | - | - | required, enum: room/service/location | Loại đối tượng được đánh giá |
| 4 | targetId | ObjectId | - | NO | - | - | required | ID đối tượng được đánh giá (room/service/location) |
| 5 | rating | Number | - | NO | - | - | required, min: 1, max: 5 | Điểm đánh giá (1-5 sao) |
| 6 | comment | String | 2000 | YES | - | - | trim | Bình luận |
| 7 | status | String | 20 | NO | - | - | enum: active/hidden/deleted | Trạng thái đánh giá |
| 8 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 9 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 13. Collection: **conversations**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | participants | Array | - | NO | - | users._id | Embedded documents | Danh sách người tham gia [{userId, role, lastReadAt}] |
| 3 | lastMessage | ObjectId | - | YES | - | messages._id | ref: Message | Tham chiếu tin nhắn cuối |
| 4 | lastMessageAt | Date | - | NO | - | - | - | Thời gian tin nhắn cuối |
| 5 | status | String | 20 | NO | - | - | enum: active/archived/deleted | Trạng thái cuộc trò chuyện |
| 6 | unreadCount | Map | - | NO | - | - | Map of Number | Số tin nhắn chưa đọc theo userId |
| 7 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 8 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 14. Collection: **messages**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | conversationId | ObjectId | - | NO | Index | conversations._id | required, ref: Conversation | Tham chiếu cuộc trò chuyện |
| 3 | senderId | ObjectId | - | NO | Index | users._id | required, ref: User | Tham chiếu người gửi |
| 4 | content | String | 10000 | NO | - | - | required, trim | Nội dung tin nhắn |
| 5 | messageType | String | 20 | NO | - | - | enum: text/image/file/system | Loại tin nhắn |
| 6 | attachments | Array | - | NO | - | - | Embedded documents | Tệp đính kèm [{url: 500, type: 50, name: 255, size}] |
| 7 | status | String | 20 | NO | Index | - | enum: sent/delivered/read/deleted | Trạng thái tin nhắn |
| 8 | readBy | Array | - | NO | - | users._id | Embedded documents | Danh sách người đã đọc [{userId, readAt}] |
| 9 | replyTo | ObjectId | - | YES | - | messages._id | ref: Message | Tham chiếu tin nhắn được reply |
| 10 | createdAt | DateTime | - | NO | - | - | timestamps | Ngày tạo |
| 11 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

### 15. Collection: **notifications**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | IDENTITY | Khóa chính tự động |
| 2 | type | String | 50 | NO | - | - | required, enum: new_booking/booking_updated/payment_received/booking_cancelled/booking_paid/booking_refunded/booking_refund_requested/group_booking_approved/group_booking_quoted/group_booking_paid/group_booking_confirmed/group_booking_refund_requested/group_booking_refunded/other | Loại thông báo |
| 3 | title | String | 200 | NO | - | - | required, trim | Tiêu đề thông báo |
| 4 | message | String | 1000 | NO | - | - | required, trim | Nội dung thông báo |
| 5 | bookingId | ObjectId | - | YES | Index | bookings._id | ref: Booking | Tham chiếu đặt phòng |
| 6 | userId | ObjectId | - | YES | Index | users._id | ref: User | Tham chiếu người dùng |
| 7 | bookingData | Object | - | YES | - | - | Embedded document | Thông tin booking nhúng để hiển thị nhanh |
| 8 | recipients | Array | - | NO | Index | users._id | Embedded documents | Danh sách người nhận [{userId, role, read, readAt}] |
| 9 | status | String | 20 | NO | Index | - | enum: active/archived/deleted | Trạng thái thông báo |
| 10 | metadata | Mixed | - | YES | - | - | Schema.Types.Mixed | Metadata bổ sung |
| 11 | createdAt | DateTime | - | NO | Index | - | timestamps | Ngày tạo |
| 12 | updatedAt | DateTime | - | NO | - | - | timestamps | Ngày cập nhật |

---

## Tổng kết

- **Tổng số collections:** 15
- **Database:** MongoDB (NoSQL Document Database)
- **Mô hình:** Document Model (Mô hình tài liệu)
- **ODM:** Mongoose

### Phân loại theo chức năng:

**Quản lý Người dùng:**
- users

**Quản lý Địa điểm:**
- locations

**Quản lý Phòng:**
- roomtypes
- rooms

**Quản lý Đặt phòng:**
- bookings
- groupbookings

**Quản lý Dịch vụ:**
- services
- servicebookings

**Quản lý Thanh toán:**
- invoices
- payments

**Quản lý Đánh giá:**
- bookingstatuses
- reviews

**Quản lý Chat:**
- conversations
- messages

**Quản lý Thông báo:**
- notifications

---

*Bảng mô tả này cung cấp tổng quan về cấu trúc cơ sở dữ liệu của hệ thống Miko Hotel sử dụng MongoDB Document Model.*

