# 🔒 TÀI LIỆU BẢO MẬT THÔNG TIN - HỆ THỐNG MIKO HOTEL

## 📋 Tổng quan

Hệ thống Miko Hotel đã triển khai nhiều lớp bảo mật để bảo vệ thông tin người dùng, dữ liệu nhạy cảm và ngăn chặn các cuộc tấn công phổ biến.

---

## 1. XÁC THỰC VÀ PHÂN QUYỀN (Authentication & Authorization)

### 1.1. JWT (JSON Web Token)

Hệ thống sử dụng công nghệ JSON Web Token (JWT) để xác thực người dùng. Công nghệ được sử dụng là thư viện `jsonwebtoken`. Các file liên quan được đặt tại `Backend-api/src/services/auth.service.ts` và `Backend-api/src/middlewares/auth.middleware.ts`.

Khi người dùng đăng nhập thành công, hệ thống sẽ tạo ra hai loại token: Access Token có thời hạn 24 giờ và Refresh Token có thời hạn 365 ngày. Mỗi token chứa thông tin định danh người dùng bao gồm `_id` và `email`. Token được ký bằng `JWT_SECRET` được lưu trữ trong biến môi trường.

Ví dụ về cách tạo token:
```typescript
const accessToken = jwt.sign(
  { _id: user._id, email: user.email},
  env.JWT_SECRET as string,
  { expiresIn: '24h' }
);
```

Hệ thống sử dụng hai middleware chính để xác thực: `authenticateToken` thực hiện kiểm tra tính hợp lệ của token, xác minh người dùng còn tồn tại trong hệ thống và tài khoản chưa bị khóa; `authorize` kiểm tra quyền truy cập dựa trên vai trò của người dùng (customer, staff, admin).

Các biện pháp bảo vệ được áp dụng bao gồm: token tự động hết hạn sau thời gian quy định, kiểm tra người dùng còn tồn tại và chưa bị xóa (soft delete), kiểm tra tài khoản chưa bị khóa, và xử lý các trường hợp lỗi như token hết hạn hoặc token không hợp lệ.

---

## 2. BẢO MẬT MẬT KHẨU (Password Security)

### 2.1. Bcrypt Hashing

Hệ thống sử dụng thuật toán bcrypt để mã hóa mật khẩu trước khi lưu trữ vào cơ sở dữ liệu. Công nghệ được sử dụng là thư viện `bcryptjs`. File liên quan được đặt tại `Backend-api/src/models/users.model.ts`.

Quá trình mã hóa mật khẩu được thực hiện tự động thông qua middleware `pre('save')` của Mongoose trước khi lưu dữ liệu vào database. Hệ thống sử dụng 10 salt rounds để đảm bảo độ mạnh của thuật toán mã hóa.

Ví dụ về cách mã hóa mật khẩu:
```typescript
userSchema.pre('save', async function (next) {
  if (!user.isModified('password')) return next();
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;
  next();
})
```

Khi người dùng đăng nhập, hệ thống so sánh mật khẩu người dùng nhập vào với hash đã lưu trong database bằng phương thức `bcrypt.compare()`.

Các biện pháp bảo vệ được áp dụng: mật khẩu không bao giờ được lưu trữ dưới dạng văn bản thuần túy (plain text), không thể đảo ngược quá trình hash để lấy lại mật khẩu gốc, và mỗi mật khẩu được gán một salt riêng biệt để tăng cường bảo mật.

---

## 3. VALIDATION ĐẦU VÀO (Input Validation)

### 3.1. Yup Schema Validation

Hệ thống sử dụng thư viện Yup để kiểm tra và xác thực tất cả dữ liệu đầu vào từ phía client trước khi xử lý. Các file validation được đặt tại thư mục `Backend-api/src/validations/` và middleware xử lý validation tại `Backend-api/src/middlewares/validate.middleware.ts`.

Quá trình validation kiểm tra các tiêu chí sau: kiểu dữ liệu, độ dài tối đa và tối thiểu, định dạng (format), và các trường bắt buộc. Khi validation thất bại, hệ thống trả về thông báo lỗi chi tiết cho từng trường dữ liệu.

Ví dụ về validation email:
```typescript
email: yup
  .string()
  .email('Email không hợp lệ')
  .max(100, 'Email không được vượt quá 100 ký tự')
  .required('Email là bắt buộc')
```

Ví dụ về validation mật khẩu:
```typescript
password: yup
  .string()
  .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
  .max(255, 'Mật khẩu không được vượt quá 255 ký tự')
  .required('Mật khẩu là bắt buộc')
```

Ví dụ về validation số điện thoại:
```typescript
phoneNumber: yup
  .string()
  .matches(/^(0[1-9][0-9]{8,9}|\+84[1-9][0-9]{8,9})$/, 
    'Số điện thoại không hợp lệ')
  .required('Số điện thoại là bắt buộc')
```

Các biện pháp bảo vệ được áp dụng: ngăn chặn tấn công SQL Injection (và NoSQL Injection đối với MongoDB), ngăn chặn tấn công XSS (Cross-Site Scripting), ngăn chặn dữ liệu không hợp lệ được xử lý, và kiểm tra định dạng của email, số điện thoại, ngày tháng.

---

## 4. XÁC THỰC EMAIL (Email Verification)

Chức năng xác thực email được triển khai tại các file `Backend-api/src/services/auth.service.ts` và `Backend-api/src/services/users.service.ts`.

Khi người dùng đăng ký tài khoản với vai trò customer, hệ thống sẽ tự động gửi email xác thực đến địa chỉ email đã đăng ký. Token xác thực được tạo bằng phương thức `crypto.randomBytes(32).toString('hex')`, đảm bảo tính ngẫu nhiên và không thể đoán trước. Token xác thực có thời hạn 24 giờ kể từ thời điểm tạo. Đối với tài khoản admin và staff, hệ thống tự động đánh dấu email đã được xác thực mà không cần thực hiện quy trình xác thực qua email.

Các biện pháp bảo vệ được áp dụng: ngăn chặn việc đăng ký tài khoản bằng địa chỉ email giả mạo, token xác thực được tạo ngẫu nhiên và không thể đoán được, token có thời hạn sử dụng, và người dùng có vai trò customer bắt buộc phải xác thực email trước khi có thể đăng nhập vào hệ thống.

---

## 5. ĐẶT LẠI MẬT KHẨU (Password Reset)

Chức năng đặt lại mật khẩu được triển khai tại file `Backend-api/src/services/auth.service.ts`.

Quy trình đặt lại mật khẩu được thực hiện theo các bước sau: người dùng yêu cầu đặt lại mật khẩu, hệ thống tạo mã OTP gồm 6 chữ số ngẫu nhiên, mã OTP được gửi đến địa chỉ email đã đăng ký của người dùng, mã OTP có thời hạn 10 phút kể từ thời điểm tạo, người dùng nhập mã OTP để xác nhận yêu cầu, sau khi xác nhận thành công, người dùng có thể đặt mật khẩu mới và mật khẩu mới sẽ được mã hóa tự động trước khi lưu vào cơ sở dữ liệu.

Các biện pháp bảo vệ được áp dụng: mã OTP được tạo ngẫu nhiên gồm 6 chữ số, mã OTP có thời hạn ngắn (10 phút) để giảm thiểu rủi ro bảo mật, hệ thống không tiết lộ thông tin về việc địa chỉ email có tồn tại trong hệ thống hay không (security through obscurity), và mật khẩu mới được mã hóa bằng bcrypt trước khi lưu trữ.

---

## 6. SOFT DELETE

Chức năng xóa mềm (soft delete) được triển khai tại file `Backend-api/src/models/users.model.ts`.

Khi thực hiện thao tác xóa người dùng, hệ thống không xóa dữ liệu thực sự khỏi cơ sở dữ liệu mà chỉ đánh dấu thời điểm xóa bằng cách gán giá trị `deletedAt` bằng thời gian hiện tại (`Date.now()`). Tất cả các truy vấn dữ liệu trong hệ thống đều được lọc để chỉ lấy các bản ghi có `deletedAt` bằng null, đảm bảo các bản ghi đã bị xóa không xuất hiện trong kết quả truy vấn.

Các biện pháp bảo vệ được áp dụng: dữ liệu không bị mất vĩnh viễn và có thể được khôi phục nếu cần thiết, và hệ thống ngăn chặn việc truy cập vào các tài khoản đã bị xóa.

---

## 7. QUẢN LÝ TRẠNG THÁI TÀI KHOẢN (Account Status)

Chức năng quản lý trạng thái tài khoản được triển khai tại các file `Backend-api/src/models/users.model.ts` và `Backend-api/src/middlewares/auth.middleware.ts`.

Mỗi tài khoản người dùng trong hệ thống có một trạng thái, có thể là `active` (hoạt động) hoặc `blocked` (bị khóa). Khi người dùng thực hiện đăng nhập, hệ thống kiểm tra trạng thái tài khoản. Nếu trạng thái là `blocked`, hệ thống sẽ từ chối yêu cầu đăng nhập. Quản trị viên có quyền thực hiện các thao tác khóa hoặc mở khóa tài khoản người dùng.

Các biện pháp bảo vệ được áp dụng: ngăn chặn các tài khoản bị xâm nhập trái phép tiếp tục truy cập vào hệ thống, và cho phép kiểm soát quyền truy cập theo thời gian thực.

---

## 8. QUẢN LÝ BIẾN MÔI TRƯỜNG (Environment Variables)

Chức năng quản lý biến môi trường được triển khai tại file `Backend-api/src/helpers/env.helper.ts` và file `.env`.

Các biến môi trường bảo mật được sử dụng trong hệ thống bao gồm: `JWT_SECRET` là khóa bí mật dùng để ký JWT token, `MONGODB_URI` là chuỗi kết nối đến cơ sở dữ liệu MongoDB, `GMAIL_USER` là địa chỉ email dùng để gửi thông báo, `GMAIL_APP_PASSWORD` là mật khẩu ứng dụng của Gmail, `STREAM_API_KEY` là khóa API cho dịch vụ Stream Chat, và `STREAM_API_SECRET` là khóa bí mật API cho dịch vụ Stream Chat.

Các biện pháp bảo vệ được áp dụng: các thông tin bí mật không được mã hóa cứng (hardcode) trong mã nguồn, được lưu trữ trong file `.env` và không được đưa lên hệ thống quản lý phiên bản Git, và mỗi môi trường (development, production) sử dụng các thông tin bí mật riêng biệt.

---

## 9. CORS (Cross-Origin Resource Sharing)

Chức năng cấu hình CORS được triển khai tại file `Backend-api/src/app.ts`.

Hệ thống được cấu hình CORS để chỉ cho phép các domain frontend cụ thể được phép gửi yêu cầu đến API. Các yêu cầu từ các domain không được phép sẽ bị hệ thống từ chối.

Các biện pháp bảo vệ được áp dụng: ngăn chặn tấn công CSRF (Cross-Site Request Forgery), và chỉ cho phép frontend chính thức của hệ thống mới có thể gọi API.

---

## 10. PHÂN QUYỀN THEO VAI TRÒ (Role-Based Access Control - RBAC)

Chức năng phân quyền theo vai trò được triển khai tại file `Backend-api/src/middlewares/auth.middleware.ts`.

Hệ thống phân loại người dùng thành ba vai trò chính: `customer` (khách hàng), `staff` (nhân viên), và `admin` (quản trị viên). Middleware `authorize(roles)` được sử dụng để kiểm tra vai trò của người dùng. Chỉ những người dùng có vai trò phù hợp mới được phép truy cập vào các endpoint tương ứng.

Ví dụ về cách sử dụng:
```typescript
router.get('/users', authenticateToken, authorize(['admin', 'staff']), controller.getAll);
```

Các biện pháp bảo vệ được áp dụng: ngăn chặn người dùng có vai trò customer truy cập vào các chức năng dành cho quản trị viên, và cho phép phân quyền chi tiết theo từng endpoint cụ thể.

---

## 11. LOGGING VÀ ERROR HANDLING

Chức năng xử lý lỗi và ghi log được triển khai tại file `Backend-api/src/app.ts`.

Hệ thống sử dụng một error handler trung tâm để xử lý tất cả các lỗi phát sinh trong quá trình hoạt động. Trong môi trường production, hệ thống không trả về thông tin stack trace trong phản hồi lỗi. Các lỗi được ghi vào console để phục vụ mục đích debug trong môi trường development.

Các biện pháp bảo vệ được áp dụng: không tiết lộ thông tin nhạy cảm trong thông báo lỗi, và không tiết lộ cấu trúc mã nguồn trong môi trường production.

---

## 12. BẢO MẬT DỮ LIỆU NHẠY CẢM

### 12.1. Không trả về mật khẩu

Chức năng loại bỏ mật khẩu khỏi phản hồi được triển khai tại file `Backend-api/src/middlewares/auth.middleware.ts`.

Hệ thống sử dụng phương thức `.select('-password -__v')` để loại bỏ trường mật khẩu và các trường không cần thiết khỏi kết quả truy vấn trước khi trả về cho client.

### 12.2. Không log thông tin nhạy cảm

Hệ thống tuân thủ nguyên tắc không ghi log các thông tin nhạy cảm như mật khẩu, token, và API keys. Chỉ các thông tin cần thiết phục vụ mục đích debug mới được ghi log.

---

## 📊 TÓM TẮT CÁC BIỆN PHÁP BẢO MẬT

| Biện pháp | Công nghệ | Vị trí | Mức độ |
|-----------|-----------|--------|--------|
| **JWT Authentication** | jsonwebtoken | auth.middleware.ts | ⭐⭐⭐⭐⭐ |
| **Password Hashing** | bcryptjs (10 rounds) | users.model.ts | ⭐⭐⭐⭐⭐ |
| **Input Validation** | Yup | validations/*.ts | ⭐⭐⭐⭐ |
| **Email Verification** | crypto.randomBytes | auth.service.ts | ⭐⭐⭐⭐ |
| **Password Reset OTP** | Math.random (6 số) | auth.service.ts | ⭐⭐⭐ |
| **Soft Delete** | deletedAt field | users.model.ts | ⭐⭐⭐ |
| **Account Status** | status field | users.model.ts | ⭐⭐⭐ |
| **RBAC** | authorize middleware | auth.middleware.ts | ⭐⭐⭐⭐ |
| **CORS** | cors middleware | app.ts | ⭐⭐⭐ |
| **Environment Variables** | dotenv | env.helper.ts | ⭐⭐⭐⭐⭐ |

---

## ✅ BEST PRACTICES ĐÃ ÁP DỤNG

1. ✅ **Mật khẩu được hash** bằng bcrypt với 10 salt rounds
2. ✅ **JWT token** có thời hạn (24h cho access, 365d cho refresh)
3. ✅ **Validate tất cả input** từ client bằng Yup
4. ✅ **Email verification** cho customer trước khi đăng nhập
5. ✅ **OTP có thời hạn** (10 phút) cho password reset
6. ✅ **Soft delete** để bảo toàn dữ liệu
7. ✅ **RBAC** để phân quyền chi tiết
8. ✅ **Secrets trong .env** không hardcode
9. ✅ **Không trả về password** trong response
10. ✅ **CORS** được cấu hình để chỉ cho phép frontend chính thức

---

## 🔍 CÁC ĐIỂM CẦN LƯU Ý

1. ⚠️ **JWT_SECRET** phải đủ mạnh và thay đổi trong production
2. ⚠️ **Refresh token** có thời hạn dài (365 ngày) - cân nhắc rút ngắn
3. ⚠️ **OTP** chỉ 6 số - có thể tăng lên 8 số cho bảo mật cao hơn
4. ⚠️ **CORS** cần cấu hình chính xác frontend URLs trong production
5. ⚠️ **Rate limiting** chưa được triển khai - nên thêm để chống brute force

---

## 📚 TÀI LIỆU THAM KHẢO

- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)
- [Yup Validation](https://github.com/jquense/yup)

---

*Tài liệu này mô tả các biện pháp bảo mật đã được triển khai trong hệ thống Miko Hotel. Cần cập nhật thường xuyên khi có thay đổi về bảo mật.*

