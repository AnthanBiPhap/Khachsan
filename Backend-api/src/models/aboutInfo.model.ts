import { Schema, model } from "mongoose";

const aboutInfoSchema = new Schema(
  {
    heroTitle: {
      type: String,
      default: "Về Chúng Tôi",
      trim: true,
    },
    heroDescription: {
      type: String,
      default: "Khám phá câu chuyện và giá trị của Miko Hotel",
      trim: true,
    },
    heroImage: {
      type: String,
      default: "https://acihome.vn/uploads/15/thiet-ke-khach-san-ven-bien-dang-cap-nghi-duong-5-sao-tien-nghi-hien-dai-3.jpg",
      trim: true,
    },
    stats: {
      yearsExperience: {
        number: { type: String, default: "10+" },
        label: { type: String, default: "Năm kinh nghiệm" },
      },
      rooms: {
        number: { type: String, default: "50+" },
        label: { type: String, default: "Phòng nghỉ" },
      },
      satisfiedCustomers: {
        number: { type: String, default: "50K+" },
        label: { type: String, default: "Khách hàng hài lòng" },
      },
      averageRating: {
        number: { type: String, default: "4.8" },
        label: { type: String, default: "Đánh giá trung bình" },
      },
    },
    introduction: {
      title: {
        type: String,
        default: "Chào mừng đến với Miko Hotel",
        trim: true,
      },
      description: {
        type: String,
        default: "Tọa lạc tại trung tâm thành phố Đà Nẵng, Miko Hotel tự hào là điểm đến lý tưởng cho những ai yêu thích sự tiện nghi, sang trọng và phong cách phục vụ chuyên nghiệp. Với vị trí đắc địa, từ đây quý khách có thể dễ dàng khám phá những điểm đến du lịch nổi tiếng của thành phố biển xinh đẹp này.",
        trim: true,
      },
    },
    story: {
      title: {
        type: String,
        default: "Câu Chuyện Của Chúng Tôi",
        trim: true,
      },
      paragraph1: {
        type: String,
        default: "Được thành lập vào năm 2015, Miko Hotel đã không ngừng phát triển và khẳng định vị thế là một trong những khách sạn hàng đầu tại Đà Nẵng. Chúng tôi bắt đầu với mong muốn mang đến cho du khách một không gian nghỉ dưỡng đẳng cấp, kết hợp giữa nét đẹp hiện đại và tinh thần phục vụ tận tâm.",
        trim: true,
      },
      paragraph2: {
        type: String,
        default: "Trải qua nhiều năm hoạt động, Miko Hotel tự hào đã đón tiếp hàng trăm ngàn lượt khách trong và ngoài nước, nhận được nhiều đánh giá tích cực và giải thưởng uy tín trong ngành dịch vụ lưu trú.",
        trim: true,
      },
      image: {
        type: String,
        default: "https://katahome.com/wp-content/uploads/2018/10/thiet-ke-noi-that-phong-ngu-khach-san-5-sao-chuan-khong-can-chinh-4.jpg",
        trim: true,
      },
    },
    mission: {
      title: {
        type: String,
        default: "Tầm Nhìn",
        trim: true,
      },
      description: {
        type: String,
        default: "Trở thành khách sạn hàng đầu tại Đà Nẵng, là điểm đến lý tưởng cho du khách trong nước và quốc tế, góp phần quảng bá hình ảnh du lịch Việt Nam.",
        trim: true,
      },
    },
    vision: {
      title: {
        type: String,
        default: "Sứ Mệnh",
        trim: true,
      },
      description: {
        type: String,
        default: "Mang đến cho khách hàng những trải nghiệm nghỉ dưỡng tuyệt vời nhất với chất lượng phục vụ vượt trội, không gian sang trọng và tiện nghi hiện đại, tạo nên những kỷ niệm đáng nhớ cho mỗi chuyến đi.",
        trim: true,
      },
    },
    features: {
      type: [
        {
          title: { type: String, trim: true },
          description: { type: String, trim: true },
          icon: { type: String, trim: true }, // Tên icon từ lucide-react
        },
      ],
      default: [
        {
          title: "Không gian sang trọng",
          description: "Phòng ốc được thiết kế hiện đại, tiện nghi với view đẹp",
          icon: "Building",
        },
        {
          title: "Chất lượng dịch vụ",
          description: "Đạt chuẩn 4 sao với đội ngũ nhân viên chuyên nghiệp",
          icon: "Award",
        },
        {
          title: "Trải nghiệm tuyệt vời",
          description: "Cam kết mang đến kỳ nghỉ đáng nhớ nhất cho quý khách",
          icon: "Heart",
        },
        {
          title: "Tiện ích đa dạng",
          description: "Nhà hàng, bar, spa, hồ bơi và nhiều tiện ích khác",
          icon: "Coffee",
        },
        {
          title: "WiFi miễn phí",
          description: "Kết nối internet tốc độ cao tại mọi khu vực",
          icon: "Wifi",
        },
        {
          title: "Đưa đón sân bay",
          description: "Dịch vụ đưa đón tận nơi, tiện lợi và an toàn",
          icon: "Car",
        },
        {
          title: "Ẩm thực đa dạng",
          description: "Nhà hàng phục vụ ẩm thực địa phương và quốc tế",
          icon: "UtensilsCrossed",
        },
        {
          title: "Hồ bơi ngoài trời",
          description: "Hồ bơi vô cực với view biển tuyệt đẹp",
          icon: "Waves",
        },
      ],
    },
    team: {
      title: {
        type: String,
        default: "Đội Ngũ Của Chúng Tôi",
        trim: true,
      },
      description: {
        type: String,
        default: "Đội ngũ nhân viên chuyên nghiệp, tận tâm luôn sẵn sàng phục vụ quý khách với tiêu chí \"Khách hàng là thượng đế\"",
        trim: true,
      },
      members: {
        type: [
          {
            name: { type: String, trim: true },
            position: { type: String, trim: true },
            image: { type: String, trim: true },
            description: { type: String, trim: true },
            email: { type: String, trim: true },
            linkedin: { type: String, trim: true },
          },
        ],
        default: [
          {
            name: "Nguyễn Ngô Hồng Ni",
            position: "Quản lý Khách sạn",
            image: "https://img.lovepik.com/photo/20211130/medium/lovepik-hotel-attendant-picture_501203514.jpg",
            description: "Với hơn 10 năm kinh nghiệm trong ngành dịch vụ lưu trú",
            email: "hongni@mikohotel.com",
            linkedin: "#",
          },
          {
            name: "Dương Cẩm Nhung",
            position: "Trưởng bộ phận Lễ tân",
            image: "https://watermark.lovepik.com/photo/20211209/large/lovepik-hotel-front-desk-service-picture_501704753.jpg",
            description: "Chuyên nghiệp, thân thiện và luôn sẵn sàng hỗ trợ quý khách",
            email: "nhung@mikohotel.com",
            linkedin: "#",
          },
          {
            name: "Nguyễn Thị Thanh Hương",
            position: "Đầu bếp trưởng",
            image: "https://img.freepik.com/premium-photo/female-asian-chef-restaurant-portrait-adult_53876-541043.jpg",
            description: "Mang đến những bữa ăn ngon với hương vị đặc trưng Đà Nẵng",
            email: "huong@mikohotel.com",
            linkedin: "#",
          },
        ],
      },
    },
  },
  { timestamps: true, versionKey: false }
);

export default model("AboutInfo", aboutInfoSchema);

