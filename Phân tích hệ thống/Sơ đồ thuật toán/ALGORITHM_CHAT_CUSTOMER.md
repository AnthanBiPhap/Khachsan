flowchart TD
    Start([Start]) --> Input[/Input: action, message, file/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Gửi tin nhắn| AutoMatch[Tự động ghép với staff online]
    AutoMatch --> SaveMessage[Lưu tin nhắn vào database]
    SaveMessage --> EmitEvent[Phát sự kiện qua Socket.IO]
    EmitEvent --> SendSuccess[/Tin nhắn đã gửi/]
    CheckAction -->|Xem lịch sử| GetHistory[Lấy lịch sử chat với phân trang]
    GetHistory --> HistorySuccess[/Lịch sử chat/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    SendSuccess --> Return[/Return result/]
    HistorySuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

