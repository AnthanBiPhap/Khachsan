flowchart TD
    Start([Start]) --> Input[/Input: action, bookingId, checkInTime, checkOutTime/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Check-in| FindBookingCheckIn[Tìm booking theo bookingId]
    FindBookingCheckIn --> CheckCheckInCondition[Kiểm tra điều kiện check-in]
    CheckCheckInCondition --> UpdateCheckInTime[Cập nhật thời gian check-in]
    UpdateCheckInTime --> UpdateCheckInStatus[Cập nhật trạng thái checked_in]
    UpdateCheckInStatus --> SaveCheckIn[Lưu vào database]
    SaveCheckIn --> CheckInSuccess[/Check-in thành công/]
    CheckAction -->|Check-out| FindBookingCheckOut[Tìm booking theo bookingId]
    FindBookingCheckOut --> CheckCheckOutCondition[Kiểm tra điều kiện check-out]
    CheckCheckOutCondition --> UpdateCheckOutTime[Cập nhật thời gian check-out]
    UpdateCheckOutTime --> UpdateCheckOutStatus[Cập nhật trạng thái checked_out]
    UpdateCheckOutStatus --> SaveCheckOut[Lưu vào database]
    SaveCheckOut --> CheckOutSuccess[/Check-out thành công/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    CheckInSuccess --> Return[/Return result/]
    CheckOutSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

