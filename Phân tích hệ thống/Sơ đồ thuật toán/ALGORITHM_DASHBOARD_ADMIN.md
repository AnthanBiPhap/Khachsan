flowchart TD
    Start([Start]) --> Input[/Input: action, filters, dateRange/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Xem dashboard tổng quan| GetStats[Lấy dữ liệu thống kê\nđặt phòng, công suất, doanh thu, tỷ lệ hủy]
    GetStats --> CalculateChart[Tính toán biểu đồ xu hướng]
    CalculateChart --> DisplayDashboard[/Hiển thị dashboard/]
    CheckAction -->|Xuất báo cáo| GetReportData[Lấy dữ liệu với bộ lọc\nngày/tuần/tháng, loại phòng, kênh, trạng thái]
    GetReportData --> CreateFile[Tạo file Excel hoặc PDF]
    CreateFile --> ExportSuccess[/Xuất báo cáo thành công/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    DisplayDashboard --> Return[/Return result/]
    ExportSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

