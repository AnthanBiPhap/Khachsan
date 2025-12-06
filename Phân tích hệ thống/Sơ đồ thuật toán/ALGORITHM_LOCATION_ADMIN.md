flowchart TD
    Start([Start]) --> Input[/Input: action, locationData, locationId/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Tạo địa điểm| CreateLocation[Tạo địa điểm mới với thông tin từ locationData]
    CreateLocation --> SaveLocation[Lưu vào database]
    SaveLocation --> CreateSuccess[/Tạo địa điểm thành công/]
    CheckAction -->|Sửa địa điểm| FindLocation[Tìm địa điểm theo locationId]
    FindLocation --> UpdateLocation[Cập nhật thông tin địa điểm]
    UpdateLocation --> SaveUpdate[Lưu vào database]
    SaveUpdate --> UpdateSuccess[/Sửa địa điểm thành công/]
    CheckAction -->|Khác| CRUD[Kiểm tra điều kiện và thực hiện CRUD]
    CRUD --> CheckCRUD{Thành công?}
    CheckCRUD -->|không| Error[/Hiển thị lỗi/]
    CheckCRUD -->|có| CRUDSuccess[/Thực hiện thành công/]
    CreateSuccess --> Return[/Return result/]
    UpdateSuccess --> Return
    Error --> Return
    CRUDSuccess --> Return
    Return --> Stop([Stop])

