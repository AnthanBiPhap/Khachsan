flowchart TD
    Start([Start]) --> Input[/Input: action, bookingId, paymentData/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Ghi nhận thanh toán| FindBooking[Tìm booking theo bookingId]
    FindBooking --> CreatePayment[Tạo payment record\nvới thông tin giao dịch]
    CreatePayment --> UpdatePaymentStatus[Cập nhật trạng thái thanh toán]
    UpdatePaymentStatus --> SavePayment[Lưu vào database]
    SavePayment --> PaymentSuccess[/Ghi nhận thanh toán thành công/]
    CheckAction -->|Tạo hóa đơn| FindBookingInvoice[Tìm booking theo bookingId]
    FindBookingInvoice --> CreateInvoice[Tạo invoice từ booking]
    CreateInvoice --> CalculateTotal[Tính toán tổng tiền]
    CalculateTotal --> SaveInvoice[Lưu vào database]
    SaveInvoice --> InvoiceSuccess[/Tạo hóa đơn thành công/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    PaymentSuccess --> Return[/Return result/]
    InvoiceSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

