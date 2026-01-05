# Hướng dẫn biến môi trường cho Admin (Vite)

Tạo file `.env` trong thư mục `Admin/` với nội dung tối thiểu:

```
VITE_API_URL=http://localhost:8080
```

- `VITE_API_URL`: URL backend dùng cho dashboard Admin. Triển khai thực tế hãy trỏ vào endpoint public của Backend-api.

Lưu ý: Vite chỉ đọc biến bắt đầu bằng `VITE_`.

# Hướng dẫn biến môi trường cho Backend-api (Node/Express)

Tạo file `.env` trong thư mục `Backend-api/` với các biến sau:

```
JWT_SECRET="mikodangiu"
STREAM_API_KEY="8r229wme2kay"
STREAM_API_SECRET="bxeuz9yteg57qgvwp84wepby7m2kzax6dhwwy8prq2ew7tpbxwjfa9bcgzgg6yxj"

NODE_ENV=development
PORT=8080
#Mongodb
MongoDB_URI = "mongodb://127.0.0.1:27017/Khachsan"

GMAIL_USER=paimon0000000000@gmail.com
GMAIL_APP_PASSWORD=zeamfbowtuxfofhc
```

Giải thích nhanh:
- `PORT`: cổng chạy server.
- `MONGODB_URI`: chuỗi kết nối MongoDB.
- `JWT_SECRET`: khóa ký JWT.
- `STREAM_API_KEY` / `STREAM_API_SECRET`: cấu hình chat (Stream).
- `GMAIL_USER` / `GMAIL_APP_PASSWORD`: dùng gửi email qua Gmail.
- `FRONTEND_URL`: base URL frontend cho email/link (mặc định `http://localhost:3000`).
- `GROUP_DEPOSIT_RATE`: tỷ lệ đặt cọc cho booking theo nhóm (vd 0.5 = 50%).
- `DEBUG_PRICING`: `true` để log chi tiết tính giá (để debug).

Ghi chú: Nếu không dùng Gmail, thay bằng SMTP khác và cập nhật logic gửi mail tương ứng.

# Hướng dẫn biến môi trường cho hotel-management (Next.js)

Tạo file `.env.local` trong thư mục `hotel-management/` với các biến sau:

```
STRIPE_SECRET_KEY=sk_test_51SFQ8PDuSkPZFda2f6giyoDTLFZeuttGEbJF2x8f59cDSo1LwU9KRufeAaZ5ueePBy2RQSGWbfLi5KGsN1F3aI5T00XEqDiLd7
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SFQ8PDuSkPZFda2132JoomoaL6bcAHx5Dc91u2mKeHTFDnF1V5VuEd75lo98l1cv7tqRbXIf9umz5I3xuHaAD9u00vIbQpM5i
NEXT_PUBLIC_BASE_URL=http://localhost:3000

GROQ_API_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8080

```

Giải thích nhanh:
- `NEXT_PUBLIC_API_URL`: base URL gọi API Backend-api cho web client.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: khóa publishable của Stripe (dùng ở client).
- `GROQ_API_KEY`: key cho endpoint AI chat (`/api/ai-chat`); bỏ trống nếu không dùng tính năng chat AI.

Lưu ý: Biến bắt đầu bằng `NEXT_PUBLIC_` sẽ được lộ ra client; giữ `GROQ_API_KEY` trong server only.

