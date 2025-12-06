flowchart TD
    Start([Start]) --> Input[/Input: action, excelFile, filters, format/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Import danh sách khách hàng| ReadFile[Đọc file Excel danh sách khách hàng]
    ReadFile --> ValidateData[Validate dữ liệu]
    ValidateData --> CheckValid{Dữ liệu hợp lệ?}
    CheckValid -->|không| InvalidData[/Dữ liệu không hợp lệ/]
    CheckValid -->|có| SaveToDB[Lưu thông tin khách hàng vào database]
    SaveToDB --> ImportSuccess[/Import thành công/]
    CheckAction -->|Export báo cáo| GetReportData[Lấy dữ liệu báo cáo với bộ lọc]
    GetReportData --> CheckFormat{format = Excel?}
    CheckFormat -->|có| CreateExcel[Tạo file Excel]
    CheckFormat -->|không| CreatePDF[Tạo file PDF]
    CreateExcel --> ExportSuccess[/Export thành công/]
    CreatePDF --> ExportSuccess
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

