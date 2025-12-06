flowchart TD
    Start([Start]) --> Input[/Input: action, bookingId, amount/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Thanh toán online| CreateStripeSession[Tạo Stripe checkout session]
    CreateStripeSession --> RedirectStripe[Redirect đến trang thanh toán Stripe]
    RedirectStripe --> ProcessWebhook[Xử lý webhook từ Stripe]
    ProcessWebhook --> CheckPayment{Thanh toán thành công?}
    CheckPayment -->|có| CreateRecords[Tạo booking, invoice và payment record]
    CreateRecords --> SaveToDB[Lưu vào database]
    SaveToDB --> PaymentSuccess[/Thanh toán thành công/]
    CheckPayment -->|không| PaymentFailed[/Thanh toán thất bại/]
    CheckAction -->|Xem hóa đơn| GetInvoice[Lấy thông tin invoice theo bookingId]
    GetInvoice --> InvoiceSuccess[/Chi tiết hóa đơn/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    PaymentSuccess --> Return[/Return result/]
    PaymentFailed --> Return
    InvoiceSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

