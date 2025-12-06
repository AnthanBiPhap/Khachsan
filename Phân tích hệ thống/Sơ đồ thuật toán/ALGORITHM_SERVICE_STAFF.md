flowchart TD
    Start([Start]) --> Input[/Input: action, serviceBookingId, status/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Cập nhật trạng thái| FindBooking[Tìm service booking theo ID]
    FindBooking --> CheckPermission[Kiểm tra quyền thay đổi trạng thái]
    CheckPermission --> UpdateStatus[Cập nhật trạng thái service booking]
    UpdateStatus --> SyncInvoice[Đồng bộ chi phí vào invoice]
    SyncInvoice --> SaveToDB[Lưu vào database]
    SaveToDB --> UpdateSuccess[/Cập nhật trạng thái thành công/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    UpdateSuccess --> Return[/Return result/]
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

