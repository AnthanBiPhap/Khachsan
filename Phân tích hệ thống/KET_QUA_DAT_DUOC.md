# KẾT QUẢ ĐẠT ĐƯỢC - ĐỒ ÁN TỐT NGHIỆP

## HỆ THỐNG QUẢN LÝ KHÁCH SẠN MIKO HOTEL

---

## I. KẾT QUẢ ĐẠT ĐƯỢC VỀ CÔNG NGHỆ

### 1. Xây dựng hệ thống Full-Stack với kiến trúc hiện đại

Đồ án đã xây dựng thành công hệ thống quản lý khách sạn với kiến trúc Full-Stack, bao gồm ba thành phần chính: Backend API sử dụng Node.js và Express, Admin Panel sử dụng React và Vite, và Customer Frontend sử dụng Next.js 14 với App Router. Hệ thống được phát triển hoàn toàn bằng TypeScript, đảm bảo tính nhất quán về kiểu dữ liệu và giảm thiểu lỗi trong quá trình phát triển.

### 2. Triển khai cơ sở dữ liệu NoSQL với MongoDB

Hệ thống sử dụng MongoDB làm cơ sở dữ liệu chính với Mongoose ODM để quản lý 15 collections, bao gồm users, bookings, rooms, services, payments, invoices và các module khác. Việc sử dụng MongoDB cho phép lưu trữ dữ liệu dạng document linh hoạt, phù hợp với đặc thù của hệ thống quản lý khách sạn, đồng thời hỗ trợ tốt cho việc mở rộng và phát triển trong tương lai.

### 3. Áp dụng các công nghệ bảo mật tiên tiến

Hệ thống đã triển khai nhiều lớp bảo mật bao gồm: xác thực người dùng bằng JWT (JSON Web Token) với access token và refresh token, mã hóa mật khẩu bằng bcrypt với 10 salt rounds, validation đầu vào bằng Yup schema, xác thực email cho khách hàng, và phân quyền theo vai trò (RBAC) với ba cấp độ: customer, staff và admin. Các biện pháp này đảm bảo an toàn cho dữ liệu và thông tin người dùng.

### 4. Tích hợp các dịch vụ bên thứ ba

Đồ án đã tích hợp thành công các dịch vụ bên thứ ba quan trọng: Stripe để xử lý thanh toán trực tuyến, Nodemailer để gửi email thông báo và xác thực, Socket.IO để hỗ trợ chat real-time giữa khách hàng và nhân viên, Stream Chat API cho hệ thống nhắn tin, và Groq AI API để cung cấp tính năng chatbot thông minh. Các tích hợp này nâng cao trải nghiệm người dùng và mở rộng chức năng của hệ thống.

### 5. Sử dụng các thư viện và framework hiện đại

Hệ thống tận dụng các thư viện và framework mới nhất trong hệ sinh thái JavaScript/TypeScript: React 19 với Vite cho Admin Panel, Next.js 14 với App Router cho Customer Frontend, Ant Design và shadcn/ui cho giao diện người dùng, TanStack React Query cho quản lý dữ liệu, Zustand cho quản lý state, Recharts cho biểu đồ thống kê, và PDFKit cùng XLSX cho xuất báo cáo. Việc sử dụng các công nghệ này giúp hệ thống có hiệu suất cao, dễ bảo trì và mở rộng.

---

## II. KẾT QUẢ ĐẠT ĐƯỢC VỀ CHƯƠNG TRÌNH

### 1. Xây dựng hệ thống quản lý đặt phòng hoàn chỉnh

Chương trình đã xây dựng thành công hệ thống quản lý đặt phòng với đầy đủ các chức năng: đặt phòng cá nhân và đặt phòng nhóm, quản lý danh sách khách, theo dõi trạng thái booking (pending, confirmed, checked-in, checked-out, cancelled), hỗ trợ gia hạn thời gian check-out, và quản lý lịch sử thay đổi trạng thái. Hệ thống hỗ trợ cả đặt phòng online và walk-in, đáp ứng nhu cầu thực tế của khách sạn.

### 2. Triển khai hệ thống thanh toán và hóa đơn điện tử

Chương trình đã phát triển hệ thống thanh toán tích hợp Stripe, cho phép khách hàng thanh toán trực tuyến bằng thẻ tín dụng. Hệ thống hỗ trợ nhiều phương thức thanh toán bao gồm thanh toán online qua Stripe, thanh toán tiền mặt, và chuyển khoản ngân hàng. Chương trình cũng tự động tạo hóa đơn điện tử, hỗ trợ xuất file PDF, và quản lý trạng thái thanh toán (pending, partial_paid, paid, refunded) một cách chi tiết.

### 3. Phát triển hệ thống chat và thông báo real-time

Chương trình đã triển khai thành công hệ thống chat real-time giữa khách hàng và nhân viên sử dụng Socket.IO và Stream Chat API, cho phép trao đổi tin nhắn tức thời, gửi file đính kèm, và đánh dấu tin nhắn đã đọc. Hệ thống thông báo real-time tự động gửi thông báo cho người dùng về các sự kiện quan trọng như booking mới, thanh toán thành công, thay đổi trạng thái booking, với khả năng hiển thị popup và dropdown notification.

### 4. Xây dựng giao diện quản trị và khách hàng đầy đủ

Chương trình đã phát triển hai giao diện riêng biệt: Admin Panel với 16 trang quản trị bao gồm Dashboard với biểu đồ thống kê, quản lý người dùng, quản lý đặt phòng, quản lý phòng và loại phòng, quản lý dịch vụ, quản lý thanh toán và hóa đơn, quản lý đánh giá, và hệ thống chat; Customer Frontend với các trang tìm kiếm phòng, xem chi tiết phòng, đặt phòng, quản lý booking cá nhân, đặt phòng nhóm, khám phá địa điểm du lịch, và dashboard khách hàng. Cả hai giao diện đều có thiết kế hiện đại, thân thiện với người dùng.

### 5. Triển khai các tính năng hỗ trợ và báo cáo

Chương trình đã phát triển các tính năng hỗ trợ quan trọng: hệ thống đánh giá và bình luận của khách hàng về phòng và dịch vụ, quản lý danh mục địa điểm du lịch xung quanh khách sạn với thông tin chi tiết, tính năng xuất báo cáo ra file Excel và PDF cho các module quản lý, hệ thống tìm kiếm và lọc dữ liệu nâng cao, và tích hợp AI chatbot để hỗ trợ khách hàng. Các tính năng này nâng cao giá trị sử dụng và hiệu quả quản lý của hệ thống.

---

## III. HẠN CHẾ CỦA ĐỒ ÁN

### 1. Hạn chế về hiệu năng và khả năng mở rộng

Hệ thống hiện tại chưa được tối ưu hóa hoàn toàn cho việc xử lý số lượng lớn người dùng đồng thời. Chưa triển khai caching layer (Redis) để cải thiện tốc độ truy vấn dữ liệu, chưa có cơ chế load balancing và horizontal scaling cho backend server. Hệ thống cũng chưa có cơ chế rate limiting để bảo vệ API khỏi các cuộc tấn công DDoS hoặc lạm dụng. Việc tối ưu hóa truy vấn database và index chưa được thực hiện đầy đủ cho tất cả các collections.

### 2. Hạn chế về tính năng và chức năng

Một số tính năng quan trọng chưa được triển khai hoặc chỉ ở mức cơ bản: hệ thống quản lý nhân viên (staff management) chưa có đầy đủ các chức năng như phân ca làm việc, quản lý lương, đánh giá hiệu suất; hệ thống quản lý kho và vật tư chưa được phát triển; tính năng đặt phòng theo gói (package booking) và chương trình khuyến mãi tự động chưa có; hệ thống báo cáo thống kê chưa đầy đủ các loại báo cáo chi tiết theo từng giai đoạn thời gian; chưa có ứng dụng mobile cho khách hàng và nhân viên.

### 3. Hạn chế về kiểm thử và triển khai

Đồ án chưa có bộ test cases đầy đủ bao gồm unit tests, integration tests và end-to-end tests để đảm bảo chất lượng code và phát hiện lỗi sớm. Chưa có quy trình CI/CD (Continuous Integration/Continuous Deployment) tự động để triển khai và kiểm thử. Hệ thống chưa được triển khai trên môi trường production thực tế, chỉ mới chạy trên môi trường development. Chưa có cơ chế monitoring và logging tập trung để theo dõi hiệu suất và phát hiện lỗi trong thời gian thực.

### 4. Hạn chế về bảo mật và tuân thủ

Một số biện pháp bảo mật nâng cao chưa được triển khai: chưa có cơ chế 2FA (Two-Factor Authentication) cho tài khoản admin và staff, chưa có hệ thống audit log chi tiết để theo dõi mọi thao tác quan trọng, chưa có cơ chế mã hóa dữ liệu nhạy cảm trong database, chưa triển khai HTTPS và SSL/TLS certificate cho production. Hệ thống cũng chưa tuân thủ các tiêu chuẩn bảo mật như OWASP Top 10 một cách đầy đủ, và chưa có quy trình xử lý sự cố bảo mật (incident response plan).

---

## IV. HƯỚNG PHÁT TRIỂN

### 1. Nâng cấp hiệu năng và khả năng mở rộng hệ thống

Triển khai Redis caching layer để tăng tốc độ truy vấn dữ liệu thường xuyên được sử dụng như thông tin phòng, giá cả, và thông tin người dùng. Xây dựng kiến trúc microservices để tách biệt các module chức năng, cho phép scale độc lập từng service. Triển khai load balancing và horizontal scaling sử dụng Docker containerization và Kubernetes orchestration. Tối ưu hóa database với việc tạo index phù hợp cho tất cả các truy vấn thường xuyên, và xem xét sử dụng database replication để cải thiện hiệu suất đọc dữ liệu.

### 2. Mở rộng tính năng và chức năng

Phát triển ứng dụng mobile native (iOS và Android) sử dụng React Native hoặc Flutter để khách hàng có thể đặt phòng, quản lý booking, và liên hệ với khách sạn mọi lúc mọi nơi. Xây dựng hệ thống quản lý nhân viên đầy đủ với tính năng phân ca, chấm công, quản lý lương, và đánh giá hiệu suất. Phát triển hệ thống quản lý kho và vật tư để theo dõi tồn kho, đặt hàng, và quản lý chi phí. Triển khai tính năng đặt phòng theo gói (package booking) với các gói combo phòng + dịch vụ, và hệ thống khuyến mãi tự động dựa trên điều kiện và thời gian.

### 3. Cải thiện chất lượng và quy trình phát triển

Xây dựng bộ test cases đầy đủ bao gồm unit tests (Jest), integration tests, và end-to-end tests (Cypress hoặc Playwright) để đảm bảo chất lượng code và giảm thiểu lỗi. Thiết lập quy trình CI/CD tự động sử dụng GitHub Actions hoặc GitLab CI để tự động build, test, và deploy khi có code mới. Triển khai hệ thống monitoring và logging tập trung sử dụng các công cụ như Prometheus, Grafana, và ELK Stack để theo dõi hiệu suất, phát hiện lỗi, và phân tích dữ liệu. Xây dựng hệ thống documentation đầy đủ cho API (Swagger/OpenAPI), code comments, và user manual.

### 4. Tăng cường bảo mật và tuân thủ

Triển khai xác thực hai yếu tố (2FA) cho tài khoản admin và staff sử dụng TOTP (Time-based One-Time Password) hoặc SMS OTP. Xây dựng hệ thống audit log chi tiết để ghi lại mọi thao tác quan trọng của người dùng, đặc biệt là các thao tác liên quan đến thanh toán, thay đổi trạng thái booking, và quản lý dữ liệu nhạy cảm. Mã hóa dữ liệu nhạy cảm trong database sử dụng field-level encryption cho thông tin như số thẻ tín dụng, số CMND/CCCD. Triển khai HTTPS và SSL/TLS certificate cho production, và thực hiện security audit định kỳ để đảm bảo tuân thủ các tiêu chuẩn bảo mật như OWASP Top 10, GDPR (nếu mở rộng ra thị trường quốc tế).

---

## V. TÀI LIỆU THAM KHẢO - FRAMEWORK VÀ THƯ VIỆN

### TỔNG HỢP 20 FRAMEWORK VÀ THƯ VIỆN QUAN TRỌNG NHẤT

1. **Node.js** - Runtime environment cho JavaScript phía server - https://nodejs.org/
2. **Express** (v5.1.0) - Web framework cho Node.js, xây dựng RESTful API - https://expressjs.com/
3. **TypeScript** (v5.x) - Ngôn ngữ lập trình với type checking - https://www.typescriptlang.org/
4. **MongoDB** - Cơ sở dữ liệu NoSQL dạng document - https://www.mongodb.com/
5. **Mongoose** (v8.18.1) - Object Data Modeling (ODM) library cho MongoDB - https://mongoosejs.com/
6. **React** (v18/v19) - JavaScript library xây dựng user interface - https://react.dev/
7. **Next.js** (v14.2.16) - React framework với SSR, SSG và App Router - https://nextjs.org/
8. **Vite** (v7.1.2) - Build tool và development server nhanh - https://vitejs.dev/
9. **Ant Design** (v5.27.x) - React UI component library - https://ant.design/
10. **Tailwind CSS** (v4.1.x) - Utility-first CSS framework - https://tailwindcss.com/
11. **shadcn/ui** - Component library dựa trên Radix UI và Tailwind CSS - https://ui.shadcn.com/
12. **jsonwebtoken** (v9.0.2) - Tạo và xác thực JSON Web Tokens (JWT) - https://github.com/auth0/node-jsonwebtoken
13. **bcryptjs** (v3.0.2) - Thư viện mã hóa mật khẩu bằng bcrypt hashing - https://github.com/dcodeIO/bcrypt.js
14. **Socket.IO** (v4.8.1) - Real-time bidirectional event-based communication - https://socket.io/
15. **Stream Chat** (v9.20.x) - SDK cho Stream Chat API - hệ thống chat real-time - https://getstream.io/chat/
16. **Stripe** (v19.1.0) - Hệ thống thanh toán trực tuyến, xử lý thẻ tín dụng - https://stripe.com/
17. **@tanstack/react-query** (v5.87.4) - Data fetching và caching library cho React - https://tanstack.com/query/latest
18. **react-hook-form** (v7.60.0) - Performant form library cho React - https://react-hook-form.com/
19. **Zod** (v3.25.67) - TypeScript-first schema validation - https://zod.dev/
20. **Nodemailer** (v7.0.10) - Gửi email từ Node.js - https://nodemailer.com/

---

### A. Backend API

#### Framework và Runtime
- **Node.js**: Runtime environment cho JavaScript phía server - https://nodejs.org/
- **Express** (v5.1.0): Web framework cho Node.js, xây dựng RESTful API - https://expressjs.com/
- **TypeScript** (v5.9.2): Ngôn ngữ lập trình với type checking, compile sang JavaScript - https://www.typescriptlang.org/

#### Database và ODM
- **MongoDB**: Cơ sở dữ liệu NoSQL dạng document - https://www.mongodb.com/
- **Mongoose** (v8.18.1): Object Data Modeling (ODM) library cho MongoDB và Node.js - https://mongoosejs.com/

#### Xác thực và Bảo mật
- **jsonwebtoken** (v9.0.2): Tạo và xác thực JSON Web Tokens (JWT) - https://github.com/auth0/node-jsonwebtoken
- **bcryptjs** (v3.0.2): Thư viện mã hóa mật khẩu bằng bcrypt hashing - https://github.com/dcodeIO/bcrypt.js
- **crypto** (v1.0.1): Module Node.js cho các chức năng mã hóa - https://nodejs.org/api/crypto.html

#### Validation và Xử lý dữ liệu
- **yup** (v1.7.0): Schema validation cho JavaScript/TypeScript - https://github.com/jquense/yup
- **express-validator** (v7.2.1): Middleware validation cho Express - https://express-validator.github.io/
- **moment** (v2.30.1): Thư viện xử lý và format ngày tháng - https://momentjs.com/
- **slugify** (v1.6.6): Tạo URL-friendly slugs từ chuỗi - https://github.com/simov/slugify

#### Giao tiếp và Tích hợp
- **axios** (v1.12.2): HTTP client cho gửi requests - https://axios-http.com/
- **socket.io** (v4.8.1): Real-time bidirectional event-based communication - https://socket.io/
- **stream-chat** (v9.20.1): SDK cho Stream Chat API - hệ thống chat real-time - https://getstream.io/chat/docs/
- **nodemailer** (v7.0.10): Gửi email từ Node.js - https://nodemailer.com/

#### Xử lý File và Xuất báo cáo
- **multer** (v1.4.5-lts.1): Middleware xử lý multipart/form-data (upload file) - https://github.com/expressjs/multer
- **pdfkit** (v0.17.2): Tạo file PDF từ Node.js - https://pdfkit.org/
- **xlsx** (v0.18.5): Đọc và ghi file Excel - https://sheetjs.com/

#### Middleware và Utilities
- **cors** (v2.8.5): Cross-Origin Resource Sharing middleware - https://github.com/expressjs/cors
- **compression** (v1.8.1): Nén HTTP responses - https://github.com/expressjs/compression
- **dotenv** (v17.2.2): Load environment variables từ file .env - https://github.com/motdotla/dotenv
- **http-errors** (v2.0.0): Tạo HTTP error objects - https://github.com/jshttp/http-errors
- **qs** (v6.14.0): Parse và stringify query strings - https://github.com/ljharb/qs

---

### B. Admin Panel

#### Framework và Build Tools
- **React** (v19.1.1): JavaScript library xây dựng user interface - https://react.dev/
- **Vite** (v7.1.2): Build tool và development server nhanh - https://vitejs.dev/
- **TypeScript** (v5.8.3): Ngôn ngữ lập trình với type checking - https://www.typescriptlang.org/

#### UI Framework và Components
- **Ant Design** (v5.27.3): React UI component library - https://ant.design/
- **@ant-design/icons** (v6.0.2): Icon library cho Ant Design - https://ant.design/components/icon/
- **@ant-design/v5-patch-for-react-19** (v1.0.3): Patch hỗ trợ React 19 - https://github.com/ant-design/ant-design
- **Tailwind CSS** (v4.1.13): Utility-first CSS framework - https://tailwindcss.com/
- **lucide-react** (v0.545.0): Icon library hiện đại - https://lucide.dev/

#### Quản lý State và Data Fetching
- **@tanstack/react-query** (v5.87.4): Data fetching và caching library cho React - https://tanstack.com/query/latest
- **zustand** (v5.0.8): Lightweight state management library - https://zustand-demo.pmnd.rs/

#### Routing
- **react-router-dom** (v7.9.1): Declarative routing cho React applications - https://reactrouter.com/

#### Xử lý Date và Time
- **dayjs** (v1.11.18): Thư viện xử lý ngày tháng nhẹ và nhanh - https://day.js.org/

#### Biểu đồ và Visualization
- **recharts** (v3.2.1): Composable charting library cho React - https://recharts.org/

#### Real-time Communication
- **socket.io-client** (v4.8.1): Client library cho Socket.IO - https://socket.io/docs/v4/client-api/
- **stream-chat** (v9.20.2): SDK cho Stream Chat API - https://getstream.io/chat/docs/
- **stream-chat-react** (v13.7.0): React components cho Stream Chat - https://getstream.io/chat/docs/sdk/react/

#### Xuất File
- **xlsx** (v0.18.5): Đọc và ghi file Excel - https://sheetjs.com/
- **jspdf** (v3.0.3): Tạo file PDF từ JavaScript - https://github.com/parallax/jsPDF
- **jspdf-autotable** (v5.0.2): Plugin tạo bảng trong PDF - https://github.com/simonbengtsson/jsPDF-AutoTable
- **file-saver** (v2.0.5): Lưu file từ client-side - https://github.com/eligrey/FileSaver.js

#### Development Tools
- **ESLint** (v9.33.0): Linting tool cho JavaScript/TypeScript - https://eslint.org/
- **@vitejs/plugin-react-swc** (v4.0.0): Vite plugin cho React với SWC - https://github.com/vitejs/vite-plugin-react-swc

---

### C. Customer Frontend (hotel-management)

#### Framework và Build Tools
- **Next.js** (v14.2.16): React framework với SSR, SSG và App Router - https://nextjs.org/
- **React** (v18): JavaScript library xây dựng user interface - https://react.dev/
- **TypeScript** (v5): Ngôn ngữ lập trình với type checking - https://www.typescriptlang.org/

#### UI Components và Styling
- **shadcn/ui**: Component library dựa trên Radix UI và Tailwind CSS - https://ui.shadcn.com/
  - **@radix-ui/react-***: Các component primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, label, popover, select, tabs, toast, tooltip, v.v.) - https://www.radix-ui.com/
- **Ant Design** (v5.27.4): React UI component library - https://ant.design/
- **@ant-design/icons** (v6.0.2): Icon library cho Ant Design - https://ant.design/components/icon/
- **Tailwind CSS** (v4.1.9): Utility-first CSS framework - https://tailwindcss.com/
- **tailwindcss-animate** (v1.0.7): Animation utilities cho Tailwind - https://github.com/jamiebuilds/tailwindcss-animate
- **lucide-react** (v0.454.0): Icon library hiện đại - https://lucide.dev/
- **class-variance-authority** (v0.7.1): Utility cho variant-based styling - https://github.com/joe-bell/cva
- **clsx** (v2.1.1): Utility để construct className strings - https://github.com/lukeed/clsx
- **tailwind-merge** (v2.5.5): Merge Tailwind CSS classes - https://github.com/dcastil/tailwind-merge

#### Form Handling và Validation
- **react-hook-form** (v7.60.0): Performant form library cho React - https://react-hook-form.com/
- **@hookform/resolvers** (v3.10.0): Validation resolvers cho react-hook-form - https://github.com/react-hook-form/resolvers
- **zod** (v3.25.67): TypeScript-first schema validation - https://zod.dev/

#### Date và Time
- **date-fns** (v4.1.0): Utility library cho xử lý ngày tháng - https://date-fns.org/
- **dayjs** (v1.11.18): Thư viện xử lý ngày tháng nhẹ - https://day.js.org/
- **react-day-picker** (v9.8.0): Date picker component cho React - https://react-day-picker.js.org/

#### Payment Integration
- **stripe** (v19.1.0): Stripe API library cho Node.js - https://stripe.com/docs/api
- **@stripe/stripe-js** (v8.0.0): Stripe.js library cho client-side - https://stripe.com/docs/stripe-js

#### Real-time Communication
- **socket.io-client** (v4.8.1): Client library cho Socket.IO - https://socket.io/docs/v4/client-api/
- **stream-chat** (v9.20.1): SDK cho Stream Chat API - https://getstream.io/chat/docs/
- **stream-chat-react** (v13.7.0): React components cho Stream Chat - https://getstream.io/chat/docs/sdk/react/

#### Biểu đồ và Visualization
- **recharts** (v2.15.4): Composable charting library cho React - https://recharts.org/

#### Animation và UI Effects
- **motion** (v12.23.22): Animation library cho React - https://motion.dev/
- **embla-carousel-react** (v8.5.1): Carousel component cho React - https://www.embla-carousel.com/

#### Utilities và Helpers
- **cmdk** (v1.0.4): Command menu component - https://cmdk.paco.me/
- **input-otp** (v1.4.1): OTP input component - https://github.com/guilhermerodz/input-otp
- **next-themes** (v0.4.6): Theme provider cho Next.js - https://github.com/pacocoursey/next-themes
- **sonner** (v1.7.4): Toast notification library - https://sonner.emilkowal.ski/
- **vaul** (v0.9.9): Drawer component - https://vaul.emilkowal.ski/
- **react-resizable-panels** (v2.1.7): Resizable panel components - https://github.com/bvaughn/react-resizable-panels
- **axios** (v1.12.2): HTTP client - https://axios-http.com/
- **pdfkit** (v0.17.2): Tạo file PDF - https://pdfkit.org/

#### Analytics
- **@vercel/analytics** (latest): Analytics cho Vercel deployments - https://vercel.com/docs/analytics

#### Fonts
- **geist** (latest): Font family từ Vercel - https://vercel.com/font

#### Development Tools
- **PostCSS** (v8.5): CSS processing tool - https://postcss.org/
- **autoprefixer** (v10.4.20): PostCSS plugin thêm vendor prefixes - https://github.com/postcss/autoprefixer

---

### D. Công cụ và Dịch vụ Bên thứ ba

#### Payment Gateway
- **Stripe**: Hệ thống thanh toán trực tuyến, xử lý thẻ tín dụng - https://stripe.com/

#### Real-time Communication
- **Stream Chat API**: Dịch vụ chat real-time với tính năng messaging, file sharing, typing indicators - https://getstream.io/chat/

#### Email Service
- **Nodemailer**: Gửi email thông báo, xác thực tài khoản, reset password - https://nodemailer.com/

#### AI Service
- **Groq AI API**: Tích hợp AI chatbot để hỗ trợ khách hàng - https://groq.com/

---

*Tài liệu này tổng hợp các kết quả đạt được, hạn chế, hướng phát triển và danh sách framework/thư viện được sử dụng trong quá trình phát triển đồ án tốt nghiệp về hệ thống quản lý khách sạn Miko Hotel.*

