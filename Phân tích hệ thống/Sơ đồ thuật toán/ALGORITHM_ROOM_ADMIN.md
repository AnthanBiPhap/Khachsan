flowchart TD
    Start([Start]) --> Input[/Input: action, roomData, roomId/]
    Input --> Validate[Validate action]
    Validate --> CheckAction[Chọn action]
    CheckAction --> CheckAdd{Thêm?}
    
    CheckAdd -->|có| CheckRoomNumber[Kiểm tra roomNumber đã tồn tại?]
    CheckRoomNumber --> CheckExists{Số phòng đã tồn tại?}
    CheckExists -->|có| RoomExists[/Số phòng đã tồn tại/]
    RoomExists --> CheckEdit
    CheckExists -->|không| CreateRoom[Tạo phòng mới]
    CreateRoom --> SaveRoom[Lưu vào database]
    SaveRoom --> CreateSuccess[/Tạo phòng thành công/]
    
    CheckAdd -->|không| CheckEdit{Sửa?}
    CheckEdit -->|có| UpdateRoom[Cập nhật thông tin phòng]
    UpdateRoom --> SaveUpdate[Lưu vào database]
    SaveUpdate --> UpdateSuccess[/Sửa phòng thành công/]
    
    CheckEdit -->|không| CheckDelete{Xóa?}
    CheckDelete -->|có| DeleteRoom[Xóa phòng]
    DeleteRoom --> SaveDelete[Lưu vào database]
    SaveDelete --> DeleteSuccess[/Xóa phòng thành công/]
    
    CheckDelete -->|không| CheckUpdate{Cập nhật?}
    CheckUpdate -->|có| UpdateStatus[Cập nhật trạng thái phòng]
    UpdateStatus --> SaveStatus[Lưu vào database]
    SaveStatus --> UpdateStatusSuccess[/Cập nhật trạng thái thành công/]
    
    CheckUpdate -->|không| Error[/Action không hợp lệ/]
    
    CreateSuccess --- Return[/Return result/]
    UpdateSuccess --- Return
    DeleteSuccess --- Return
    UpdateStatusSuccess --- Return
    Error --- Return
    Return --> Stop([Stop])

