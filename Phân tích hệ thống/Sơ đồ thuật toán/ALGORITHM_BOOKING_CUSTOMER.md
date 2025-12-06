flowchart TD
    Start([Start]) --> Input[/Input: action, roomId, checkIn, checkOut, guests/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Đặt phòng cá nhân| CheckAvailability[Kiểm tra tính khả dụng phòng]
    CheckAvailability --> CheckAvailable{Phòng khả dụng?}
    CheckAvailable -->|không| NotAvailable[/Phòng không khả dụng/]
    CheckAvailable -->|có| CalculatePrice[Tính toán tổng giá]
    CalculatePrice --> CreateBooking[Tạo booking]
    CreateBooking --> SaveToDB[Lưu vào database]
    SaveToDB --> BookSuccess[/Đặt phòng thành công/]
    CheckAction -->|Xem danh sách| GetList[Lấy danh sách booking của user]
    GetList --> ListSuccess[/Danh sách booking/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    NotAvailable --> Return[/Return result/]
    BookSuccess --> Return
    ListSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

