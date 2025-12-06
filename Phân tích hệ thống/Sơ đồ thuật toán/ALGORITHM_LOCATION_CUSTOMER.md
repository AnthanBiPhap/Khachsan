flowchart TD
    Start([Start]) --> Input[/Input: action, locationId, filters/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Xem danh sách| GetList[Lấy danh sách địa điểm với bộ lọc\nloại và khoảng cách]
    GetList --> ListSuccess[/Danh sách địa điểm/]
    CheckAction -->|Xem chi tiết| GetDetail[Lấy thông tin chi tiết địa điểm\nmô tả, hình ảnh, vị trí, thời gian mở cửa]
    GetDetail --> DetailSuccess[/Chi tiết địa điểm/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    ListSuccess --> Return[/Return result/]
    DetailSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

