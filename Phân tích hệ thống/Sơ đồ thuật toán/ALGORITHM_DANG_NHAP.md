flowchart TD
    Start([Start]) --> Input[/Input: email, password/]
    Input --> FindUser[Tìm user theo email trong database]
    FindUser --> CheckUserExists{User không tồn tại?}
    CheckUserExists -->|có| UserNotFound[/Email hoặc mật khẩu sai/]
    CheckUserExists -->|không| CheckLocked{Tài khoản bị khóa?}
    CheckLocked -->|có| AccountLocked[/Tài khoản đã bị khóa/]
    CheckLocked -->|không| CheckVerified{Email chưa xác thực?\nCustomer?}
    CheckVerified -->|có| EmailNotVerified[/Vui lòng xác thực email/]
    CheckVerified -->|không| ComparePass[So sánh mật khẩu với bcrypt]
    ComparePass --> CheckPass{Mật khẩu sai?}
    CheckPass -->|có| InvalidPass[/Email hoặc mật khẩu sai/]
    CheckPass -->|không| CreateAccessToken[Tạo access token\nhết hạn 24 giờ]
    CreateAccessToken --> CreateRefreshToken[Tạo refresh token\nhết hạn 365 ngày]
    CreateRefreshToken --> Success[/Đăng nhập thành công\n+ accessToken\n+ refreshToken/]
    
    UserNotFound --- Return[/Return result/]
    AccountLocked --- Return
    EmailNotVerified --- Return
    InvalidPass --- Return
    Success --- Return
    Return --> Stop([Stop])

