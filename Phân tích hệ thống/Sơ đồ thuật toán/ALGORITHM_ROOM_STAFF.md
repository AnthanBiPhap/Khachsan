flowchart TD
    Start([Start]) --> Input[/Input: action, roomId/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Xem danh sách| GetList[Lấy danh sách phòng]
    GetList --> ListSuccess[/Danh sách phòng/]
    CheckAction -->|Xem chi tiết| GetDetail[Lấy thông tin chi tiết phòng]
    GetDetail --> DetailSuccess[/Chi tiết phòng/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    ListSuccess --> Return[/Return result/]
    DetailSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

