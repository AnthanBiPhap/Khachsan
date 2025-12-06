flowchart TD
    Start([Start]) --> Input[/Input: action, serviceData, serviceId/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Tạo dịch vụ| CreateService[Tạo dịch vụ mới với thông tin từ serviceData]
    CreateService --> SaveService[Lưu vào database]
    SaveService --> CreateSuccess[/Tạo dịch vụ thành công/]
    CheckAction -->|Cập nhật trạng thái| FindBooking[Tìm service booking theo ID]
    FindBooking --> UpdateStatus[Cập nhật trạng thái service booking]
    UpdateStatus --> SyncInvoice[Đồng bộ chi phí vào invoice]
    SyncInvoice --> SaveStatus[Lưu vào database]
    SaveStatus --> UpdateSuccess[/Cập nhật trạng thái thành công/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    CreateSuccess --> Return[/Return result/]
    UpdateSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

