flowchart TD
    Start([Start]) --> Input[/Input: action, serviceId, bookingId/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Đặt dịch vụ| FindBooking[Tìm booking theo bookingId]
    FindBooking --> CreateServiceBooking[Tạo service booking]
    CreateServiceBooking --> CalculateCost[Tính toán chi phí dịch vụ]
    CalculateCost --> SyncInvoice[Đồng bộ chi phí vào invoice]
    SyncInvoice --> SaveToDB[Lưu vào database]
    SaveToDB --> BookSuccess[/Đặt dịch vụ thành công/]
    CheckAction -->|Xem danh sách| GetList[Lấy danh sách dịch vụ với bộ lọc\nloại và giá]
    GetList --> ListSuccess[/Danh sách dịch vụ/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    BookSuccess --> Return[/Return result/]
    ListSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

