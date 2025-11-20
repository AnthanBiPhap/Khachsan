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

#### **FR1. Quản lý người dùng và xác thực**

Đăng ký tài khoản (email, mật khẩu, SĐT), gửi email xác thực. Đăng nhập bằng email/mật khẩu, nhận JWT token. Quên mật khẩu qua OTP 6 số (hiệu lực 10 phút). Quản lý hồ sơ cá nhân. Quản trị viên quản lý người dùng và phân quyền RBAC.

---

#### **FR2. Quản lý phòng và loại phòng**

Xem danh sách phòng với bộ lọc. Tìm kiếm phòng theo ngày, số khách, loại phòng, giá. Xem chi tiết phòng (mô tả, tiện nghi, hình ảnh, giá). Quản trị viên quản lý phòng và loại phòng, cập nhật trạng thái phòng.

---

#### **FR3. Quản lý đặt phòng**

Đặt phòng cá nhân (chọn phòng, ngày, số khách). Đặt phòng nhóm (gửi yêu cầu, chờ duyệt, upload thông tin thành viên, nhận báo giá). Xem danh sách booking, hủy booking trước hạn. Nhân viên và quản trị viên quản lý booking, check-in/check-out, gia hạn check-out, duyệt đặt phòng nhóm, quản lý thông tin khách.

---

#### **FR4. Quản lý thanh toán và hóa đơn**

Thanh toán online qua Stripe Checkout. Ghi nhận thanh toán tiền mặt/chuyển khoản. Xem lịch sử thanh toán. Quản lý payment. Quản trị viên xử lý hoàn tiền. Xuất hóa đơn PDF, tạo hóa đơn từ booking. Xem hóa đơn.

---

#### **FR5. Quản lý dịch vụ**

Xem danh sách dịch vụ với bộ lọc, xem chi tiết. Đặt dịch vụ kèm booking, xem danh sách dịch vụ đã đặt. Quản trị viên quản lý catalog dịch vụ. Nhân viên và quản trị viên quản lý service bookings, chi phí tự động đồng bộ vào invoice.

---

#### **FR6. Chat và giao tiếp real-time**

Chat real-time (Socket.IO) giữa khách hàng và nhân viên. Tự động ghép với staff online, gửi tin nhắn và file, hiển thị real-time. Lưu lịch sử chat, xem với phân trang. Quản lý hội thoại, cập nhật số tin nhắn chưa đọc.

#### **FR7. Quản lý thông báo**

Xem danh sách thông báo với phân trang và bộ lọc. Đánh dấu đã đọc, cập nhật badge số lượng chưa đọc. Gửi thông báo thủ công. Tự động gửi thông báo khi có sự kiện qua Socket.IO real-time.

#### **FR8. Quản lý địa điểm**

Duyệt danh sách địa điểm du lịch với bộ lọc, xem chi tiết. Quản trị viên quản lý địa điểm (tạo, sửa, xóa, bật/tắt hiển thị).

#### **FR9. AI Assistant và gợi ý**

AI Assistant (Groq API) tư vấn phòng, dịch vụ và địa điểm. Gợi ý phòng/dịch vụ dựa trên sở thích và lịch sử đặt phòng.

#### **FR10. Dashboard và báo cáo**

Xem dashboard tổng quan với biểu đồ và thống kê. Xem báo cáo chi tiết theo ngày/tuần/tháng. Xuất báo cáo ra file Excel hoặc PDF.

## 3.2. PHÂN TÍCH YÊU CẦU

Sau khi xác định các yêu cầu chức năng và phi chức năng, bước tiếp theo là tiến hành phân tích chi tiết các yêu cầu này để hiểu rõ cách thức hoạt động, các ràng buộc, ngoại lệ và giải pháp kỹ thuật cần thiết. Phân tích yêu cầu giúp đảm bảo hệ thống được thiết kế và triển khai một cách chính xác, đáp ứng đầy đủ nhu cầu của người dùng và các yêu cầu kỹ thuật.

### 3.2.1. Phân tích yêu cầu chức năng

Phân tích yêu cầu chức năng tập trung vào việc mô tả chi tiết các quy trình nghiệp vụ, luồng xử lý dữ liệu, các ràng buộc và ngoại lệ của từng chức năng trong hệ thống. Mỗi chức năng được phân tích từ góc độ người dùng, nghiệp vụ và kỹ thuật để đảm bảo tính khả thi và hiệu quả.

#### **Phân tích quy trình quản lý người dùng và xác thực**

Quy trình quản lý người dùng và xác thực là nền tảng bảo mật của hệ thống. Khi khách hàng đăng ký tài khoản mới, hệ thống sẽ kiểm tra tính duy nhất của email, validate mật khẩu đáp ứng yêu cầu bảo mật, sau đó tạo tài khoản và gửi email xác thực. Quá trình đăng nhập sử dụng JWT token để xác thực, token này có thời gian hết hạn để đảm bảo bảo mật. Hệ thống hỗ trợ quên mật khẩu thông qua cơ chế OTP với thời gian hiệu lực 10 phút, đảm bảo tính bảo mật trong quá trình đặt lại mật khẩu. Quản trị viên có quyền quản lý toàn bộ người dùng và phân quyền RBAC để kiểm soát quyền truy cập vào các chức năng của hệ thống.

#### **Phân tích quy trình quản lý phòng và loại phòng**

Hệ thống quản lý phòng và loại phòng đảm bảo thông tin phòng luôn chính xác và cập nhật. Khi người dùng tìm kiếm phòng, hệ thống sẽ kiểm tra tính khả dụng dựa trên các booking hiện có và chỉ hiển thị những phòng còn trống trong khoảng thời gian yêu cầu. Thông tin giá được lấy từ loại phòng tương ứng, đảm bảo tính nhất quán. Quản trị viên có thể quản lý phòng và loại phòng, cập nhật trạng thái phòng theo các trạng thái nghiệp vụ khác nhau để phản ánh tình trạng thực tế của phòng.

#### **Phân tích quy trình đặt phòng cá nhân**

Quy trình đặt phòng cá nhân bắt đầu khi khách hàng tìm kiếm phòng theo các tiêu chí như ngày check-in, check-out, số lượng khách và loại phòng. Hệ thống sẽ tự động kiểm tra tính khả dụng của phòng trong khoảng thời gian yêu cầu dựa trên các booking hiện có, sau đó hiển thị danh sách phòng còn trống. Khi khách hàng chọn một phòng cụ thể, họ sẽ xem thông tin chi tiết và điền các thông tin đặt phòng bao gồm thông tin khách và các dịch vụ kèm theo nếu có. Hệ thống sẽ tự động tính toán tổng giá bao gồm giá phòng, dịch vụ và các phụ phí. Khách hàng chọn phương thức thanh toán online qua Stripe, hệ thống sẽ tạo Stripe checkout session và redirect khách hàng đến trang thanh toán của Stripe. Sau khi thanh toán thành công, Stripe sẽ gửi webhook về hệ thống để xác nhận, hệ thống sẽ tạo booking, invoice và payment record, đồng thời gửi email xác nhận và thông báo real-time cho khách hàng. Phòng sẽ được đánh dấu là "booked" để tránh đặt trùng.

Quy trình này có các ràng buộc quan trọng: phòng phải còn trống trong khoảng thời gian check-in và check-out, thông tin khách phải hợp lệ bao gồm tên, CMND/CCCD và số điện thoại, thanh toán phải thành công trước khi booking được xác nhận, và booking có thời hạn giữ chỗ nếu chưa thanh toán. Trong trường hợp ngoại lệ, nếu phòng đã được đặt bởi người khác, hệ thống sẽ thông báo lỗi và đề xuất các phòng tương tự. Nếu thanh toán thất bại, booking sẽ ở trạng thái pending và khách hàng có thể thử lại. Nếu Stripe webhook không đến, hệ thống cần có cơ chế idempotency và manual verification để đảm bảo tính chính xác của giao dịch.

---

#### **Phân tích quy trình đặt phòng nhóm**

Quy trình đặt phòng nhóm phức tạp hơn đặt phòng cá nhân do cần xử lý nhiều phòng và nhiều khách cùng lúc. Khách hàng gửi yêu cầu đặt phòng nhóm với thông tin về số người, số phòng cần thiết, khoảng thời gian lưu trú và các ghi chú đặc biệt. Hệ thống sẽ tạo group booking với trạng thái "pending_approval" và chờ nhân viên hoặc quản trị viên xem xét. Sau khi được duyệt, trạng thái chuyển sang "approved" và khách hàng được yêu cầu upload thông tin chi tiết của các thành viên trong đoàn. Khi thông tin đã đầy đủ, trạng thái chuyển sang "info_uploaded", nhân viên sẽ tạo báo giá chi tiết bao gồm giá phòng và các phụ phí, trạng thái chuyển sang "quoted". Nhân viên gửi payment link cho khách hàng và trạng thái chuyển sang "awaiting_payment". Sau khi khách hàng thanh toán đủ (full hoặc deposit), trạng thái chuyển sang "paid" hoặc "deposit_paid", nhân viên xác nhận và phân bổ phòng cụ thể cho đoàn, trạng thái chuyển sang "confirmed" và sẵn sàng cho quy trình check-in.

Quy trình này có các ràng buộc nghiêm ngặt: group booking phải được duyệt bởi nhân viên hoặc quản trị viên, thông tin thành viên phải đầy đủ trước khi tạo báo giá, thanh toán phải đủ (full hoặc deposit) trước khi được xác nhận, và phòng phải được phân bổ cụ thể trước khi check-in. Trong các trường hợp ngoại lệ, nếu yêu cầu bị từ chối, hệ thống sẽ thông báo lý do và group booking bị hủy. Nếu khách hàng không thanh toán trong thời hạn quy định, group booking sẽ tự động bị hủy. Nếu không đủ phòng để phân bổ, hệ thống cần thông báo và đề xuất các giải pháp thay thế cho khách hàng.

---

#### **Phân tích quy trình thanh toán**

Hệ thống hỗ trợ nhiều phương thức thanh toán để đáp ứng nhu cầu đa dạng của khách hàng. Đối với thanh toán online qua Stripe, khi khách hàng chọn phương thức này, hệ thống sẽ tạo Stripe checkout session với đầy đủ thông tin booking và redirect khách hàng đến trang thanh toán của Stripe. Khách hàng nhập thông tin thẻ và thực hiện thanh toán, Stripe sẽ xử lý và redirect về trang success hoặc cancel. Sau đó, Stripe sẽ gửi webhook về backend để xác nhận thanh toán, backend sẽ xác minh webhook signature để đảm bảo tính bảo mật, sau đó cập nhật payment status, booking status và invoice. Hệ thống sẽ gửi email xác nhận và thông báo real-time cho khách hàng.

Đối với thanh toán tiền mặt hoặc chuyển khoản, nhân viên hoặc quản trị viên sẽ tạo payment record với phương thức tương ứng và nhập thông tin giao dịch bao gồm số tiền và mã tham chiếu nếu có. Hệ thống sẽ tự động cập nhật payment status, booking status và invoice, đồng thời gửi thông báo real-time. Quy trình thanh toán có các ràng buộc quan trọng: payment phải gắn với booking hoặc group booking, số tiền thanh toán không được vượt quá số tiền còn thiếu, payment status phải được đồng bộ với booking status và invoice status, và Stripe webhook phải được xác minh signature. Trong các trường hợp ngoại lệ, nếu thanh toán thất bại, payment status sẽ là failed và booking vẫn ở trạng thái pending. Nếu webhook không đến, hệ thống cần có cơ chế polling hoặc manual verification. Để tránh thanh toán trùng lặp, hệ thống sử dụng idempotency key.

---

#### **Phân tích quy trình quản lý dịch vụ**

Hệ thống quản lý dịch vụ cho phép khách hàng xem và đặt các dịch vụ bổ sung trong quá trình lưu trú. Khách hàng có thể duyệt danh sách dịch vụ với bộ lọc theo loại và giá, xem chi tiết từng dịch vụ bao gồm mô tả, giá cả, điều kiện áp dụng và thời gian phục vụ. Khi khách hàng đặt dịch vụ kèm theo booking, hệ thống sẽ kiểm tra tính khả dụng và tạo service booking. Chi phí dịch vụ sẽ tự động được đồng bộ vào invoice của booking tương ứng. Quản trị viên có quyền quản lý toàn bộ catalog dịch vụ, bao gồm tạo mới, chỉnh sửa và xóa dịch vụ. Nhân viên và quản trị viên có thể tra cứu, duyệt và cập nhật trạng thái của các service bookings để đảm bảo dịch vụ được cung cấp đúng thời gian và chất lượng.

#### **Phân tích quy trình chat real-time**

Hệ thống chat real-time sử dụng công nghệ Socket.IO để đảm bảo giao tiếp tức thời giữa khách hàng và nhân viên. Khi khách hàng mở chat, hệ thống sẽ tự động ghép khách hàng với một nhân viên đang online. Nếu không có nhân viên online, hệ thống sẽ fallback đến quản trị viên hoặc đưa vào hàng đợi. Hệ thống sẽ tạo conversation nếu chưa có, sau đó khách hàng có thể gửi tin nhắn thông qua Socket.IO. Server sẽ nhận message, lưu vào database để có lịch sử, và broadcast message đến nhân viên trong conversation. Nhân viên sẽ nhận message real-time và số lượng tin nhắn chưa đọc sẽ được cập nhật tự động. Khi nhân viên phản hồi, quy trình tương tự sẽ được thực hiện. Khi nhân viên đánh dấu tin nhắn đã đọc, số lượng tin nhắn chưa đọc sẽ được cập nhật. Quy trình này có các ràng buộc: conversation phải có ít nhất 2 participants (khách hàng và nhân viên/quản trị viên), message phải được lưu vào database để có lịch sử, Socket.IO connection phải được authenticate bằng JWT token, và số lượng tin nhắn chưa đọc phải được cập nhật real-time. Trong các trường hợp ngoại lệ, nếu Socket.IO connection bị mất, hệ thống sẽ fallback sang polling để lấy messages mới. Nếu nhân viên không online, message sẽ được đưa vào hàng đợi và gửi notification. Nếu message quá dài, hệ thống sẽ validate độ dài và reject nếu vượt quá giới hạn.

#### **Phân tích quy trình quản lý thông báo**

Hệ thống quản lý thông báo đảm bảo người dùng luôn được cập nhật về các sự kiện quan trọng. Người dùng có thể xem danh sách tất cả thông báo liên quan đến booking, thanh toán, chat và các hoạt động khác với phân trang và bộ lọc. Khi người dùng đánh dấu thông báo đã đọc, hệ thống sẽ tự động cập nhật badge số lượng thông báo chưa đọc. Nhân viên và quản trị viên có thể gửi thông báo thủ công đến một người dùng cụ thể hoặc một nhóm người dùng theo vai trò. Hệ thống cũng tự động gửi thông báo khi có các sự kiện quan trọng như booking được xác nhận, thanh toán thành công, check-in hoặc check-out. Thông báo được gửi real-time qua Socket.IO nếu người dùng đang online, hoặc được lưu lại để hiển thị khi người dùng đăng nhập lại.

#### **Phân tích quy trình quản lý địa điểm**

Hệ thống quản lý địa điểm cung cấp thông tin về các địa điểm du lịch xung quanh khách sạn để giúp khách hàng lên kế hoạch chuyến đi. Khách hàng có thể duyệt danh sách các địa điểm với bộ lọc theo loại và khoảng cách, xem thông tin chi tiết bao gồm mô tả, hình ảnh, vị trí trên bản đồ, thời gian mở cửa và các thông tin hữu ích khác. Quản trị viên có quyền quản lý toàn bộ danh sách địa điểm, bao gồm tạo mới, chỉnh sửa, xóa và bật/tắt hiển thị các địa điểm để đảm bảo thông tin luôn cập nhật và chính xác.

#### **Phân tích quy trình AI Assistant và gợi ý**

Hệ thống tích hợp AI Assistant sử dụng Groq API để cung cấp trải nghiệm tư vấn thông minh cho khách hàng. Khách hàng có thể chat với AI assistant để được tư vấn về phòng, dịch vụ và địa điểm du lịch. AI sẽ phân tích câu hỏi của khách hàng và đưa ra các gợi ý phù hợp dựa trên thông tin có sẵn trong hệ thống. Ngoài ra, hệ thống còn có khả năng gợi ý phòng và dịch vụ dựa trên sở thích và lịch sử đặt phòng của người dùng, giúp cải thiện trải nghiệm và tăng tỷ lệ chuyển đổi. Trong trường hợp API lỗi, hệ thống sẽ có fallback responses để đảm bảo trải nghiệm người dùng không bị gián đoạn.

#### **Phân tích quy trình dashboard và báo cáo**

Hệ thống dashboard và báo cáo cung cấp cái nhìn tổng quan về hoạt động của khách sạn cho nhân viên và quản trị viên. Dashboard hiển thị các biểu đồ và thống kê về tình hình đặt phòng, công suất phòng, doanh thu và các chỉ số quan trọng khác, giúp quản lý đưa ra quyết định nhanh chóng và chính xác. Hệ thống cũng cung cấp các báo cáo chi tiết theo ngày, tuần hoặc tháng về số lượng đặt phòng, doanh thu, tỷ lệ hủy và nhiều chỉ số khác. Nhân viên và quản trị viên có thể xuất các báo cáo này ra file Excel hoặc PDF để lưu trữ hoặc chia sẻ với các bên liên quan.

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

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - XÁC THỰC VÀ PHÂN QUYỀN

### Bảng 1: Mô tả chức năng Xác thực và Phân quyền

| Tên chức năng | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **Xác thực và Phân quyền** | Customer, Staff, Admin, System | - **Đăng ký**: Họ tên, Email (chưa tồn tại), Mật khẩu (tối thiểu 8 ký tự, có chữ hoa/thường/số/ký tự đặc biệt), Số điện thoại<br>- **Đăng nhập**: Email, Mật khẩu<br>- **Quản lý cá nhân**: JWT token hợp lệ, Dữ liệu cập nhật (tên, SĐT, ngày sinh, avatar)<br>- **Đổi mật khẩu**: JWT token, Mật khẩu hiện tại, Mật khẩu mới<br>- **Quản lý người dùng**: JWT token với role Admin, Thông tin người dùng, User ID<br>- **Xác thực email**: Email verification token từ link (hiệu lực 24 giờ)<br>- **Quên mật khẩu**: Email tài khoản, OTP 6 số, Mật khẩu mới | - **Đăng ký**: Tài khoản được tạo, Email xác thực được gửi, Trạng thái `emailVerified: false`, `isActive: true`<br>- **Đăng nhập**: JWT access token (hết hạn 15 phút), JWT refresh token (hết hạn 7 ngày), Thông tin người dùng<br>- **Đăng xuất**: Tokens bị invalidate, Socket.IO connection bị ngắt<br>- **Quản lý cá nhân**: Thông tin được cập nhật thành công<br>- **Đổi mật khẩu**: Mật khẩu được đổi, Tất cả session bị invalidate, Email thông báo<br>- **Quản lý người dùng**: Người dùng được tạo/sửa/xóa thành công<br>- **Khóa/Mở khóa**: Trạng thái tài khoản được cập nhật, Session bị invalidate<br>- **Phân quyền**: Role được cập nhật, Quyền truy cập mới được áp dụng<br>- **Xác thực email**: `emailVerified: true`, Token bị xóa<br>- **Quên mật khẩu**: OTP được tạo và gửi (hiệu lực 10 phút), Mật khẩu mới được đặt | Hệ thống cung cấp đầy đủ các chức năng xác thực và phân quyền: **Đăng ký tài khoản** (khách hàng điền form, hệ thống kiểm tra email chưa tồn tại, validate mật khẩu, hash bằng bcrypt, gửi email xác thực với link kích hoạt 24 giờ); **Đăng nhập** (người dùng nhập email/mật khẩu, hệ thống tìm user, so sánh mật khẩu đã hash, kiểm tra tài khoản chưa bị khóa, tạo JWT tokens để xác thực API và Socket.IO); **Đăng xuất** (xóa refresh token, invalidate access token, ngắt Socket.IO); **Quản lý thông tin cá nhân** (xem và cập nhật thông tin, validate dữ liệu); **Đổi mật khẩu** (xác minh mật khẩu hiện tại, validate mật khẩu mới, hash bằng bcrypt, invalidate session); **Quản lý người dùng** (admin tạo/sửa/xóa, chỉ định role, ghi audit log); **Khóa/Mở khóa tài khoản** (cập nhật `isActive`, invalidate tokens); **Phân quyền** (áp dụng RBAC, mỗi role có permissions, middleware kiểm tra quyền); **Xác thực email** (gửi email với verification token, verify và cập nhật trạng thái); **Quên mật khẩu qua OTP** (tạo OTP 6 số, hash và lưu database, gửi email, xác minh OTP, đặt mật khẩu mới, xóa OTP và invalidate session). |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - QUẢN LÝ PHÒNG VÀ LOẠI PHÒNG

### Bảng 2: Mô tả chức năng Quản lý phòng và loại phòng

| Tên chức năng | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **Quản lý phòng và loại phòng** | Customer, Staff, Admin | - **Xem danh sách phòng**: JWT token hợp lệ (nếu đã đăng nhập)<br>- **Tìm kiếm phòng**: Ngày check-in, Ngày check-out, Số lượng khách, Loại phòng, Khoảng giá<br>- **Xem chi tiết phòng**: Room ID<br>- **Xem loại phòng**: Room Type ID (tùy chọn)<br>- **Quản lý phòng**: JWT token với role Admin, Thông tin phòng (số phòng, loại phòng, trạng thái, tiện nghi), Room ID (cho sửa/xóa)<br>- **Quản lý loại phòng**: JWT token với role Admin, Thông tin loại phòng (tên, mô tả, giá/đêm, sức chứa, tiện nghi), Room Type ID (cho sửa/xóa)<br>- **Cập nhật trạng thái phòng**: JWT token với role Admin, Room ID, Trạng thái mới (available/booked/maintenance/checked_in/occupied/unavailable) | - **Xem danh sách phòng**: Danh sách phòng với thông tin cơ bản (số phòng, loại, giá, trạng thái)<br>- **Tìm kiếm phòng**: Danh sách phòng còn trống phù hợp với tiêu chí, Tổng giá theo số đêm<br>- **Xem chi tiết phòng**: Thông tin đầy đủ (mô tả, tiện nghi, hình ảnh, giá, sức chứa, trạng thái, lịch sử đặt phòng)<br>- **Xem loại phòng**: Danh sách loại phòng và thông tin chi tiết<br>- **Quản lý phòng**: Phòng được tạo/sửa/xóa thành công, Danh sách phòng được cập nhật<br>- **Quản lý loại phòng**: Loại phòng được tạo/sửa/xóa thành công, Giá tự động cập nhật cho tất cả phòng thuộc loại<br>- **Cập nhật trạng thái**: Trạng thái phòng được cập nhật, Kiểm tra xung đột với booking | Hệ thống cung cấp đầy đủ các chức năng quản lý phòng và loại phòng: **Xem danh sách phòng** (tất cả người dùng xem danh sách với bộ lọc theo loại, trạng thái, ngày); **Tìm kiếm phòng** (nhập tiêu chí, hệ thống query database, kiểm tra tính khả dụng dựa trên booking hiện có, loại bỏ phòng đã đặt và phòng maintenance/unavailable, tính giá từ loại phòng, hiển thị danh sách phòng còn trống); **Xem chi tiết phòng** (hiển thị đầy đủ thông tin, giá lấy từ loại phòng, lịch sử đặt phòng); **Xem loại phòng** (xem danh sách và thông tin loại phòng); **Quản lý phòng** (admin tạo phòng với số phòng duy nhất, validate loại phòng, tự động gán tiện nghi từ loại phòng; sửa phòng trừ số phòng; xóa phòng sau khi kiểm tra không có booking liên quan); **Quản lý loại phòng** (admin tạo/sửa/xóa loại phòng, validate tên duy nhất, giá dương, sức chứa > 0; cập nhật giá tự động cho tất cả phòng thuộc loại; không thể xóa nếu còn phòng đang sử dụng); **Cập nhật trạng thái phòng** (admin cập nhật trạng thái, validate không xung đột với booking, tự động cập nhật theo booking: booked khi có booking mới, checked_in/occupied khi check-in, available khi check-out). |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - QUẢN LÝ ĐẶT PHÒNG

### Bảng 3: Mô tả chức năng Quản lý đặt phòng

| Tên chức năng | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **Quản lý đặt phòng** | Customer, Staff, Admin | - **Đặt phòng cá nhân**: JWT token hợp lệ, Phòng đã chọn, Ngày check-in/check-out, Số khách, Thông tin khách (tên, CMND/CCCD, SĐT), Dịch vụ kèm theo (tùy chọn), Phương thức thanh toán<br>- **Đặt phòng nhóm**: JWT token hợp lệ, Số người, Số phòng, Ngày check-in/check-out, Ghi chú<br>- **Xem đặt phòng của mình**: JWT token hợp lệ<br>- **Hủy đặt phòng**: JWT token hợp lệ, Booking ID, Lý do hủy<br>- **Xem danh sách đặt phòng**: JWT token với role Staff/Admin, Bộ lọc (ngày, trạng thái, khách, phòng)<br>- **Xem chi tiết đặt phòng**: JWT token với role Staff/Admin, Booking ID<br>- **Cập nhật trạng thái**: JWT token với role Staff/Admin, Booking ID, Trạng thái mới<br>- **Check-in**: JWT token với role Staff/Admin, Booking ID, Xác thực khách<br>- **Check-out**: JWT token với role Staff/Admin, Booking ID<br>- **Gia hạn check-out**: JWT token với role Staff/Admin, Booking ID, Thời gian gia hạn<br>- **Duyệt đặt phòng nhóm**: JWT token với role Staff/Admin, Group Booking ID, Quyết định (duyệt/từ chối)<br>- **Tạo báo giá**: JWT token với role Staff/Admin, Group Booking ID, Giá phòng, Phụ phí<br>- **Quản lý thông tin khách**: JWT token với role Staff/Admin, Guest ID, Thông tin khách | - **Đặt phòng cá nhân**: Booking được tạo, Phòng được đánh dấu booked, Stripe checkout session (nếu thanh toán online), Email xác nhận, Thông báo real-time<br>- **Đặt phòng nhóm**: Group booking được tạo với trạng thái pending_approval, Thông báo cho staff/admin<br>- **Xem đặt phòng**: Danh sách booking với trạng thái và thanh toán<br>- **Hủy đặt phòng**: Booking được hủy, Phòng được giải phóng, Hoàn tiền (nếu có), Email thông báo<br>- **Xem danh sách**: Danh sách bookings theo bộ lọc<br>- **Xem chi tiết**: Thông tin đầy đủ (phòng, ngày, khách, hóa đơn, payments, lịch sử)<br>- **Cập nhật trạng thái**: Trạng thái booking được cập nhật, Audit log được ghi<br>- **Check-in**: Trạng thái booking/phòng chuyển sang checked_in/occupied, Thời điểm check-in được ghi nhận<br>- **Check-out**: Trạng thái booking/phòng chuyển sang checked_out, Hóa đơn được phát sinh (nếu chưa), Phòng chuyển về available<br>- **Gia hạn check-out**: Thời gian check-out được gia hạn, Phụ thu được tính (nếu có), Tồn phòng được cập nhật<br>- **Duyệt đặt phòng nhóm**: Trạng thái group booking chuyển sang approved/rejected, Thông báo cho khách hàng<br>- **Tạo báo giá**: Báo giá được tạo, Trạng thái chuyển sang quoted, Payment link được gửi<br>- **Quản lý thông tin khách**: Thông tin khách được cập nhật | Hệ thống cung cấp đầy đủ các chức năng quản lý đặt phòng: **Đặt phòng cá nhân** (khách hàng chọn phòng, điền thông tin, hệ thống kiểm tra tính khả dụng, tạo booking, giữ phòng tạm thời, tạo Stripe checkout session nếu thanh toán online, sau khi thanh toán thành công tạo invoice và payment record, gửi email xác nhận và thông báo real-time, phòng được đánh dấu booked); **Đặt phòng nhóm** (khách hàng gửi yêu cầu với thông tin số người/phòng/ngày, hệ thống tạo group booking với trạng thái pending_approval, staff/admin xem xét và duyệt/từ chối, nếu duyệt khách upload thông tin thành viên, staff tạo báo giá, gửi payment link, sau khi thanh toán staff phân bổ phòng cụ thể, trạng thái chuyển sang confirmed); **Xem đặt phòng của mình** (khách hàng xem danh sách và chi tiết booking của mình, trạng thái và thanh toán); **Hủy đặt phòng** (khách hàng hủy trước hạn, hệ thống kiểm tra chính sách, ghi lý do, cập nhật tồn phòng, hoàn tiền nếu có, staff/admin duyệt hủy); **Xem danh sách đặt phòng** (staff/admin tra cứu toàn bộ bookings theo bộ lọc); **Xem chi tiết đặt phòng** (xem thông tin đầy đủ: phòng, khoảng ngày, khách đi kèm, hóa đơn, payments, lịch sử trạng thái); **Cập nhật trạng thái** (staff/admin cập nhật theo workflow: pending → confirmed → checked_in → checked_out → cancelled, ghi audit log); **Check-in** (staff/admin xác thực khách, cập nhật trạng thái booking/phòng sang checked_in/occupied, ghi nhận thời điểm); **Check-out** (staff/admin chốt công nợ/dịch vụ, cập nhật trạng thái booking/phòng sang checked_out, phát sinh hóa đơn nếu chưa, phòng chuyển về available); **Gia hạn check-out** (staff/admin gia hạn theo yêu cầu, cập nhật phụ thu nếu có, kiểm tra tồn phòng/đụng lịch); **Duyệt đặt phòng nhóm** (staff/admin xem yêu cầu, duyệt/từ chối, cập nhật tồn phòng theo phân bổ dự kiến); **Tạo báo giá** (staff/admin lập báo giá chi tiết, gửi payment link, theo dõi tiến độ thanh toán); **Quản lý thông tin khách** (staff/admin quản lý hồ sơ khách đi kèm booking, cập nhật khi check-in/out). |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - THANH TOÁN VÀ HÓA ĐƠN

### Bảng 4: Mô tả chức năng Thanh toán và hóa đơn

| Tên chức năng | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **Thanh toán và hóa đơn** | Customer, Staff, Admin, System | - **Thanh toán online (Stripe)**: JWT token hợp lệ, Booking ID, Thông tin thẻ tín dụng<br>- **Thanh toán tiền mặt**: JWT token với role Staff/Admin, Booking ID, Số tiền, Mã tham chiếu (tùy chọn)<br>- **Thanh toán chuyển khoản**: JWT token với role Staff/Admin, Booking ID, Số tiền, Mã tham chiếu<br>- **Xem lịch sử thanh toán**: JWT token hợp lệ<br>- **Quản lý thanh toán**: JWT token với role Staff/Admin, Bộ lọc (booking, khách, trạng thái, thời gian)<br>- **Cập nhật trạng thái payment**: JWT token với role Staff/Admin, Payment ID, Trạng thái mới (paid/failed/refunded/cancelled)<br>- **Thống kê thanh toán**: JWT token với role Staff/Admin, Khoảng thời gian, Bộ lọc<br>- **Đồng bộ payment với booking**: JWT token với role Staff/Admin<br>- **Xem payment theo booking/khách**: JWT token với role Staff/Admin, Booking ID hoặc Customer ID<br>- **Xử lý hoàn tiền**: JWT token với role Admin, Payment ID, Lý do hoàn tiền<br>- **Xuất hóa đơn PDF**: JWT token hợp lệ, Booking ID hoặc Invoice ID<br>- **Tạo hóa đơn**: JWT token với role Staff/Admin, Booking ID hoặc Group Booking ID, Chi phí bổ sung (tùy chọn)<br>- **Xem hóa đơn**: JWT token hợp lệ, Invoice ID (tùy chọn) | - **Thanh toán online**: Stripe checkout session được tạo, Redirect đến Stripe, Webhook xác nhận thanh toán, Payment record được tạo, Booking status được cập nhật, Invoice được cập nhật, Email xác nhận, Thông báo real-time<br>- **Thanh toán tiền mặt**: Payment record được tạo, Payment status được cập nhật, Booking status được cập nhật, Invoice được cập nhật, Thông báo real-time<br>- **Thanh toán chuyển khoản**: Payment record được tạo, Payment status được cập nhật, Booking status được cập nhật, Invoice được cập nhật, Thông báo real-time<br>- **Xem lịch sử thanh toán**: Danh sách payments của khách hàng với thông tin chi tiết<br>- **Quản lý thanh toán**: Danh sách payments theo bộ lọc, Chi tiết payment<br>- **Cập nhật trạng thái**: Payment status được cập nhật, Audit log được ghi, Thông báo được gửi (nếu cần)<br>- **Thống kê thanh toán**: Thống kê tổng hợp (doanh thu, số giao dịch theo trạng thái/thời gian)<br>- **Đồng bộ payment**: Payment và booking được đồng bộ, Trạng thái nhất quán<br>- **Xem payment theo booking/khách**: Danh sách payments theo booking hoặc khách hàng<br>- **Xử lý hoàn tiền**: Payment được hoàn tiền, Payment status = refunded, Invoice được cập nhật, Email thông báo<br>- **Xuất hóa đơn PDF**: File PDF hóa đơn được tạo, Có thể xem/tải về<br>- **Tạo hóa đơn**: Invoice được tạo từ booking/group booking, Chi phí bổ sung được thêm, Invoice được chốt<br>- **Xem hóa đơn**: Danh sách/chi tiết invoice theo quyền | Hệ thống cung cấp đầy đủ các chức năng thanh toán và hóa đơn: **Thanh toán online (Stripe)** (khách hàng chọn thanh toán online, hệ thống tạo Stripe checkout session với thông tin booking, redirect đến Stripe, khách hàng nhập thông tin thẻ và thanh toán, Stripe xử lý và redirect về, Stripe gửi webhook về backend, backend xác minh webhook signature, cập nhật payment status, booking status và invoice, gửi email xác nhận và thông báo real-time); **Thanh toán tiền mặt** (staff/admin ghi nhận giao dịch tiền mặt, nhập số tiền và mã tham chiếu nếu có, hệ thống tạo payment record, cập nhật payment status, booking status và invoice, gửi thông báo real-time); **Thanh toán chuyển khoản** (staff/admin ghi nhận giao dịch chuyển khoản với mã tham chiếu, hệ thống tạo payment record, cập nhật trạng thái tương ứng); **Xem lịch sử thanh toán** (khách hàng xem danh sách payments của mình với thông tin chi tiết); **Quản lý thanh toán** (staff/admin tra cứu, xem chi tiết payment, lọc theo booking, khách, trạng thái, thời gian); **Cập nhật trạng thái payment** (staff/admin đánh dấu paid/failed/refunded/cancelled, ghi audit log, phát notify nếu cần); **Thống kê thanh toán** (staff/admin xem thống kê tổng hợp về doanh thu, số giao dịch theo trạng thái và thời gian); **Đồng bộ payment với booking** (staff/admin chạy đồng bộ để đảm bảo trạng thái nhất quán giữa payment và booking); **Xem payment theo booking/khách** (staff/admin truy vấn payments theo bookingId hoặc customerId); **Xử lý hoàn tiền** (admin thực hiện refund theo chính sách sau khi duyệt hủy, cập nhật payment/invoice, gửi email thông báo); **Xuất hóa đơn PDF** (khách hàng tạo và xem/tải hóa đơn PDF theo booking, định dạng chuẩn VN); **Gửi hóa đơn qua email** (hệ thống tự động gửi file/invoice link đến email khách sau khi thanh toán hoặc khi yêu cầu); **Tạo hóa đơn** (staff/admin sinh invoice từ booking/group booking, thêm dòng chi phí/dịch vụ, chốt hóa đơn); **Xem hóa đơn** (tất cả người dùng xem danh sách/chi tiết invoice theo quyền, không cho sửa sau khi completed). |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - QUẢN LÝ DỊCH VỤ

### Bảng 5: Mô tả chức năng Quản lý dịch vụ

| Tên chức năng | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **Quản lý dịch vụ** | Customer, Staff, Admin | - **Xem danh sách dịch vụ**: JWT token hợp lệ (nếu đã đăng nhập), Bộ lọc theo loại/giá (tùy chọn)<br>- **Xem chi tiết dịch vụ**: JWT token hợp lệ, Service ID<br>- **Đặt dịch vụ**: JWT token hợp lệ, Booking ID, Service ID, Số lượng, Thời gian phục vụ<br>- **Xem đặt dịch vụ của mình**: JWT token hợp lệ<br>- **Quản lý dịch vụ (catalog)**: JWT token với role Admin, Thông tin dịch vụ (tên, mô tả, giá, đơn vị, loại, lịch phục vụ, điều kiện), Service ID (cho sửa/xóa)<br>- **Quản lý đặt dịch vụ**: JWT token với role Staff/Admin, Bộ lọc (booking, khách, trạng thái, thời gian)<br>- **Cập nhật trạng thái đặt dịch vụ**: JWT token với role Staff/Admin, Service Booking ID, Trạng thái mới (requested/confirmed/completed/cancelled), Lý do (tùy chọn)<br>- **Hủy đặt dịch vụ**: JWT token với role Staff/Admin, Service Booking ID, Lý do hủy<br>- **Hạch toán dịch vụ vào hóa đơn**: JWT token với role Staff/Admin, Service Booking ID, Invoice ID | - **Xem danh sách dịch vụ**: Danh sách dịch vụ với thông tin cơ bản (tên, loại, giá, hình ảnh)<br>- **Xem chi tiết dịch vụ**: Thông tin đầy đủ (mô tả, giá, đơn vị, điều kiện áp dụng, thời gian phục vụ, hình ảnh)<br>- **Đặt dịch vụ**: Service booking được tạo, Trạng thái requested, Chi phí được tính, Thông báo cho staff/admin<br>- **Xem đặt dịch vụ của mình**: Danh sách service bookings gắn với booking của khách hàng, Trạng thái và chi phí<br>- **Quản lý dịch vụ**: Dịch vụ được tạo/sửa/xóa thành công, Catalog được cập nhật, Bật/tắt hiển thị<br>- **Quản lý đặt dịch vụ**: Danh sách service bookings theo bộ lọc, Chi tiết service booking<br>- **Cập nhật trạng thái**: Trạng thái service booking được cập nhật, Audit log được ghi, Thông báo cho khách hàng<br>- **Hủy đặt dịch vụ**: Service booking được hủy, Hoàn/thu phí theo chính sách, Thông báo cho khách hàng<br>- **Hạch toán dịch vụ vào hóa đơn**: Chi phí dịch vụ được gộp vào invoice, Invoice được cập nhật, Không cho sửa sau khi chốt invoice | Hệ thống cung cấp đầy đủ các chức năng quản lý dịch vụ: **Xem danh sách dịch vụ** (khách hàng duyệt các dịch vụ như ăn uống, spa, đưa đón với bộ lọc theo loại và giá); **Xem chi tiết dịch vụ** (khách hàng xem mô tả, giá, đơn vị, điều kiện áp dụng, thời gian phục vụ, hình ảnh); **Đặt dịch vụ** (khách hàng đặt dịch vụ kèm booking, chọn số lượng và thời gian phục vụ, hệ thống kiểm tra tính khả dụng, tạo service booking với trạng thái requested, tính chi phí, thông báo cho staff/admin); **Xem đặt dịch vụ của mình** (khách hàng xem danh sách và chi tiết các service bookings gắn với booking của mình, trạng thái và chi phí); **Quản lý dịch vụ (catalog)** (admin tạo/sửa/xóa dịch vụ với thông tin đầy đủ bao gồm tên, mô tả, giá, đơn vị, loại, lịch phục vụ, điều kiện, bật/tắt hiển thị; staff chỉ được xem); **Quản lý đặt dịch vụ** (staff/admin tra cứu, duyệt và cập nhật service bookings, lọc theo booking, khách, trạng thái, thời gian); **Cập nhật trạng thái đặt dịch vụ** (staff/admin cập nhật trạng thái requested/confirmed/completed/cancelled, ghi lý do và audit log, thông báo cho khách hàng); **Hủy đặt dịch vụ** (staff/admin hủy theo chính sách, hoàn/thu phí nếu có, phát notify cho khách); **Hạch toán dịch vụ vào hóa đơn** (staff/admin gộp chi phí dịch vụ vào invoice của booking, không cho sửa sau khi chốt invoice, đảm bảo tính nhất quán dữ liệu). |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - CHAT REALTIME

### Bảng 6: Mô tả chức năng Chat realtime

| Tên chức năng | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **Chat realtime** | Customer, Staff, Admin | - **Mở chat**: JWT token hợp lệ<br>- **Gửi tin nhắn**: JWT token hợp lệ, Conversation ID, Nội dung tin nhắn, File đính kèm (tùy chọn)<br>- **Xem lịch sử chat**: JWT token hợp lệ, Conversation ID, Phân trang<br>- **Quản lý cuộc trò chuyện**: JWT token với role Staff/Admin, Conversation ID, Hành động (tham gia/thoát, chọn conversation)<br>- **Đánh dấu đã đọc**: JWT token hợp lệ, Conversation ID<br>- **Đếm tin nhắn chưa đọc**: JWT token hợp lệ<br>- **Gắn cuộc trò chuyện với booking**: JWT token với role Staff/Admin, Conversation ID, Booking ID | - **Mở chat**: Conversation được tạo hoặc lấy từ database, Tự động ghép với staff online (hoặc admin nếu không có staff), Socket.IO connection được thiết lập<br>- **Gửi tin nhắn**: Tin nhắn được lưu vào database, Broadcast đến tất cả participants trong conversation qua Socket.IO, Unread count được cập nhật, Thông báo real-time<br>- **Xem lịch sử chat**: Danh sách tin nhắn với phân trang, Thông tin conversation, Participants<br>- **Quản lý cuộc trò chuyện**: Conversation được quản lý, Staff/admin tham gia/thoát room, Chọn conversation để xem<br>- **Đánh dấu đã đọc**: Trạng thái đã đọc được cập nhật, Unread count được giảm, Thông báo real-time<br>- **Đếm tin nhắn chưa đọc**: Tổng số tin nhắn chưa đọc được trả về, Badge được cập nhật<br>- **Gắn cuộc trò chuyện với booking**: Conversation được liên kết với booking, Ngữ cảnh được lưu, Staff/admin có thể xem thông tin booking trong chat | Hệ thống cung cấp đầy đủ các chức năng chat realtime: **Mở chat** (khách hàng mở chat, hệ thống tự động ghép với staff đang online, nếu không có staff thì fallback đến admin hoặc đưa vào hàng đợi, tạo conversation nếu chưa có, thiết lập Socket.IO connection với JWT authentication); **Gửi tin nhắn** (người dùng gửi tin nhắn văn bản và file đính kèm, hệ thống kiểm tra quyền trong conversation, validate độ dài tin nhắn, lưu vào database để có lịch sử, broadcast đến tất cả participants trong conversation qua Socket.IO, cập nhật unread count cho người nhận, hiển thị real-time trên UI); **Xem lịch sử chat** (người dùng xem danh sách và chi tiết cuộc trò chuyện theo quyền, phân trang để tải tin nhắn cũ, hiển thị thông tin participants); **Quản lý cuộc trò chuyện** (staff/admin tham gia/thoát room, chọn cuộc trò chuyện để xem, gắn cờ đã đọc, không xóa hội thoại); **Đánh dấu đã đọc** (người dùng đánh dấu tin nhắn đã đọc theo conversation, hệ thống cập nhật unreadCount server-side, thông báo real-time đến các participants khác); **Đếm tin nhắn chưa đọc** (API trả về tổng số tin nhắn chưa đọc, hiển thị badge trên thanh điều hướng, cập nhật real-time qua Socket.IO); **Gắn cuộc trò chuyện với booking** (staff/admin mở chat từ booking để hỗ trợ theo ngữ cảnh, hệ thống lưu liên kết booking trong conversation, staff/admin có thể xem thông tin booking trong cửa sổ chat để hỗ trợ tốt hơn); **Nhận thông báo real-time** (người dùng nhận sự kiện tin nhắn mới và thay đổi trạng thái qua Socket.IO, UI tự động update, nếu mất kết nối thì fallback sang polling để lấy messages mới). |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - QUẢN LÝ THÔNG BÁO

### Bảng 7: Mô tả chức năng Quản lý thông báo

| Tên chức năng | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **Quản lý thông báo** | Customer, Staff, Admin, System | - **Xem thông báo**: JWT token hợp lệ, Bộ lọc (loại, trạng thái, thời gian), Phân trang<br>- **Đếm thông báo chưa đọc**: JWT token hợp lệ<br>- **Đánh dấu đã đọc**: JWT token hợp lệ, Notification ID (một hoặc nhiều)<br>- **Gửi thông báo thủ công**: JWT token với role Staff/Admin, Thông tin thông báo (tiêu đề, nội dung, người nhận/nhóm), Loại thông báo<br>- **Cấu hình kênh/ưu tiên**: JWT token với role Admin, Cấu hình kênh (in-app, email), Mức ưu tiên<br>- **Quản lý template thông báo**: JWT token với role Admin, Template thông báo, Loại thông báo, TTL, Chính sách retry | - **Xem thông báo**: Danh sách thông báo với phân trang (booking, payments, group bookings, chat…), Bộ lọc theo loại và trạng thái<br>- **Đếm thông báo chưa đọc**: Tổng số thông báo chưa đọc được trả về, Badge được cập nhật real-time<br>- **Đánh dấu đã đọc**: Trạng thái đã đọc được cập nhật, Badge được giảm, Thời điểm đã đọc được ghi nhận<br>- **Gửi thông báo thủ công**: Thông báo được gửi đến người dùng/nhóm, Thông báo được lưu vào database, Thông báo real-time qua Socket.IO (nếu người dùng online)<br>- **Gửi thông báo hệ thống**: Thông báo tự động được tạo và gửi khi có sự kiện, Thông báo được lưu vào database<br>- **Realtime notifications**: Thông báo được nhận qua Socket.IO, UI tự động update, Fallback polling khi mất kết nối<br>- **Cấu hình kênh/ưu tiên**: Cấu hình được lưu, Áp dụng cho các thông báo mới<br>- **Quản lý template**: Template được tạo/sửa/xóa, Cấu hình TTL và retry được cập nhật, Loại thông báo được bật/tắt | Hệ thống cung cấp đầy đủ các chức năng quản lý thông báo: **Xem thông báo** (người dùng xem danh sách thông báo liên quan đến booking, payments, group bookings, chat và các hoạt động khác với phân trang và bộ lọc theo loại, trạng thái, thời gian); **Đếm thông báo chưa đọc** (API trả về tổng số thông báo chưa đọc để hiển thị badge trên thanh điều hướng, cập nhật real-time qua Socket.IO); **Đánh dấu đã đọc** (người dùng đánh dấu một hoặc nhiều thông báo đã đọc, hệ thống cập nhật badge và thời điểm đã đọc, cập nhật real-time); **Gửi thông báo thủ công** (staff/admin gửi thông báo thủ công đến một người dùng cụ thể hoặc một nhóm người dùng theo vai trò, thông báo được lưu vào database, gửi real-time qua Socket.IO nếu người dùng đang online, hoặc lưu lại để hiển thị khi người dùng đăng nhập lại); **Gửi thông báo hệ thống (tự động)** (hệ thống tự động tạo và gửi thông báo khi có các sự kiện quan trọng như booking được xác nhận, thanh toán thành công, check-in hoặc check-out, hủy booking, payment cập nhật, thông báo được lưu vào database và gửi real-time nếu người dùng online); **Realtime notifications** (người dùng nhận thông báo qua Socket.IO real-time, UI tự động update, nếu mất kết nối thì fallback sang polling để lấy thông báo mới); **Cấu hình kênh/ưu tiên** (admin cấu hình loại/kênh thông báo như in-app, email nếu bật, theo mức ưu tiên, cấu hình được áp dụng cho các thông báo mới); **Quản lý template thông báo** (admin quản lý template và loại thông báo, cấu hình TTL (time to live), chính sách retry, bật/tắt từng loại thông báo để kiểm soát việc gửi thông báo). |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - QUẢN LÝ ĐỊA ĐIỂM

### Bảng 8: Mô tả chức năng Quản lý địa điểm

| Tên chức năng | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **Quản lý địa điểm** | Customer, Staff, Admin | - **Xem danh sách địa điểm**: JWT token hợp lệ (nếu đã đăng nhập), Bộ lọc theo loại/khoảng cách (tùy chọn)<br>- **Xem chi tiết địa điểm**: JWT token hợp lệ, Location ID<br>- **Tìm kiếm địa điểm**: JWT token hợp lệ, Từ khóa (tên/loại), Khoảng cách, Bộ lọc nâng cao<br>- **Quản lý địa điểm (catalog)**: JWT token với role Admin, Thông tin địa điểm (tên, mô tả, loại, vị trí, hình ảnh, thời gian mở cửa, gợi ý di chuyển), Location ID (cho sửa/xóa) | - **Xem danh sách địa điểm**: Danh sách địa điểm với thông tin cơ bản (tên, loại, khoảng cách, hình ảnh)<br>- **Xem chi tiết địa điểm**: Thông tin đầy đủ (mô tả, hình ảnh, vị trí trên bản đồ, thời gian mở cửa, gợi ý di chuyển, thông tin hữu ích)<br>- **Tìm kiếm địa điểm**: Danh sách địa điểm phù hợp với từ khóa và bộ lọc, Sắp xếp theo khoảng cách<br>- **Quản lý địa điểm**: Địa điểm được tạo/sửa/xóa thành công, Catalog được cập nhật, Bật/tắt hiển thị | Hệ thống cung cấp đầy đủ các chức năng quản lý địa điểm: **Xem danh sách địa điểm** (khách hàng duyệt các địa điểm du lịch xung quanh khách sạn như điểm tham quan, khu vực lân cận với bộ lọc theo loại và khoảng cách, hiển thị thông tin cơ bản để giúp khách hàng lên kế hoạch chuyến đi); **Xem chi tiết địa điểm** (khách hàng xem thông tin đầy đủ bao gồm mô tả chi tiết, hình ảnh, vị trí trên bản đồ, thời gian mở cửa, gợi ý di chuyển từ khách sạn đến địa điểm, và các thông tin hữu ích khác); **Tìm kiếm địa điểm** (khách hàng tìm kiếm địa điểm theo tên, loại hoặc khoảng cách, hệ thống query database và trả về danh sách địa điểm phù hợp, có thể sắp xếp theo khoảng cách gần nhất, hỗ trợ bộ lọc nâng cao); **Quản lý địa điểm (catalog)** (admin tạo/sửa/xóa địa điểm với thông tin đầy đủ bao gồm tên, mô tả, loại, tọa độ vị trí, hình ảnh, thời gian mở cửa, gợi ý di chuyển, bật/tắt hiển thị để đảm bảo thông tin luôn cập nhật và chính xác; staff chỉ được xem danh sách và chi tiết địa điểm). |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - AI ASSISTANT VÀ GỢI Ý

### Bảng 9: Mô tả chức năng AI Assistant và gợi ý

| Tên chức năng | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **AI Assistant và gợi ý** | Customer, Staff, Admin, System | - **Chat với AI Assistant**: JWT token hợp lệ, Câu hỏi của khách hàng về phòng/dịch vụ/địa điểm<br>- **Gợi ý phòng/dịch vụ theo sở thích**: JWT token hợp lệ, Lịch sử đặt phòng, Sở thích người dùng (tùy chọn)<br>- **Gợi ý phản hồi chat**: JWT token với role Staff, Câu hỏi của khách hàng trong chat, Ngữ cảnh conversation<br>- **Gợi ý tác nghiệp**: JWT token với role Staff, Ngữ cảnh công việc hiện tại<br>- **Quản trị AI & dữ liệu**: JWT token với role Admin, Cấu hình AI, Dữ liệu training | - **Chat với AI Assistant**: Câu trả lời từ AI về phòng/dịch vụ/địa điểm, Gợi ý phù hợp, Fallback response nếu API lỗi<br>- **Gợi ý phòng/dịch vụ**: Danh sách phòng/dịch vụ được gợi ý dựa trên sở thích và lịch sử, Hiển thị trong trang tìm kiếm/phòng chi tiết<br>- **Gợi ý phản hồi chat**: Các câu trả lời đề xuất (FAQ, chính sách, hướng dẫn), Staff có thể chỉnh sửa trước khi gửi<br>- **Gợi ý tác nghiệp**: Gợi ý các thao tác phù hợp với ngữ cảnh công việc<br>- **Quản trị AI**: Cấu hình AI được cập nhật, Dữ liệu được quản lý, Tính năng được bật/tắt | Hệ thống cung cấp đầy đủ các chức năng AI Assistant và gợi ý: **Chat với AI Assistant** (khách hàng chat với AI assistant để được tư vấn về phòng, dịch vụ và địa điểm du lịch, hệ thống tích hợp Groq API để xử lý câu hỏi, AI phân tích câu hỏi và đưa ra các gợi ý phù hợp dựa trên thông tin có sẵn trong hệ thống, nếu API lỗi thì có fallback responses để đảm bảo trải nghiệm người dùng không bị gián đoạn); **Gợi ý phòng/dịch vụ theo sở thích** (hệ thống phân tích preferences của user và lịch sử đặt phòng để gợi ý loại phòng/dịch vụ phù hợp, hiển thị trong trang tìm kiếm và trang chi tiết phòng, tính năng có thể bật/tắt theo môi trường); **Gợi ý phản hồi chat** (khi staff đang chat với khách hàng, AI đề xuất nhanh các câu trả lời dựa trên FAQ, chính sách, hướng dẫn check-in/out, báo giá cơ bản, staff có thể chỉnh sửa trước khi gửi để đảm bảo tính cá nhân hóa); **Gợi ý tác nghiệp** (AI gợi ý các thao tác phù hợp với ngữ cảnh công việc hiện tại của staff, giúp tăng hiệu quả làm việc); **Quản trị AI & dữ liệu** (admin quản lý cấu hình AI, dữ liệu training, bật/tắt từng tính năng AI theo môi trường, quản lý API keys và rate limiting). |

---

## 📋 BẢNG MÔ TẢ CHỨC NĂNG - DASHBOARD VÀ BÁO CÁO

### Bảng 10: Mô tả chức năng Dashboard và báo cáo

| Tên chức năng | Tác nhân | Điều kiện đầu vào | Kết quả đầu ra | Mô tả |
|---|---|---|---|---|
| **Dashboard và báo cáo** | Staff, Admin | - **Xem dashboard**: JWT token với role Staff/Admin<br>- **Xem thống kê**: JWT token với role Staff/Admin, Khoảng thời gian (ngày/tuần/tháng), Bộ lọc (tùy chọn)<br>- **Xem biểu đồ**: JWT token với role Staff/Admin, Loại biểu đồ, Khoảng thời gian<br>- **Xuất báo cáo Excel**: JWT token với role Staff/Admin, Loại báo cáo, Bộ lọc, Khoảng thời gian<br>- **Xuất báo cáo PDF**: JWT token với role Admin, Loại báo cáo, Bộ lọc, Khoảng thời gian<br>- **Xem báo cáo tài chính**: JWT token với role Admin, Khoảng thời gian, Bộ lọc (kênh, loại phòng) | - **Xem dashboard**: Tổng quan đặt phòng, công suất phòng, thông báo gần đây, việc cần làm, các chỉ số quan trọng<br>- **Xem thống kê**: Thống kê số liệu chi tiết (số lượng đặt phòng, doanh thu, tỷ lệ hủy, số lượng khách, công suất phòng) theo ngày/tuần/tháng<br>- **Xem biểu đồ**: Biểu đồ xu hướng công suất phòng, doanh thu, nguồn kênh, so sánh theo thời gian<br>- **Xuất báo cáo Excel**: File Excel được tạo với dữ liệu báo cáo theo bộ lọc, Có thể tải về<br>- **Xuất báo cáo PDF**: File PDF được tạo với định dạng chuẩn, đóng dấu, Có thể tải về<br>- **Xem báo cáo tài chính**: Báo cáo doanh thu/chi phí/lợi nhuận, Phân tích theo kênh và loại phòng, Biểu đồ và số liệu chi tiết | Hệ thống cung cấp đầy đủ các chức năng dashboard và báo cáo: **Xem dashboard** (staff/admin xem dashboard tổng quan với các biểu đồ và thống kê về tình hình đặt phòng, công suất phòng, doanh thu, thông báo gần đây, danh sách việc cần làm và các chỉ số quan trọng khác, giúp quản lý đưa ra quyết định nhanh chóng và chính xác); **Xem thống kê** (staff/admin xem thống kê số liệu chi tiết theo ngày, tuần hoặc tháng về số lượng đặt phòng, doanh thu, tỷ lệ hủy, số lượng khách, công suất phòng với các bộ lọc tùy chọn); **Xem biểu đồ** (staff/admin xem các biểu đồ xu hướng về công suất phòng, doanh thu, nguồn kênh đặt phòng, so sánh theo thời gian để phân tích xu hướng và đưa ra quyết định); **Xuất báo cáo Excel** (staff/admin xuất dữ liệu báo cáo ra file Excel theo bộ lọc và khoảng thời gian, file có thể tải về để lưu trữ hoặc phân tích thêm); **Xuất báo cáo PDF** (admin xuất báo cáo ra file PDF với định dạng chuẩn, đóng dấu, phù hợp để in ấn hoặc chia sẻ với các bên liên quan); **Xem báo cáo tài chính** (admin xem báo cáo tài chính chi tiết về doanh thu, chi phí và lợi nhuận, phân tích theo kênh đặt phòng và loại phòng, bao gồm biểu đồ và số liệu chi tiết để hỗ trợ quyết định kinh doanh). |

---

## 📊 TÓM TẮT

### Yêu cầu chức năng: **80+ use cases**
- Authentication & Authorization: 10 use cases
- Room Management: 7 use cases
- Booking Management: 11 use cases
- Payment & Invoice: 14 use cases
- Service Management: 9 use cases
- Chat & Realtime: 8 use cases
- Notifications: 8 use cases
- Location Management: 4 use cases
- AI Assistant: 2 use cases
- Dashboard & Reports: 6 use cases
- Guests Management: 5 use cases
- System Automation: 10+ use cases

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

