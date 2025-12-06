flowchart TD
    Start([Start]) --> Input[/Input: email, password, phoneNumber, fullName/]
    Input --> Validate[Validate mật khẩu]
    Validate --> CheckPassword{Mật khẩu không hợp lệ?}
    CheckPassword -->|có| InvalidPass[/Mật khẩu không hợp lệ/]
    CheckPassword -->|không| CheckEmailExists[Kiểm tra email đã tồn tại?]
    CheckEmailExists --> EmailExistsCheck{Email đã tồn tại?}
    EmailExistsCheck -->|có| EmailExists[/Email đã được sử dụng/]
    EmailExistsCheck -->|không| HashPassword[Hash mật khẩu]
    HashPassword --> CreateAccount[Tạo tài khoản]
    CreateAccount --> SaveToDB[Lưu vào database]
    SaveToDB --> SendEmail[Gửi email xác thực]
    SendEmail --> Success[/Đăng ký thành công/]
    InvalidPass --> Return[/Return result/]
    EmailExists --> Return
    Success --> Return
    Return --> Stop([Stop])

