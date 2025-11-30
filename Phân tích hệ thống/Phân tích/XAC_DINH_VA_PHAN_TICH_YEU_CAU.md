# 📋 XÁC ĐỊNH VÀ PHÂN TÍCH YÊU CẦU - HỆ THỐNG MIKO HOTEL

---

## 3. NGHIÊN CỨU VÀ PHÂN TÍCH HỆ THỐNG

### 3.0. Nghiên cứu quy trình và luồng hoạt động

Để xây dựng hệ thống quản lý khách sạn Miko Hotel một cách hiệu quả, việc đầu tiên là tiến hành nghiên cứu các quy trình và luồng hoạt động của một hệ thống ứng dụng Website, đảm bảo hiểu rõ sâu sắc về cơ cấu và cách thức hoạt động của nó. Quá trình nghiên cứu bao gồm việc phân tích kiến trúc hệ thống, các thành phần chính (frontend, backend, database), cách các thành phần này tương tác với nhau, và các luồng xử lý dữ liệu từ khi người dùng thực hiện một hành động đến khi hệ thống phản hồi.

Nghiên cứu các yêu cầu của mọi người về một trang Web xem và đặt phòng khách sạn là bước quan trọng tiếp theo. Thông qua việc khảo sát nhu cầu của khách hàng, nhân viên khách sạn và quản trị viên, hệ thống đã xác định được các yêu cầu cốt lõi như: khách hàng cần tìm kiếm và xem thông tin phòng một cách dễ dàng, đặt phòng trực tuyến với quy trình đơn giản, thanh toán an toàn và nhận xác nhận ngay lập tức; nhân viên cần quản lý đặt phòng, xử lý check-in/check-out, và hỗ trợ khách hàng hiệu quả; quản trị viên cần có công cụ quản lý toàn diện với dashboard và báo cáo chi tiết.

Từ những yêu cầu của người dùng, hệ thống đã phân tích và xác định các chức năng cần có của ứng dụng. Các chức năng được phân loại thành các nhóm chính: quản lý người dùng và xác thực, quản lý phòng và loại phòng, quản lý đặt phòng (cá nhân và nhóm), quản lý thanh toán và hóa đơn, quản lý dịch vụ, chat và giao tiếp real-time, quản lý thông báo, quản lý địa điểm, AI Assistant và gợi ý, cùng với dashboard và báo cáo. Mỗi nhóm chức năng được thiết kế để đáp ứng một hoặc nhiều yêu cầu cụ thể từ người dùng, đảm bảo hệ thống hoạt động hiệu quả và mang lại trải nghiệm tốt nhất.

Cuối cùng, hệ thống được xây dựng các chức năng từ những yêu cầu của người dùng, đảm bảo mỗi tính năng đều có mục đích rõ ràng và giải quyết một vấn đề cụ thể. Quá trình xây dựng tuân theo nguyên tắc từ yêu cầu đến chức năng, từ chức năng đến thiết kế, và từ thiết kế đến triển khai, đảm bảo hệ thống cuối cùng phản ánh chính xác nhu cầu thực tế của người dùng và các quy trình nghiệp vụ của khách sạn.

---

## 3.1. XÁC ĐỊNH YÊU CẦU

### 3.1.1. Yêu cầu chức năng (Functional Requirements)

Hệ thống Miko Hotel được xây dựng với các yêu cầu chức năng toàn diện, đáp ứng nhu cầu của ba nhóm người dùng chính: khách hàng, nhân viên và quản trị viên. Các yêu cầu chức năng được phân loại thành mười nhóm chính, mỗi nhóm bao gồm nhiều tính năng cụ thể nhằm đảm bảo hệ thống hoạt động hiệu quả và đáp ứng đầy đủ các nghiệp vụ quản lý khách sạn.

#### **FR1. Đăng ký và Đăng nhập**

**Customer:** Đăng ký tài khoản (email, mật khẩu, SĐT), gửi email xác thực. Đăng nhập bằng email/mật khẩu, nhận JWT token. Quên mật khẩu qua OTP 6 số (hiệu lực 10 phút). Quản lý hồ sơ cá nhân.

**Admin/Staff:** Đăng nhập bằng email/mật khẩu, nhận JWT token. Quản trị viên quản lý người dùng và phân quyền RBAC.

---

#### **FR2. Quản lý phòng và loại phòng**

**Customer:** Xem danh sách phòng với bộ lọc. Tìm kiếm phòng theo ngày, số khách, loại phòng, giá. Xem chi tiết phòng (mô tả, tiện nghi, hình ảnh, giá).

**Admin:** Quản lý phòng và loại phòng, cập nhật trạng thái phòng.

---

#### **FR3. Quản lý đặt phòng**

**Customer:** Đặt phòng cá nhân (chọn phòng, ngày, số khách). Đặt phòng nhóm (gửi yêu cầu, chờ duyệt, upload thông tin thành viên, nhận báo giá). Xem danh sách booking, hủy booking trước hạn.

**Admin:** Quản lý booking, quản lý lịch sử booking, check-in/check-out, gia hạn check-out, duyệt đặt phòng nhóm, quản lý thông tin khách.

**Staff:** Quản lý booking, quản lý booking status, check-in/check-out, gia hạn check-out, duyệt đặt phòng nhóm, quản lý thông tin khách.

---

#### **FR4. Quản lý thanh toán và hóa đơn**

**Customer:** Thanh toán online qua Stripe Checkout. Xem lịch sử thanh toán. Xem hóa đơn, xuất hóa đơn PDF.

**Admin/Staff:** Ghi nhận thanh toán tiền mặt/chuyển khoản. Quản lý payment. Quản trị viên xử lý hoàn tiền. Tạo hóa đơn từ booking. Xuất hóa đơn PDF.

---

#### **FR5. Quản lý dịch vụ**

**Customer:** Xem danh sách dịch vụ với bộ lọc, xem chi tiết. Đặt dịch vụ kèm booking, xem danh sách dịch vụ đã đặt.

**Admin:** Quản lý catalog dịch vụ. Quản lý service bookings, chi phí tự động đồng bộ vào invoice.

**Staff:** Quản lý service bookings, chi phí tự động đồng bộ vào invoice.

---

#### **FR6. Chat real-time**

**Customer:** Chat real-time (Socket.IO) với nhân viên. Gửi tin nhắn và file, hiển thị real-time. Xem lịch sử chat với phân trang.

**Admin/Staff:** Chat real-time với khách hàng. Tự động ghép với khách hàng, gửi tin nhắn và file, hiển thị real-time. Quản lý hội thoại, cập nhật số tin nhắn chưa đọc.

---

#### **FR7. Quản lý thông báo**

Xem danh sách thông báo với phân trang và bộ lọc. Đánh dấu đã đọc, cập nhật badge số lượng chưa đọc. Tự động gửi thông báo khi có sự kiện qua Socket.IO real-time.

---

#### **FR8. Quản lý địa điểm**

**Customer:** Duyệt danh sách địa điểm du lịch với bộ lọc, xem chi tiết.

**Admin:** Quản lý địa điểm gợi ý (tạo, sửa, xóa, bật/tắt hiển thị).

---

#### **FR9. Import và Export file**

**Customer:** Import và export file (danh sách thành viên nhóm booking, thông tin khách hàng).

**Admin/Staff:** Import và export file (báo cáo, danh sách booking, thông tin khách hàng).

---

#### **FR10. Dashboard và báo cáo**

**Admin:** Xem dashboard tổng quan với biểu đồ và thống kê. Xem báo cáo chi tiết theo ngày/tuần/tháng. Xuất báo cáo ra file Excel hoặc PDF. Quản lý khách hàng.

---

#### **FR11. AI Assistant và gợi ý**

AI Assistant (Groq API) tư vấn phòng, dịch vụ và địa điểm. Gợi ý phòng/dịch vụ dựa trên sở thích và lịch sử đặt phòng.

## 3.2. PHÂN TÍCH YÊU CẦU

Sau khi xác định các yêu cầu chức năng và phi chức năng, bước tiếp theo là tiến hành phân tích chi tiết các yêu cầu này để hiểu rõ cách thức hoạt động, các ràng buộc, ngoại lệ và giải pháp kỹ thuật cần thiết. Phân tích yêu cầu giúp đảm bảo hệ thống được thiết kế và triển khai một cách chính xác, đáp ứng đầy đủ nhu cầu của người dùng và các yêu cầu kỹ thuật.

### 3.2.1. Phân tích yêu cầu chức năng

Phân tích yêu cầu chức năng tập trung vào việc mô tả chi tiết các quy trình nghiệp vụ, luồng xử lý dữ liệu, các ràng buộc và ngoại lệ của từng chức năng trong hệ thống. Mỗi chức năng được phân tích từ góc độ người dùng, nghiệp vụ và kỹ thuật để đảm bảo tính khả thi và hiệu quả.

#### **2.1.1. Chức năng đăng nhập và đăng ký**

**Customer:** Khách hàng có thể đăng ký tài khoản mới bằng cách cung cấp email, mật khẩu (tối thiểu 6 ký tự) và số điện thoại. Hệ thống sẽ kiểm tra tính duy nhất của email, validate mật khẩu, sau đó tạo tài khoản và gửi email xác thực với link kích hoạt có hiệu lực 24 giờ. Khách hàng cần xác thực email trước khi có thể đăng nhập vào hệ thống. Khi đăng nhập, hệ thống sử dụng JWT token để xác thực, tạo access token (hết hạn 24 giờ) và refresh token (hết hạn 365 ngày). Hệ thống hỗ trợ quên mật khẩu thông qua cơ chế OTP 6 số với thời gian hiệu lực 10 phút. Khách hàng có thể quản lý hồ sơ cá nhân của mình.

**Admin/Staff:** Quản trị viên và nhân viên đăng nhập bằng email và mật khẩu, nhận JWT token để truy cập hệ thống. Quản trị viên có quyền quản lý toàn bộ người dùng trong hệ thống (tạo, sửa, xóa, khóa/mở khóa tài khoản) và phân quyền RBAC (Role-Based Access Control) để kiểm soát quyền truy cập vào các chức năng của hệ thống.

#### **2.1.2. Chức năng quản lý phòng**

**Customer:** Khách hàng có thể xem danh sách phòng với các bộ lọc (loại phòng, giá, tiện nghi). Hệ thống hỗ trợ tìm kiếm phòng theo ngày check-in/check-out, số lượng khách, loại phòng và khoảng giá. Khi tìm kiếm, hệ thống tự động kiểm tra tính khả dụng dựa trên các booking hiện có và chỉ hiển thị những phòng còn trống trong khoảng thời gian yêu cầu. Khách hàng có thể xem chi tiết phòng bao gồm mô tả, tiện nghi, hình ảnh và giá được lấy từ loại phòng tương ứng.

**Admin:** Quản trị viên có quyền quản lý toàn bộ phòng và loại phòng trong hệ thống. Có thể tạo, sửa, xóa phòng và loại phòng, cập nhật thông tin như giá, sức chứa, tiện nghi. Quản trị viên có thể cập nhật trạng thái phòng theo các trạng thái nghiệp vụ: available (có sẵn), booked (đã đặt), maintenance (bảo trì), checked_in (đã check-in), occupied (đang sử dụng), unavailable (không khả dụng) để phản ánh tình trạng thực tế của phòng.

#### **2.1.3. Chức năng quản lý đặt phòng**

**Customer:** Khách hàng có thể đặt phòng cá nhân bằng cách chọn phòng, ngày check-in/check-out và số lượng khách. Hệ thống tự động kiểm tra tính khả dụng của phòng và tính toán tổng giá. Khách hàng cũng có thể đặt phòng nhóm bằng cách gửi yêu cầu với thông tin số người, số phòng và khoảng thời gian lưu trú. Sau khi yêu cầu được duyệt, khách hàng upload thông tin thành viên (file Excel) và nhận báo giá từ nhân viên. Khách hàng có thể xem danh sách booking của mình và hủy booking trước hạn (nếu chính sách cho phép).

**Admin:** Quản trị viên có quyền quản lý toàn bộ booking trong hệ thống, bao gồm xem danh sách, xem chi tiết, cập nhật trạng thái booking. Quản trị viên có thể xem và quản lý lịch sử booking để theo dõi các giao dịch đã hoàn thành. Quản trị viên thực hiện check-in/check-out khách, gia hạn thời gian check-out nếu cần, duyệt đặt phòng nhóm và phân bổ phòng cụ thể cho đoàn. Quản trị viên cũng quản lý thông tin khách hàng đi kèm booking.

**Staff:** Nhân viên có quyền quản lý booking và cập nhật booking status theo các trạng thái nghiệp vụ (pending, confirmed, checked_in, checked_out, cancelled). Nhân viên thực hiện check-in/check-out khách, gia hạn thời gian check-out, duyệt đặt phòng nhóm và tạo báo giá cho group booking. Nhân viên cũng quản lý thông tin khách hàng đi kèm booking.

---

#### **2.1.4. Chức năng quản lý thanh toán và hóa đơn**

**Customer:** Khách hàng có thể thanh toán online qua Stripe Checkout khi đặt phòng. Hệ thống tạo Stripe checkout session và redirect khách hàng đến trang thanh toán của Stripe. Sau khi thanh toán thành công, hệ thống tự động tạo booking, invoice và payment record. Khách hàng có thể xem lịch sử thanh toán của mình, xem hóa đơn và xuất hóa đơn PDF.

**Admin:** Quản trị viên có thể ghi nhận thanh toán tiền mặt hoặc chuyển khoản bằng cách tạo payment record với thông tin giao dịch. Quản trị viên quản lý toàn bộ payment trong hệ thống, cập nhật trạng thái thanh toán và xử lý hoàn tiền khi cần thiết. Quản trị viên có thể tạo hóa đơn từ booking và xuất hóa đơn PDF.

---

#### **2.1.5. Chức năng quản lý dịch vụ**

**Customer:** Khách hàng có thể xem danh sách dịch vụ với bộ lọc theo loại và giá, xem chi tiết từng dịch vụ bao gồm mô tả, giá cả và thời gian phục vụ. Khách hàng có thể đặt dịch vụ kèm theo booking và xem danh sách dịch vụ đã đặt của mình. Chi phí dịch vụ tự động được đồng bộ vào invoice của booking.

**Admin:** Quản trị viên có quyền quản lý toàn bộ catalog dịch vụ, bao gồm tạo mới, chỉnh sửa và xóa dịch vụ. Quản trị viên quản lý service bookings, cập nhật trạng thái và đảm bảo chi phí tự động đồng bộ vào invoice.

**Staff:** Nhân viên quản lý service bookings, cập nhật trạng thái dịch vụ và đảm bảo chi phí tự động đồng bộ vào invoice.

---

#### **2.1.6. Chức năng quản lý chat**

**Customer:** Khách hàng có thể chat real-time với nhân viên thông qua Socket.IO. Hệ thống tự động ghép khách hàng với nhân viên đang online. Khách hàng có thể gửi tin nhắn và file, xem lịch sử chat với phân trang.

**Admin/Staff:** Quản trị viên và nhân viên có thể chat real-time với khách hàng. Hệ thống tự động ghép với khách hàng, cho phép gửi tin nhắn và file. Quản trị viên và nhân viên quản lý hội thoại, cập nhật số tin nhắn chưa đọc và đánh dấu tin nhắn đã đọc.

---

#### **2.1.7. Chức năng quản lý địa điểm**

**Customer:** Khách hàng có thể duyệt danh sách địa điểm du lịch với bộ lọc theo loại và khoảng cách, xem thông tin chi tiết bao gồm mô tả, hình ảnh, vị trí trên bản đồ và thời gian mở cửa.

**Admin:** Quản trị viên có quyền quản lý địa điểm gợi ý, bao gồm tạo mới, chỉnh sửa, xóa và bật/tắt hiển thị các địa điểm để đảm bảo thông tin luôn cập nhật và chính xác.

---

#### **2.1.8. Chức năng Import và Export file**

**Customer:** Khách hàng có thể import và export file, đặc biệt là danh sách thành viên nhóm booking (file Excel) khi đặt phòng nhóm. Hệ thống cung cấp template Excel mẫu với các cột thông tin cần thiết như họ tên, số CMND/CCCD, ngày sinh, số điện thoại, email và số phòng phân bổ. Khách hàng có thể tải template này, điền thông tin thành viên và upload lại để hệ thống tự động nhập dữ liệu. Khách hàng cũng có thể export danh sách thành viên đã nhập để chỉnh sửa hoặc lưu trữ. Hệ thống hỗ trợ nhiều định dạng ngày tháng và tự động validate dữ liệu khi import.

**Admin/Staff:** Quản trị viên và nhân viên có thể import và export file để phục vụ công tác quản lý và phân tích. Họ có thể export báo cáo chi tiết về booking, thanh toán, doanh thu ra file Excel hoặc PDF với các bộ lọc tùy chọn. Hệ thống cho phép export danh sách booking theo khoảng thời gian, trạng thái hoặc khách hàng cụ thể. Quản trị viên và nhân viên cũng có thể export thông tin khách hàng để phân tích, marketing hoặc lưu trữ. Ngoài ra, họ có thể import danh sách khách hàng từ file Excel để nhập hàng loạt thông tin vào hệ thống, giúp tiết kiệm thời gian và công sức.

---

#### **2.1.9. Chức năng gợi ý địa điểm du lịch, dịch vụ**

**Customer:** Hệ thống tích hợp AI Assistant (Groq API) để tư vấn phòng, dịch vụ và địa điểm du lịch cho khách hàng. AI phân tích câu hỏi và đưa ra các gợi ý phù hợp. Hệ thống còn có khả năng gợi ý phòng và dịch vụ dựa trên sở thích và lịch sử đặt phòng của người dùng.

---

#### **2.1.10. Chức năng thống kê**

**Admin:** Quản trị viên có thể xem dashboard tổng quan với các biểu đồ và thống kê về tình hình đặt phòng, công suất phòng, doanh thu và các chỉ số quan trọng khác như tỷ lệ hủy booking, số lượng khách, nguồn kênh đặt phòng. Dashboard hiển thị các biểu đồ xu hướng theo thời gian, giúp quản trị viên phân tích và đưa ra quyết định kinh doanh. Quản trị viên có thể xem báo cáo chi tiết theo ngày, tuần hoặc tháng với các bộ lọc tùy chọn (theo loại phòng, kênh đặt phòng, trạng thái booking). Hệ thống cho phép xuất báo cáo ra file Excel hoặc PDF để lưu trữ, in ấn hoặc chia sẻ với các bên liên quan. Quản trị viên cũng có quyền quản lý khách hàng trong hệ thống, bao gồm xem danh sách khách hàng, xem chi tiết thông tin và lịch sử đặt phòng của từng khách hàng, cập nhật thông tin khách hàng khi cần thiết.

---

### 3.2.2. Phân tích yêu cầu phi chức năng

Phân tích yêu cầu phi chức năng tập trung vào các khía cạnh kỹ thuật và chất lượng của hệ thống, bao gồm hiệu suất, bảo mật, khả năng mở rộng, độ tin cậy, khả năng sử dụng, khả năng bảo trì, tích hợp và tương thích. Mỗi yêu cầu phi chức năng được phân tích từ góc độ vấn đề, giải pháp và các metrics để đảm bảo hệ thống đáp ứng đầy đủ các tiêu chuẩn chất lượng.

#### **Phân tích hiệu suất**

Hệ thống cần xử lý nhiều request đồng thời từ nhiều người dùng, do đó hiệu suất là một yêu cầu quan trọng. Database queries có thể chậm nếu không được tối ưu, đặc biệt là khi dữ liệu tăng lên. Các tính năng real-time như chat và notifications cần có latency thấp để đảm bảo trải nghiệm người dùng tốt. Để giải quyết các vấn đề này, hệ thống sử dụng MongoDB indexing cho các trường thường xuyên được truy vấn như roomId, customerId, status và dates. Hệ thống cũng implement caching cho dữ liệu ít thay đổi như room types và services, sử dụng connection pooling cho database, implement pagination cho danh sách dài, optimize images với compression và lazy loading, và code splitting cho frontend để giảm bundle size. Các metrics được theo dõi bao gồm API response time được monitor bằng APM tools, database query time với việc log các slow queries trên 200ms, và real-time message latency được monitor qua Socket.IO events.

---

#### **Phân tích bảo mật**

Bảo mật là một trong những yêu cầu quan trọng nhất của hệ thống do phải xử lý nhiều dữ liệu nhạy cảm như mật khẩu, thông tin khách hàng và thông tin thanh toán. API endpoints cần được bảo vệ khỏi unauthorized access, và input từ người dùng có thể chứa malicious code cần được xử lý cẩn thận. Để đảm bảo bảo mật, hệ thống hash mật khẩu bằng bcrypt với ít nhất 10 salt rounds, sử dụng JWT token với thời gian hết hạn (15 phút cho access token, 7 ngày cho refresh token), áp dụng RBAC middleware để kiểm tra quyền truy cập, validate và sanitize tất cả user input, áp dụng rate limiting cho API endpoints với giới hạn 100 requests/phút/user, sử dụng HTTPS cho tất cả communications, không lưu trữ thông tin thẻ tín dụng mà sử dụng Stripe để xử lý, và cấu hình CORS để chỉ cho phép frontend domain. Các best practices bao gồm không log sensitive data như mật khẩu và token, sử dụng environment variables cho secrets, và thường xuyên cập nhật dependencies.

---

#### **Phân tích khả năng mở rộng**

Hệ thống được thiết kế với khả năng mở rộng để đáp ứng nhu cầu phát triển trong tương lai. Khi số lượng người dùng tăng, hệ thống có thể cần mở rộng, và database cũng có thể cần scale khi dữ liệu tăng. Để đảm bảo khả năng mở rộng, hệ thống sử dụng kiến trúc microservices-ready với việc tách biệt frontend và backend, hỗ trợ horizontal scaling bằng cách deploy nhiều backend instances và sử dụng load balancer, database scaling thông qua MongoDB sharding khi cần, stateless API không lưu session state trên server mà sử dụng JWT, và CDN cho static assets như images, CSS và JS. Trong tương lai, hệ thống có thể tách chat service thành microservice riêng, tách email service thành microservice riêng, và sử dụng message queue như RabbitMQ hoặc Redis cho các async tasks.

---

#### **Phân tích độ tin cậy**

Hệ thống cần hoạt động 24/7 với độ tin cậy cao, nhưng lỗi có thể xảy ra ở bất kỳ đâu như network, database hoặc third-party services. Để đảm bảo độ tin cậy, hệ thống sử dụng error handling với global error handler và try-catch blocks, logging với Winston hoặc công cụ tương tự để log errors, monitoring với health check endpoints và uptime monitoring, retry mechanism để retry các failed requests như email và payment webhooks, database backup hàng ngày tự động, và graceful degradation với fallback khi third-party services down như AI và email. Chiến lược disaster recovery bao gồm backup strategy với daily backups và retain 30 ngày, restore procedure được documented và tested, và failover với multiple server instances và auto-failover.

#### **Phân tích khả năng sử dụng**

Giao diện người dùng phải thân thiện và dễ sử dụng để đảm bảo trải nghiệm tốt cho người dùng. Hệ thống sử dụng responsive design hỗ trợ mobile, tablet và desktop, UI/UX hiện đại và nhất quán, và hỗ trợ đầy đủ tiếng Việt. Trải nghiệm người dùng được tối ưu với loading states cho các thao tác, toast notifications để phản hồi người dùng, và form validation real-time để giúp người dùng nhập liệu chính xác. Tất cả các tính năng được thiết kế với nguyên tắc đơn giản, trực quan và dễ hiểu.

#### **Phân tích khả năng bảo trì**

Code phải dễ đọc và bảo trì để đảm bảo hệ thống có thể được phát triển và cập nhật một cách hiệu quả. Hệ thống sử dụng TypeScript cho type safety, tổ chức code theo module để dễ quản lý, và có đầy đủ comments và documentation. Code được test đầy đủ với unit tests cho business logic, integration tests cho API endpoints, và đạt test coverage ít nhất 70% để đảm bảo chất lượng. Các best practices về code organization, naming conventions và code review được áp dụng để đảm bảo tính nhất quán và chất lượng code.

#### **Phân tích tích hợp**

Hệ thống tích hợp với nhiều dịch vụ bên thứ ba để cung cấp các tính năng nâng cao. Tích hợp Stripe payment gateway hỗ trợ thanh toán online với VND currency, xử lý webhook cho payment events, và sử dụng idempotency để tránh thanh toán trùng lặp. Tích hợp email service để gửi email xác thực, OTP và hóa đơn với HTML email templates và cơ chế retry cho các email thất bại. Tích hợp Groq AI service cho chat assistant với API key được bảo mật, fallback responses khi API lỗi, và rate limiting cho các AI requests. Tất cả các tích hợp đều được thiết kế với error handling và fallback mechanisms để đảm bảo hệ thống hoạt động ổn định ngay cả khi các dịch vụ bên thứ ba gặp sự cố.

#### **Phân tích tương thích**

Hệ thống phải tương thích với các trình duyệt phổ biến và nhiều kích thước màn hình khác nhau để đảm bảo trải nghiệm nhất quán cho mọi người dùng. Hệ thống tương thích với các trình duyệt phổ biến bao gồm Chrome, Firefox, Safari và Edge (phiên bản mới nhất và một phiên bản trước đó), cũng như các trình duyệt mobile như iOS Safari và Chrome Mobile. Hệ thống cũng hoạt động tốt trên nhiều kích thước màn hình khác nhau, bao gồm desktop (1920x1080, 1366x768), tablet (768x1024, 1024x768) và mobile (375x667, 414x896), đảm bảo trải nghiệm nhất quán trên mọi thiết bị. Responsive design được áp dụng để tự động điều chỉnh layout theo kích thước màn hình.

---

### 3.2.3. Phân tích rủi ro và giảm thiểu

#### **Rủi ro về dữ liệu**

**Rủi ro:**
- Mất dữ liệu do lỗi hệ thống hoặc tấn công
- Dữ liệu không nhất quán giữa các services

**Giảm thiểu:**
- Database backup hàng ngày
- Transaction cho các operations quan trọng (booking + payment)
- Validation và constraints ở database level

---

#### **Rủi ro về bảo mật**

**Rủi ro:**
- Tấn công DDoS
- SQL injection, XSS attacks
- Unauthorized access

**Giảm thiểu:**
- Rate limiting
- Input validation và sanitization
- RBAC và JWT authentication
- HTTPS và secure headers

---

#### **Rủi ro về tích hợp**

**Rủi ro:**
- Stripe API down → Không thể thanh toán
- Email service down → Không gửi được email
- Groq AI API down → AI chat không hoạt động

**Giảm thiểu:**
- Retry mechanism với exponential backoff
- Fallback options (queue emails, manual payment processing)
- Graceful degradation (AI chat fallback to FAQ)
- Monitoring third-party services

---

#### **Rủi ro về hiệu suất**

**Rủi ro:**
- Database queries chậm khi dữ liệu tăng
- Server overload khi có nhiều concurrent users

**Giảm thiểu:**
- Database indexing
- Caching
- Load balancing
- Horizontal scaling
- Query optimization

---

### 3.2.4. Phân tích dependencies và constraints

#### **Dependencies**

**Technical dependencies:**
- Node.js runtime
- MongoDB database
- Stripe payment gateway
- Gmail SMTP (hoặc email service khác)
- Groq AI API (optional)

**Third-party libraries:**
- Express.js, Socket.IO, Mongoose, JWT, bcrypt, etc.

**Infrastructure:**
- Server hosting (VPS, cloud)
- Domain và SSL certificate
- CDN (optional)

---

#### **Constraints**

**Business constraints:**
- Budget: Chi phí hosting, third-party services
- Timeline: Deadline của dự án
- Resources: Số lượng developers

**Technical constraints:**
- Browser compatibility
- Device compatibility
- Network latency
- Third-party API rate limits

**Regulatory constraints:**
- GDPR compliance (nếu có users từ EU)
- Data protection laws
- Payment regulations

---

### 3.2.5. Phân tích stakeholders và use cases

#### **Stakeholders**

**Primary stakeholders:**
- **Khách hàng (Customer):** Người đặt phòng, sử dụng website
- **Nhân viên (Staff):** Xử lý bookings, hỗ trợ khách hàng
- **Quản trị viên (Admin):** Quản lý toàn bộ hệ thống

**Secondary stakeholders:**
- **Developers:** Phát triển và maintain hệ thống
- **Management:** Quản lý dự án và business decisions

---

#### **Use Cases Priority**

**High priority (Must have):**
- Authentication (đăng ký, đăng nhập)
- Room management (xem, tìm kiếm phòng)
- Booking management (đặt phòng, quản lý booking)
- Payment (Stripe, tiền mặt, chuyển khoản)
- Dashboard (cho Staff/Admin)

**Medium priority (Should have):**
- Chat real-time
- Notifications
- Service management
- Invoice management
- Reports và statistics

**Low priority (Nice to have):**
- AI assistant
- Location management
- Advanced analytics
- Multi-language support

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - ĐĂNG KÝ VÀ ĐĂNG NHẬP

### Bảng 1: Mô tả chức năng Đăng ký và Đăng nhập

| Tên usecase | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **UC1. Đăng ký tài khoản** | Customer | Họ tên, Email (chưa tồn tại trong hệ thống), Mật khẩu (tối thiểu 6 ký tự), Số điện thoại, Ngày sinh (tùy chọn), Sở thích (tùy chọn) | Tài khoản được tạo thành công, Email xác thực được gửi đến địa chỉ email đã đăng ký, Trạng thái `emailVerified: false`, `isActive: true`, Token xác thực email (hiệu lực 24 giờ) | Khách hàng điền form đăng ký với thông tin cá nhân. Hệ thống kiểm tra tính duy nhất của email và số điện thoại, validate mật khẩu đáp ứng yêu cầu bảo mật. Sau đó hệ thống hash mật khẩu bằng bcrypt, tạo tài khoản mới và gửi email xác thực với link kích hoạt có hiệu lực 24 giờ. Khách hàng cần xác thực email trước khi có thể đăng nhập. |
| **UC2. Đăng nhập** | Customer, Staff, Admin | Email, Mật khẩu | JWT access token (hết hạn 24 giờ), JWT refresh token (hết hạn 365 ngày), Thông tin người dùng (id, email, role, fullName) | Người dùng nhập email và mật khẩu. Hệ thống tìm user trong database, so sánh mật khẩu đã hash bằng bcrypt, kiểm tra tài khoản chưa bị khóa và email đã được xác thực (đối với customer). Sau khi xác thực thành công, hệ thống tạo JWT tokens để người dùng có thể truy cập các API và tính năng của hệ thống. |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - QUẢN LÝ PHÒNG VÀ LOẠI PHÒNG

### Bảng 2: Mô tả chức năng Quản lý phòng và loại phòng

| Tên usecase | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **UC1. Quản lý phòng** | Customer, Admin | **Customer:** Bộ lọc (loại phòng, trạng thái, giá - tùy chọn) hoặc Ngày check-in, Ngày check-out, Số lượng khách, Loại phòng, Khoảng giá (cho tìm kiếm) hoặc Room ID (cho xem chi tiết)<br>**Admin:** JWT token với role Admin, Thông tin phòng (số phòng, loại phòng, trạng thái, tiện nghi) hoặc Thông tin loại phòng (tên, mô tả, giá/đêm, sức chứa, tiện nghi), Room ID hoặc Room Type ID (cho sửa/xóa), Trạng thái mới (cho cập nhật trạng thái) | **Customer:** Danh sách phòng với thông tin cơ bản (số phòng, loại, giá, trạng thái, hình ảnh) hoặc Danh sách phòng còn trống phù hợp với tiêu chí, Tổng giá theo số đêm (cho tìm kiếm) hoặc Thông tin đầy đủ về phòng (mô tả, tiện nghi, hình ảnh, giá, sức chứa, trạng thái) (cho xem chi tiết)<br>**Admin:** Phòng hoặc loại phòng được tạo/sửa/xóa thành công, Danh sách được cập nhật, Giá tự động cập nhật cho tất cả phòng thuộc loại, Trạng thái phòng được cập nhật | **Customer:** Khách hàng có thể xem danh sách phòng với bộ lọc, tìm kiếm phòng theo ngày check-in/check-out, số khách, loại phòng và giá. Hệ thống kiểm tra tính khả dụng dựa trên booking hiện có và hiển thị danh sách phòng còn trống cùng với tổng giá. Khách hàng có thể xem chi tiết phòng bao gồm mô tả, tiện nghi, hình ảnh và giá.<br>**Admin:** Quản trị viên có quyền tạo, sửa và xóa phòng cũng như loại phòng, cập nhật trạng thái phòng. Hệ thống kiểm tra số phòng duy nhất, validate loại phòng, tự động gán tiện nghi và cập nhật giá. Không thể xóa phòng nếu có booking liên quan, không thể xóa loại phòng nếu còn phòng đang sử dụng. |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - QUẢN LÝ ĐẶT PHÒNG

### Bảng 3: Mô tả chức năng Quản lý đặt phòng

| Tên usecase | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **UC1. Quản lý đặt phòng** | Customer, Staff, Admin | **Customer:** JWT token, Phòng, Ngày check-in/check-out, Số khách, Thông tin khách (đặt phòng cá nhân) hoặc Số người, Số phòng, Ngày check-in/check-out (đặt phòng nhóm) hoặc Booking ID (xem/hủy)<br>**Admin:** JWT token (Admin), Booking ID, Bộ lọc, Trạng thái, Thời gian gia hạn, Quyết định duyệt, Giá phòng, Thông tin khách<br>**Staff:** JWT token (Staff), Booking ID, Bộ lọc, Trạng thái, Thời gian gia hạn, Quyết định duyệt, Giá phòng, Thông tin khách | **Customer:** Booking được tạo, Phòng booked, Stripe checkout, Email xác nhận (đặt phòng cá nhân) hoặc Group booking pending_approval (đặt phòng nhóm) hoặc Booking hủy, Phòng giải phóng (hủy) hoặc Danh sách booking (xem)<br>**Admin:** Danh sách bookings, Thông tin booking, Trạng thái cập nhật, Check-in/check-out, Gia hạn, Duyệt đặt phòng nhóm, Báo giá, Thông tin khách<br>**Staff:** Tương tự Admin (không có lịch sử booking) | **Customer:** Đặt phòng cá nhân, đặt phòng nhóm, xem danh sách booking, hủy booking.<br>**Admin:** Quản lý booking, xem lịch sử booking, cập nhật trạng thái, check-in/check-out, gia hạn, duyệt đặt phòng nhóm, tạo báo giá, quản lý thông tin khách.<br>**Staff:** Quản lý booking và booking status, check-in/check-out, gia hạn, duyệt đặt phòng nhóm, tạo báo giá, quản lý thông tin khách. |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - THANH TOÁN VÀ HÓA ĐƠN

### Bảng 4: Mô tả chức năng Thanh toán và hóa đơn

| Tên usecase | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **UC1. Quản lý thanh toán và hóa đơn** | Customer, Staff, Admin | **Customer:** JWT token, Booking ID, Thông tin thẻ (cho thanh toán online) hoặc Booking ID/Invoice ID (cho xem hóa đơn, xuất PDF)<br>**Admin:** JWT token (Admin), Booking ID, Số tiền, Mã tham chiếu (cho thanh toán tiền mặt/chuyển khoản) hoặc Payment ID, Trạng thái mới (cho cập nhật) hoặc Payment ID (cho hoàn tiền) hoặc Booking ID/Group Booking ID (cho tạo hóa đơn) hoặc Bộ lọc (cho quản lý)<br>**Staff:** JWT token (Staff), Booking ID, Số tiền, Mã tham chiếu (cho thanh toán) hoặc Payment ID, Trạng thái mới (cho cập nhật) hoặc Booking ID (cho tạo hóa đơn) hoặc Bộ lọc (cho quản lý) | **Customer:** Stripe checkout session, Redirect đến Stripe, Payment record được tạo, Booking/Invoice cập nhật, Email xác nhận (cho thanh toán online) hoặc Danh sách payments (cho xem lịch sử) hoặc File PDF hóa đơn (cho xuất PDF)<br>**Admin:** Payment record được tạo, Payment/Booking/Invoice cập nhật, Thông báo real-time (cho thanh toán) hoặc Payment status cập nhật (cho cập nhật) hoặc Payment refunded (cho hoàn tiền) hoặc Invoice được tạo (cho tạo hóa đơn) hoặc Danh sách payments/invoices (cho quản lý)<br>**Staff:** Tương tự Admin | **Customer:** Thanh toán online qua Stripe Checkout, xem lịch sử thanh toán, xem hóa đơn và xuất hóa đơn PDF.<br>**Admin:** Ghi nhận thanh toán tiền mặt/chuyển khoản, quản lý payment, cập nhật trạng thái thanh toán, xử lý hoàn tiền, tạo hóa đơn từ booking, xuất hóa đơn PDF.<br>**Staff:** Ghi nhận thanh toán tiền mặt/chuyển khoản, quản lý payment, cập nhật trạng thái thanh toán, tạo hóa đơn từ booking. |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - QUẢN LÝ DỊCH VỤ

### Bảng 5: Mô tả chức năng Quản lý dịch vụ

| Tên usecase | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **UC1. Quản lý dịch vụ** | Customer, Staff, Admin | **Customer:** Bộ lọc (loại, giá - tùy chọn) hoặc Service ID (cho xem chi tiết) hoặc JWT token, Booking ID, Service ID, Số lượng, Thời gian phục vụ (cho đặt dịch vụ) hoặc JWT token (cho xem danh sách dịch vụ đã đặt)<br>**Admin:** JWT token (Admin), Thông tin dịch vụ (tên, mô tả, giá, đơn vị, loại, lịch phục vụ, điều kiện) hoặc Service ID (cho sửa/xóa) hoặc Bộ lọc (cho quản lý service bookings) hoặc Service Booking ID, Trạng thái mới (cho cập nhật)<br>**Staff:** JWT token (Staff), Bộ lọc (cho quản lý service bookings) hoặc Service Booking ID, Trạng thái mới (cho cập nhật) | **Customer:** Danh sách dịch vụ với thông tin cơ bản (tên, loại, giá, hình ảnh) hoặc Thông tin đầy đủ về dịch vụ (cho xem chi tiết) hoặc Service booking được tạo, Trạng thái requested, Chi phí được tính, Thông báo (cho đặt dịch vụ) hoặc Danh sách service bookings gắn với booking (cho xem đã đặt)<br>**Admin:** Dịch vụ được tạo/sửa/xóa thành công, Catalog được cập nhật (cho quản lý catalog) hoặc Danh sách service bookings, Trạng thái cập nhật, Chi phí đồng bộ vào invoice (cho quản lý service bookings)<br>**Staff:** Tương tự Admin (cho quản lý service bookings) | **Customer:** Xem danh sách dịch vụ với bộ lọc, xem chi tiết dịch vụ, đặt dịch vụ kèm booking, xem danh sách dịch vụ đã đặt.<br>**Admin:** Quản lý catalog dịch vụ (tạo, sửa, xóa), quản lý service bookings, cập nhật trạng thái, chi phí tự động đồng bộ vào invoice.<br>**Staff:** Quản lý service bookings, cập nhật trạng thái, chi phí tự động đồng bộ vào invoice. |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - CHAT

### Bảng 6: Mô tả chức năng Chat

| Tên usecase | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **UC1. Quản lý chat** | Customer, Staff, Admin | **Customer:** JWT token (cho mở chat) hoặc JWT token, Conversation ID, Nội dung tin nhắn, File đính kèm (tùy chọn - cho gửi tin nhắn) hoặc JWT token, Conversation ID, Phân trang (cho xem lịch sử)<br>**Admin:** JWT token (Admin), Conversation ID, Hành động (cho quản lý hội thoại) hoặc Conversation ID, Booking ID (cho gắn với booking) hoặc Conversation ID (cho đánh dấu đã đọc)<br>**Staff:** JWT token (Staff), Conversation ID, Hành động (cho quản lý hội thoại) hoặc Conversation ID, Booking ID (cho gắn với booking) hoặc Conversation ID (cho đánh dấu đã đọc) | **Customer:** Conversation được tạo, Tự động ghép với staff online, Socket.IO connection được thiết lập (cho mở chat) hoặc Tin nhắn được lưu, Broadcast qua Socket.IO, Unread count cập nhật (cho gửi tin nhắn) hoặc Danh sách tin nhắn với phân trang (cho xem lịch sử)<br>**Admin:** Conversation được quản lý, Tham gia/thoát room, Chọn conversation, Cập nhật số tin nhắn chưa đọc, Conversation liên kết với booking<br>**Staff:** Tương tự Admin | **Customer:** Chat real-time với nhân viên, gửi tin nhắn và file, xem lịch sử chat với phân trang.<br>**Admin:** Chat real-time với khách hàng, tự động ghép với khách hàng, gửi tin nhắn và file, quản lý hội thoại, cập nhật số tin nhắn chưa đọc, gắn cuộc trò chuyện với booking.<br>**Staff:** Chat real-time với khách hàng, tự động ghép với khách hàng, gửi tin nhắn và file, quản lý hội thoại, cập nhật số tin nhắn chưa đọc, gắn cuộc trò chuyện với booking. |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - QUẢN LÝ THÔNG BÁO

### Bảng 7: Mô tả chức năng Quản lý thông báo

| Tên chức năng | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **Quản lý thông báo** | Customer, Staff, Admin, System | - **Xem thông báo**: JWT token hợp lệ, Bộ lọc (loại, trạng thái, thời gian), Phân trang<br>- **Đếm thông báo chưa đọc**: JWT token hợp lệ<br>- **Đánh dấu đã đọc**: JWT token hợp lệ, Notification ID (một hoặc nhiều)<br>- **Gửi thông báo thủ công**: JWT token với role Staff/Admin, Thông tin thông báo (tiêu đề, nội dung, người nhận/nhóm), Loại thông báo<br>- **Cấu hình kênh/ưu tiên**: JWT token với role Admin, Cấu hình kênh (in-app, email), Mức ưu tiên<br>- **Quản lý template thông báo**: JWT token với role Admin, Template thông báo, Loại thông báo, TTL, Chính sách retry | - **Xem thông báo**: Danh sách thông báo với phân trang (booking, payments, group bookings, chat…), Bộ lọc theo loại và trạng thái<br>- **Đếm thông báo chưa đọc**: Tổng số thông báo chưa đọc được trả về, Badge được cập nhật real-time<br>- **Đánh dấu đã đọc**: Trạng thái đã đọc được cập nhật, Badge được giảm, Thời điểm đã đọc được ghi nhận<br>- **Gửi thông báo thủ công**: Thông báo được gửi đến người dùng/nhóm, Thông báo được lưu vào database, Thông báo real-time qua Socket.IO (nếu người dùng online)<br>- **Gửi thông báo hệ thống**: Thông báo tự động được tạo và gửi khi có sự kiện, Thông báo được lưu vào database<br>- **Realtime notifications**: Thông báo được nhận qua Socket.IO, UI tự động update, Fallback polling khi mất kết nối<br>- **Cấu hình kênh/ưu tiên**: Cấu hình được lưu, Áp dụng cho các thông báo mới<br>- **Quản lý template**: Template được tạo/sửa/xóa, Cấu hình TTL và retry được cập nhật, Loại thông báo được bật/tắt | Hệ thống cung cấp đầy đủ các chức năng quản lý thông báo: **Xem thông báo** (người dùng xem danh sách thông báo liên quan đến booking, payments, group bookings, chat và các hoạt động khác với phân trang và bộ lọc theo loại, trạng thái, thời gian); **Đếm thông báo chưa đọc** (API trả về tổng số thông báo chưa đọc để hiển thị badge trên thanh điều hướng, cập nhật real-time qua Socket.IO); **Đánh dấu đã đọc** (người dùng đánh dấu một hoặc nhiều thông báo đã đọc, hệ thống cập nhật badge và thời điểm đã đọc, cập nhật real-time); **Gửi thông báo thủ công** (staff/admin gửi thông báo thủ công đến một người dùng cụ thể hoặc một nhóm người dùng theo vai trò, thông báo được lưu vào database, gửi real-time qua Socket.IO nếu người dùng đang online, hoặc lưu lại để hiển thị khi người dùng đăng nhập lại); **Gửi thông báo hệ thống (tự động)** (hệ thống tự động tạo và gửi thông báo khi có các sự kiện quan trọng như booking được xác nhận, thanh toán thành công, check-in hoặc check-out, hủy booking, payment cập nhật, thông báo được lưu vào database và gửi real-time nếu người dùng online); **Realtime notifications** (người dùng nhận thông báo qua Socket.IO real-time, UI tự động update, nếu mất kết nối thì fallback sang polling để lấy thông báo mới); **Cấu hình kênh/ưu tiên** (admin cấu hình loại/kênh thông báo như in-app, email nếu bật, theo mức ưu tiên, cấu hình được áp dụng cho các thông báo mới); **Quản lý template thông báo** (admin quản lý template và loại thông báo, cấu hình TTL (time to live), chính sách retry, bật/tắt từng loại thông báo để kiểm soát việc gửi thông báo). |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - QUẢN LÝ ĐỊA ĐIỂM

### Bảng 8: Mô tả chức năng Quản lý địa điểm

| Tên usecase | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **UC1. Quản lý địa điểm** | Customer, Admin | **Customer:** Bộ lọc (loại, khoảng cách - tùy chọn) hoặc Từ khóa, Khoảng cách, Bộ lọc nâng cao (cho tìm kiếm) hoặc Location ID (cho xem chi tiết)<br>**Admin:** JWT token với role Admin, Thông tin địa điểm (tên, mô tả, loại, vị trí, hình ảnh, thời gian mở cửa, gợi ý di chuyển) hoặc Location ID (cho sửa/xóa), Trạng thái hiển thị (cho bật/tắt) | **Customer:** Danh sách địa điểm với thông tin cơ bản (tên, loại, khoảng cách, hình ảnh) hoặc Danh sách địa điểm phù hợp với từ khóa và bộ lọc, Sắp xếp theo khoảng cách (cho tìm kiếm) hoặc Thông tin đầy đủ về địa điểm (mô tả, hình ảnh, vị trí trên bản đồ, thời gian mở cửa, gợi ý di chuyển) (cho xem chi tiết)<br>**Admin:** Địa điểm được tạo/sửa/xóa thành công, Catalog được cập nhật, Trạng thái hiển thị được cập nhật | **Customer:** Duyệt danh sách địa điểm du lịch với bộ lọc, tìm kiếm địa điểm theo tên, loại hoặc khoảng cách, xem chi tiết địa điểm bao gồm mô tả, hình ảnh, vị trí trên bản đồ, thời gian mở cửa và gợi ý di chuyển.<br>**Admin:** Quản trị viên có quyền tạo, sửa và xóa địa điểm, bật/tắt hiển thị địa điểm. Hệ thống validate thông tin địa điểm, lưu tọa độ vị trí và cập nhật catalog. |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - IMPORT VÀ EXPORT FILE

### Bảng 9: Mô tả chức năng Import và Export file

| Tên usecase | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **UC1. Quản lý Import và Export file** | Customer, Staff, Admin | **Customer:** JWT token, File Excel (cho import) hoặc Group Booking ID (cho export)<br>**Admin:** JWT token (Admin), Loại báo cáo, Bộ lọc, Định dạng (Excel/PDF) (cho export) hoặc File Excel (cho import)<br>**Staff:** JWT token (Staff), Loại báo cáo, Bộ lọc, Định dạng (Excel) (cho export) hoặc File Excel (cho import) | **Customer:** Template Excel được tải về hoặc Danh sách thành viên được import/export thành công<br>**Admin:** File Excel/PDF báo cáo được tạo và tải về hoặc Danh sách được import thành công<br>**Staff:** Tương tự Admin (chỉ export Excel) | **Customer:** Import và export danh sách thành viên nhóm booking (file Excel). Hệ thống cung cấp template Excel mẫu, validate dữ liệu khi import.<br>**Admin:** Export báo cáo booking, thanh toán, doanh thu ra file Excel/PDF với bộ lọc. Export danh sách booking/khách hàng. Import danh sách khách hàng từ file Excel.<br>**Staff:** Export báo cáo và danh sách booking/khách hàng ra file Excel. Import danh sách khách hàng từ file Excel. |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - GỢI Ý ĐỊA ĐIỂM DU LỊCH, DỊCH VỤ

### Bảng 10: Mô tả chức năng Gợi ý địa điểm du lịch, dịch vụ

| Tên usecase | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **UC1. Gợi ý địa điểm du lịch, dịch vụ** | Customer | JWT token, Câu hỏi về phòng/dịch vụ/địa điểm (cho chat với AI) hoặc Lịch sử đặt phòng, Sở thích người dùng (tùy chọn - cho gợi ý theo sở thích) | Câu trả lời từ AI về phòng/dịch vụ/địa điểm, Gợi ý phù hợp, Fallback response nếu API lỗi (cho chat với AI) hoặc Danh sách phòng/dịch vụ được gợi ý dựa trên sở thích và lịch sử, Hiển thị trong trang tìm kiếm/phòng chi tiết (cho gợi ý theo sở thích) | Hệ thống tích hợp AI Assistant (Groq API) để tư vấn phòng, dịch vụ và địa điểm du lịch cho khách hàng. AI phân tích câu hỏi và đưa ra các gợi ý phù hợp. Hệ thống còn có khả năng gợi ý phòng và dịch vụ dựa trên sở thích và lịch sử đặt phòng của người dùng. |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - DASHBOARD VÀ BÁO CÁO

### Bảng 11: Mô tả chức năng Dashboard và báo cáo

| Tên usecase | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **UC1. Quản lý Dashboard và báo cáo** | Admin | JWT token (Admin), Khoảng thời gian, Bộ lọc (tùy chọn - cho xem thống kê/biểu đồ/báo cáo tài chính) hoặc Loại báo cáo, Bộ lọc, Khoảng thời gian, Định dạng (Excel/PDF) (cho xuất báo cáo) | Dashboard tổng quan với biểu đồ và thống kê (cho xem dashboard) hoặc Thống kê số liệu chi tiết, Biểu đồ xu hướng (cho xem thống kê/biểu đồ) hoặc File Excel/PDF báo cáo được tạo và tải về (cho xuất báo cáo) hoặc Báo cáo tài chính chi tiết với biểu đồ và số liệu (cho xem báo cáo tài chính) | Quản trị viên có thể xem dashboard tổng quan với các biểu đồ và thống kê về tình hình đặt phòng, công suất phòng, doanh thu và các chỉ số quan trọng. Xem báo cáo chi tiết theo ngày/tuần/tháng với các bộ lọc. Xuất báo cáo ra file Excel hoặc PDF. Xem báo cáo tài chính chi tiết về doanh thu, chi phí và lợi nhuận, phân tích theo kênh và loại phòng. |

---

## 📊 TÓM TẮT

### Các chức năng chính của hệ thống theo vai trò:

#### 👤 **Customer (Khách hàng):**
1. **Đăng ký** - 1 use case
2. **Đăng nhập** - 1 use case
3. **Đặt phòng** - 1 use case
4. **Thanh toán và xem hóa đơn** - 1 use case
5. **Chat** - 1 use case
6. **Đặt dịch vụ** - 1 use case
7. **Xem dịch vụ** - 1 use case
8. **Xem địa điểm du lịch** - 1 use case
9. **Import và Export file** - 1 use case

#### 👑 **Admin (Quản trị viên):**
1. **Đăng nhập** - 1 use case
2. **Quản lý booking** - 1 use case
3. **Quản lý lịch sử booking** - 1 use case
4. **Quản lý phòng và loại phòng** - 1 use case
5. **Quản lý thanh toán và hóa đơn** - 1 use case
6. **Quản lý chat** - 1 use case
7. **Quản lý dịch vụ** - 1 use case
8. **Quản lý địa điểm gợi ý** - 1 use case
9. **Quản lý khách hàng** - 1 use case
10. **Quản lý dashboard** - 1 use case

#### 👨‍💼 **Staff (Nhân viên):**
1. **Đăng nhập** - 1 use case
2. **Quản lý booking** - 1 use case
3. **Quản lý booking status** - 1 use case
4. **Chat** - 1 use case
5. **Thanh toán và hóa đơn** - 1 use case
6. **Dịch vụ** - 1 use case

### Yêu cầu phi chức năng: **8 nhóm**
- Performance: Response time, concurrency, database optimization
- Security: Authentication, data protection, validation
- Scalability: Architecture, horizontal scaling
- Reliability: Uptime, error handling, backup
- Usability: UI/UX, responsive design
- Maintainability: Code quality, testing
- Integration: Stripe, Email, AI
- Compatibility: Browser, device

### Actors: **4 loại**
- Customer (Khách hàng)
- Staff (Nhân viên)
- Admin (Quản trị viên)
- System (Hệ thống tự động)

---

*Tài liệu này được tạo dựa trên phân tích hệ thống Miko Hotel và biểu đồ UseCase tổng quát.*

