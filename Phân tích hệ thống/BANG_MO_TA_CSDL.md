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

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | fullName | String | - | NO | - | - | - | trim, required | Họ và tên người dùng |
| 3 | email | String | - | NO | Unique | - | - | unique, lowercase, email format | Email đăng nhập (duy nhất) |
| 4 | password | String | - | NO | - | - | - | minlength: 6, hashed | Mật khẩu đã mã hóa |
| 5 | phoneNumber | String | - | NO | - | - | - | required, VN phone format | Số điện thoại Việt Nam |
| 6 | dateOfBirth | Date | - | YES | - | - | NULL | - | Ngày sinh |
| 7 | role | String | - | NO | - | - | 'customer' | enum: customer/staff/admin | Vai trò người dùng |
| 8 | status | String | - | NO | - | - | 'active' | enum: active/blocked | Trạng thái tài khoản |
| 9 | preferences | Array | - | NO | - | - | ['tham quan',...] | Array of strings | Sở thích người dùng |
| 10 | emailVerified | Boolean | - | NO | - | - | false | - | Email đã xác thực |
| 11 | emailVerificationToken | String | - | YES | - | - | NULL | - | Token xác thực email |
| 12 | emailVerificationTokenExpires | Date | - | YES | - | - | NULL | - | Thời hạn token xác thực |
| 13 | passwordResetOTP | String | - | YES | - | - | NULL | - | OTP reset mật khẩu |
| 14 | passwordResetOTPExpires | Date | - | YES | - | - | NULL | - | Thời hạn OTP |
| 15 | deletedAt | Date | - | YES | - | - | NULL | - | Soft delete timestamp |
| 16 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 17 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 2. Collection: **locations**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | name | String | - | NO | - | - | - | required, trim | Tên địa điểm |
| 3 | type | String | - | NO | - | - | - | enum: tham_quan/an_uong/... | Loại địa điểm |
| 4 | description | String | - | YES | - | - | NULL | trim | Mô tả địa điểm |
| 5 | address | String | - | YES | - | - | NULL | trim | Địa chỉ |
| 6 | images | Array | - | NO | - | - | [] | Array of URLs | Danh sách hình ảnh |
| 7 | ratingAvg | Number | - | NO | - | - | 0 | min: 0, max: 5 | Điểm đánh giá trung bình |
| 8 | status | String | - | NO | - | - | 'active' | enum: active/hidden/deleted | Trạng thái |
| 9 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 10 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 3. Collection: **roomtypes**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | name | String | - | NO | - | - | - | required, trim | Tên loại phòng |
| 3 | description | String | - | NO | - | - | - | required, trim | Mô tả loại phòng |
| 4 | pricePerNight | Number | - | NO | - | - | - | required, min: 0 | Giá mỗi đêm |
| 5 | extraHourPrice | Number | - | NO | - | - | 100000 | required, min: 0 | Giá phụ thu mỗi giờ |
| 6 | maxExtendHours | Number | - | NO | - | - | 6 | required, min: 1 | Số giờ tối đa được gia hạn |
| 7 | capacity | Number | - | NO | - | - | - | required, min: 1 | Sức chứa tối đa |
| 8 | amenities | Array | - | NO | - | - | ['wifi',...] | Array of strings | Tiện ích |
| 9 | images | Array | - | NO | - | - | [] | Array of URLs | Danh sách hình ảnh |
| 10 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 11 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 4. Collection: **rooms**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | roomNumber | String | - | NO | Unique | - | - | required, trim, unique | Số phòng (duy nhất) |
| 3 | typeId | ObjectId | - | NO | - | roomtypes._id | - | required, ref: RoomType | Tham chiếu loại phòng |
| 4 | status | String | - | NO | - | - | 'available' | enum: available/booked/maintenance/checked_in/occupied/unavailable | Trạng thái phòng |
| 5 | amenities | Array | - | NO | - | - | ['wifi',...] | Array of strings | Tiện ích phòng |
| 6 | images | Array | - | NO | - | - | [] | Array of URLs | Danh sách hình ảnh |
| 7 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 8 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 5. Collection: **bookings**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | customerId | ObjectId | - | YES | - | users._id | NULL | ref: User | Tham chiếu khách hàng (có thể null cho walk-in) |
| 3 | guests | Array | - | NO | - | - | - | Embedded documents | Danh sách khách (fullName, idNumber, dateOfBirth, phoneNumber, email, isMainGuest) |
| 4 | guestCount | Number | - | NO | - | - | - | required, min: 1, validate: match guests.length | Số lượng khách |
| 5 | roomId | ObjectId | - | NO | - | rooms._id | - | required, ref: Room | Tham chiếu phòng |
| 6 | checkIn | Date | - | NO | - | - | - | required | Ngày nhận phòng |
| 7 | checkOut | Date | - | NO | - | - | - | required | Ngày trả phòng |
| 8 | services | Array | - | NO | - | - | [] | Embedded documents | Danh sách dịch vụ (serviceId, name, price, quantity) |
| 9 | source | String | - | NO | - | - | 'walk_in' | enum: online/walk_in | Nguồn đặt phòng |
| 10 | totalPrice | Number | - | NO | - | - | - | required, min: 0 | Tổng tiền |
| 11 | paidAmount | Number | - | NO | - | - | 0 | min: 0 | Số tiền đã thanh toán |
| 12 | remainingAmount | Number | - | NO | - | - | 0 | min: 0 | Số tiền còn lại |
| 13 | paymentStatus | String | - | NO | - | - | 'pending' | enum: pending/partial_paid/paid/failed/refunded/refund_requested/cancelled | Trạng thái thanh toán |
| 14 | notes | String | - | YES | - | - | NULL | trim | Ghi chú |
| 15 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 16 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 6. Collection: **groupbookings**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | requesterId | ObjectId | - | YES | - | users._id | NULL | ref: User | Tham chiếu người yêu cầu |
| 3 | requesterName | String | - | NO | - | - | - | required | Tên người yêu cầu |
| 4 | requesterPhone | String | - | NO | - | - | - | required | SĐT người yêu cầu |
| 5 | requesterEmail | String | - | NO | - | - | - | required | Email người yêu cầu |
| 6 | checkIn | Date | - | NO | - | - | - | required | Ngày nhận phòng |
| 7 | checkOut | Date | - | NO | - | - | - | required | Ngày trả phòng |
| 8 | peopleCount | Number | - | NO | - | - | - | required, min: 1 | Số lượng người |
| 9 | roomCount | Number | - | NO | - | - | - | required, min: 1 | Số lượng phòng |
| 10 | notes | String | - | YES | - | - | NULL | - | Ghi chú |
| 11 | status | String | - | NO | - | - | 'pending_approval' | enum: pending_approval/approved/info_uploaded/quoted/awaiting_payment/deposit_paid/paid/confirmed/refund_requested/refunded/cancelled/rejected | Trạng thái đặt phòng nhóm |
| 12 | allocatedRoomIds | Array | - | NO | - | rooms._id | [] | Array of ObjectId, ref: Room | Danh sách phòng được phân bổ |
| 13 | members | Array | - | NO | - | - | [] | Embedded documents | Danh sách thành viên (fullName, idNumber, dateOfBirth, phoneNumber, email, isLeader, roomNumber) |
| 14 | quoteAmount | Number | - | YES | - | - | NULL | min: 0 | Số tiền báo giá |
| 15 | paymentLink | String | - | YES | - | - | NULL | - | Link thanh toán |
| 16 | paidAmount | Number | - | NO | - | - | 0 | min: 0 | Số tiền đã thanh toán |
| 17 | remainingAmount | Number | - | NO | - | - | 0 | min: 0 | Số tiền còn lại |
| 18 | refundRequestedAt | Date | - | YES | - | - | NULL | - | Ngày yêu cầu hoàn tiền |
| 19 | refundProcessedAt | Date | - | YES | - | - | NULL | - | Ngày xử lý hoàn tiền |
| 20 | refundAmount | Number | - | YES | - | - | NULL | min: 0 | Số tiền hoàn |
| 21 | rejectedAt | Date | - | YES | - | - | NULL | - | Ngày từ chối |
| 22 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 23 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 7. Collection: **services**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | name | String | - | NO | - | - | - | required, trim | Tên dịch vụ |
| 3 | description | String | - | NO | - | - | - | required, trim | Mô tả dịch vụ |
| 4 | basePrice | Number | - | NO | - | - | - | required, min: 0 | Giá cơ bản |
| 5 | workingHours | Object | - | NO | - | - | - | Embedded: {startTime, endTime} | Giờ làm việc (HH:MM format) |
| 6 | slots | Array | - | NO | - | - | [] | Array of strings | Các khung giờ |
| 7 | images | Array | - | NO | - | - | [] | Array of URLs | Danh sách hình ảnh |
| 8 | status | String | - | NO | - | - | 'active' | enum: active/hidden/deleted | Trạng thái dịch vụ |
| 9 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 10 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 8. Collection: **servicebookings**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | bookingId | ObjectId | - | YES | - | bookings._id | NULL | ref: Booking | Tham chiếu đặt phòng (có thể null) |
| 3 | serviceId | ObjectId | - | NO | - | services._id | - | required, ref: Service | Tham chiếu dịch vụ |
| 4 | customerId | ObjectId | - | YES | - | users._id | NULL | ref: User | Tham chiếu khách hàng |
| 5 | guestName | String | - | YES | - | - | NULL | trim | Tên khách (nếu không có customerId) |
| 6 | phoneNumber | String | - | YES | - | - | NULL | trim | SĐT khách |
| 7 | scheduledAt | Date | - | NO | - | - | - | required | Thời gian thực hiện dịch vụ |
| 8 | quantity | Number | - | NO | - | - | 1 | min: 1 | Số lượng |
| 9 | price | Number | - | NO | - | - | - | required, min: 0 | Giá dịch vụ |
| 10 | status | String | - | NO | - | - | 'reserved' | enum: reserved/completed/cancelled | Trạng thái đặt dịch vụ |
| 11 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 12 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 9. Collection: **invoices**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | bookingId | ObjectId | - | YES | - | bookings._id | NULL | ref: Booking | Tham chiếu đặt phòng (một trong hai: bookingId hoặc groupBookingId) |
| 3 | groupBookingId | ObjectId | - | YES | - | groupbookings._id | NULL | ref: GroupBooking | Tham chiếu đặt phòng nhóm |
| 4 | customerId | ObjectId | - | YES | - | users._id | NULL | ref: User | Tham chiếu khách hàng |
| 5 | totalAmount | Number | - | NO | - | - | - | required, min: 0 | Tổng số tiền hóa đơn |
| 6 | paidAmount | Number | - | NO | - | - | 0 | min: 0 | Số tiền đã thanh toán |
| 7 | remainingAmount | Number | - | NO | - | - | 0 | min: 0 | Số tiền còn lại |
| 8 | paymentStatus | String | - | NO | - | - | 'pending' | enum: pending/partial_paid/paid/failed/refunded/refund_requested/cancelled | Trạng thái thanh toán |
| 9 | status | String | - | NO | - | - | 'pending' | enum: pending/paid/failed/refunded | Trạng thái hóa đơn |
| 10 | issuedAt | Date | - | NO | - | - | Date.now | - | Ngày phát hành |
| 11 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 12 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 10. Collection: **payments**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | bookingId | ObjectId | - | YES | - | bookings._id | NULL | ref: Booking | Tham chiếu đặt phòng (một trong hai) |
| 3 | groupBookingId | ObjectId | - | YES | - | groupbookings._id | NULL | ref: GroupBooking | Tham chiếu đặt phòng nhóm |
| 4 | customerId | ObjectId | - | YES | - | users._id | NULL | ref: User | Tham chiếu khách hàng |
| 5 | paymentMethod | String | - | NO | - | - | - | required, enum: stripe/cash/bank_transfer/other | Phương thức thanh toán |
| 6 | amount | Number | - | NO | - | - | - | required, min: 0 | Số tiền thanh toán |
| 7 | currency | String | - | NO | - | - | 'VND' | - | Đơn vị tiền tệ |
| 8 | status | String | - | NO | - | - | 'pending' | enum: pending/completed/failed/cancelled/refunded | Trạng thái thanh toán |
| 9 | stripeSessionId | String | - | YES | - | - | NULL | required if paymentMethod=stripe | ID session Stripe |
| 10 | stripePaymentIntentId | String | - | YES | - | - | NULL | - | ID payment intent Stripe |
| 11 | stripeCustomerId | String | - | YES | - | - | NULL | - | ID khách hàng Stripe |
| 12 | transactionId | String | - | YES | Unique | - | NULL | unique, sparse | Mã giao dịch (duy nhất khi có giá trị) |
| 13 | bankInfo | Object | - | YES | - | - | NULL | Embedded: {bankName, accountNumber, transactionCode} | Thông tin chuyển khoản |
| 14 | cashInfo | Object | - | YES | - | - | NULL | Embedded: {receivedBy, receivedAt, notes} | Thông tin tiền mặt |
| 15 | refundInfo | Object | - | YES | - | - | NULL | Embedded: {refundAmount, refundReason, refundedAt, refundedBy} | Thông tin hoàn tiền |
| 16 | metadata | Map | - | YES | - | - | {} | Map of Mixed | Metadata bổ sung |
| 17 | notes | String | - | YES | - | - | NULL | trim | Ghi chú |
| 18 | paidAt | Date | - | YES | - | - | NULL | - | Thời gian thanh toán |
| 19 | expiresAt | Date | - | YES | - | - | NULL | - | Thời gian hết hạn |
| 20 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 21 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 11. Collection: **bookingstatuses** (BookingStatusLog)

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | bookingId | ObjectId | - | NO | - | bookings._id | - | required, ref: Booking | Tham chiếu đặt phòng |
| 3 | actorId | ObjectId | - | YES | - | users._id | NULL | ref: User | Tham chiếu người thực hiện (có thể null) |
| 4 | actorName | String | - | YES | - | - | NULL | trim | Tên người thực hiện (admin/staff hoặc tên user) |
| 5 | action | String | - | NO | - | - | - | required, enum: pending/confirmed/cancelled/checked_in/checked_out/extend/extend_check_out/paid/failed/refunded/refund_requested | Hành động/thay đổi trạng thái |
| 6 | note | String | - | YES | - | - | NULL | trim | Ghi chú |
| 7 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 8 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 12. Collection: **reviews**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | reviewerId | ObjectId | - | NO | - | users._id | - | required, ref: User | Tham chiếu người đánh giá |
| 3 | targetType | String | - | NO | - | - | - | required, enum: room/service/location | Loại đối tượng được đánh giá |
| 4 | targetId | ObjectId | - | NO | - | - | - | required | ID đối tượng được đánh giá (room/service/location) |
| 5 | rating | Number | - | NO | - | - | - | required, min: 1, max: 5 | Điểm đánh giá (1-5 sao) |
| 6 | comment | String | - | YES | - | - | NULL | trim | Bình luận |
| 7 | status | String | - | NO | - | - | 'active' | enum: active/hidden/deleted | Trạng thái đánh giá |
| 8 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 9 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 13. Collection: **conversations**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | participants | Array | - | NO | - | users._id | - | Embedded documents | Danh sách người tham gia [{userId, role, lastReadAt}] |
| 3 | lastMessage | ObjectId | - | YES | - | messages._id | NULL | ref: Message | Tham chiếu tin nhắn cuối |
| 4 | lastMessageAt | Date | - | NO | - | - | Date.now | - | Thời gian tin nhắn cuối |
| 5 | status | String | - | NO | - | - | 'active' | enum: active/archived/deleted | Trạng thái cuộc trò chuyện |
| 6 | unreadCount | Map | - | NO | - | - | {} | Map of Number | Số tin nhắn chưa đọc theo userId |
| 7 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 8 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 14. Collection: **messages**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | conversationId | ObjectId | - | NO | Index | conversations._id | - | required, ref: Conversation | Tham chiếu cuộc trò chuyện |
| 3 | senderId | ObjectId | - | NO | Index | users._id | - | required, ref: User | Tham chiếu người gửi |
| 4 | content | String | - | NO | - | - | - | required, trim | Nội dung tin nhắn |
| 5 | messageType | String | - | NO | - | - | 'text' | enum: text/image/file/system | Loại tin nhắn |
| 6 | attachments | Array | - | NO | - | - | [] | Embedded documents | Tệp đính kèm [{url, type, name, size}] |
| 7 | status | String | - | NO | Index | - | 'sent' | enum: sent/delivered/read/deleted | Trạng thái tin nhắn |
| 8 | readBy | Array | - | NO | - | users._id | [] | Embedded documents | Danh sách người đã đọc [{userId, readAt}] |
| 9 | replyTo | ObjectId | - | YES | - | messages._id | NULL | ref: Message | Tham chiếu tin nhắn được reply |
| 10 | createdAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày tạo |
| 11 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

### 15. Collection: **notifications**

| No. | FieldName | DataType | DataSize | Allow null | Key | Foreign Key | DefaultValue | Constraint | Notes |
|-----|-----------|----------|----------|------------|-----|-------------|--------------|------------|-------|
| 1 | _id | ObjectId | - | NO | Primary Key | - | AUTO | IDENTITY | Khóa chính tự động |
| 2 | type | String | - | NO | - | - | 'new_booking' | required, enum: new_booking/booking_updated/payment_received/booking_cancelled/booking_paid/booking_refunded/booking_refund_requested/group_booking_approved/group_booking_quoted/group_booking_paid/group_booking_confirmed/group_booking_refund_requested/group_booking_refunded/other | Loại thông báo |
| 3 | title | String | - | NO | - | - | - | required, trim | Tiêu đề thông báo |
| 4 | message | String | - | NO | - | - | - | required, trim | Nội dung thông báo |
| 5 | bookingId | ObjectId | - | YES | Index | bookings._id | NULL | ref: Booking | Tham chiếu đặt phòng |
| 6 | userId | ObjectId | - | YES | Index | users._id | NULL | ref: User | Tham chiếu người dùng |
| 7 | bookingData | Object | - | YES | - | - | NULL | Embedded document | Thông tin booking nhúng để hiển thị nhanh |
| 8 | recipients | Array | - | NO | Index | users._id | - | Embedded documents | Danh sách người nhận [{userId, role, read, readAt}] |
| 9 | status | String | - | NO | Index | - | 'active' | enum: active/archived/deleted | Trạng thái thông báo |
| 10 | metadata | Mixed | - | YES | - | - | {} | Schema.Types.Mixed | Metadata bổ sung |
| 11 | createdAt | DateTime | - | NO | Index | - | AUTO | timestamps | Ngày tạo |
| 12 | updatedAt | DateTime | - | NO | - | - | AUTO | timestamps | Ngày cập nhật |

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

