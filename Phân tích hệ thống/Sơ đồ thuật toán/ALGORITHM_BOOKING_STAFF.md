flowchart TD
    Start([Start]) --> Input[/Input: action, bookingId, status/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Cập nhật trạng thái| FindBookingStatus[Tìm booking theo bookingId]
    FindBookingStatus --> CheckPermission[Kiểm tra quyền thay đổi trạng thái]
    CheckPermission --> UpdateStatus[Cập nhật booking status\npending, confirmed, checked_in, checked_out, cancelled]
    UpdateStatus --> SaveStatus[Lưu vào database]
    SaveStatus --> StatusSuccess[/Cập nhật trạng thái thành công/]
    CheckAction -->|Check-in| FindBookingCheckIn[Tìm booking theo bookingId]
    FindBookingCheckIn --> CheckCheckInCondition[Kiểm tra điều kiện check-in]
    CheckCheckInCondition --> UpdateCheckInTime[Cập nhật thời gian check-in]
    UpdateCheckInTime --> UpdateCheckInStatus[Cập nhật trạng thái checked_in]
    UpdateCheckInStatus --> SaveCheckIn[Lưu vào database]
    SaveCheckIn --> CheckInSuccess[/Check-in thành công/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    StatusSuccess --> Return[/Return result/]
    CheckInSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

