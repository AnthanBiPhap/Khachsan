flowchart TD
    Start([Start]) --> Input[/Input: action, filters, checkIn, checkOut, guests, roomType, priceRange, roomId/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Tìm kiếm phòng| CheckAvailability[Kiểm tra tính khả dụng phòng\ndựa trên bookings hiện có]
    CheckAvailability --> FilterByTime[Lọc phòng còn trống trong khoảng thời gian]
    FilterByTime --> FilterByConditions[Lọc theo số lượng khách, loại phòng, khoảng giá]
    FilterByConditions --> SearchSuccess[/Danh sách phòng khả dụng/]
    CheckAction -->|Xem danh sách| GetList[Lấy danh sách phòng\náp dụng bộ lọc loại phòng, giá, tiện nghi]
    GetList --> ListSuccess[/Danh sách phòng/]
    CheckAction -->|Xem chi tiết| GetRoomInfo[Lấy thông tin phòng\npopulate loại phòng]
    GetRoomInfo --> GetRoomDetails[Lấy mô tả, tiện nghi, hình ảnh, giá\ntừ loại phòng]
    GetRoomDetails --> DetailSuccess[/Chi tiết phòng/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    SearchSuccess --> Return[/Return result/]
    ListSuccess --> Return
    DetailSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

