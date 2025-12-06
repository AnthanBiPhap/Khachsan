flowchart TD
    Start([Start]) --> Input[/Input: action, excelFile, bookingId/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Import file Excel| ReadFile[Đọc file Excel danh sách thành viên]
    ReadFile --> ValidateData[Validate dữ liệu]
    ValidateData --> CheckValid{Dữ liệu hợp lệ?}
    CheckValid -->|không| InvalidData[/Dữ liệu không hợp lệ/]
    CheckValid -->|có| SaveToGroupBooking[Lưu thông tin thành viên vào group booking]
    SaveToGroupBooking --> SaveToDB[Lưu vào database]
    SaveToDB --> ImportSuccess[/Import thành công/]
    CheckAction -->|Export danh sách thành viên| GetMembers[Lấy danh sách thành viên từ group booking]
    GetMembers --> CreateExcel[Tạo file Excel]
    CreateExcel --> ExportSuccess[/Export thành công/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    InvalidData --> Return[/Return result/]
    ImportSuccess --> Return
    ExportSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

