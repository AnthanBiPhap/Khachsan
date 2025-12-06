flowchart TD
    Start([Start]) --> Input[/Input: action, question, userId/]
    Input --> Validate[Validate action]
    Validate --> CheckAction{action?}
    CheckAction -->|Hỏi với AI| SendAPI[Gửi câu hỏi đến Groq API]
    SendAPI --> CheckAPI{API thành công?}
    CheckAPI -->|có| ReceiveResponse[Nhận phản hồi từ AI]
    ReceiveResponse --> AISuccess[/Gợi ý từ AI/]
    CheckAPI -->|không| UseFallback[Sử dụng fallback response]
    UseFallback --> Fallback[/Gợi ý dự phòng/]
    CheckAction -->|Gợi ý cá nhân hóa| AnalyzePreference[Phân tích sở thích và lịch sử đặt phòng]
    AnalyzePreference --> SuggestRoom[Gợi ý phòng/dịch vụ phù hợp]
    SuggestRoom --> Personalized[/Gợi ý cá nhân hóa/]
    AISuccess --> Return[/Return result/]
    Fallback --> Return
    Personalized --> Return
    Return --> Stop([Stop])

