flowchart TD
    Start([Start]) --> Input[/Input: action, message, file, conversationId/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Gửi tin nhắn| SaveMessage[Lưu tin nhắn vào database]
    SaveMessage --> UpdateUnread[Cập nhật số tin nhắn chưa đọc]
    UpdateUnread --> EmitEvent[Phát sự kiện qua Socket.IO]
    EmitEvent --> SendSuccess[/Tin nhắn đã gửi/]
    CheckAction -->|Đánh dấu đã đọc| UpdateReadStatus[Cập nhật trạng thái đã đọc]
    UpdateReadStatus --> ResetUnread[Cập nhật số tin nhắn chưa đọc = 0]
    ResetUnread --> SaveReadStatus[Lưu vào database]
    SaveReadStatus --> ReadSuccess[/Đánh dấu đã đọc thành công/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    SendSuccess --> Return[/Return result/]
    ReadSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

