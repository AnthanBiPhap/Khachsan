import multer from "multer";
import path from "path";
import fs from "fs";

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(process.cwd(), "uploads", "zalo-qr");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: zalo-qr-timestamp-random.jpg
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `zalo-qr-${uniqueSuffix}${ext}`);
  },
});

// Filter chỉ cho phép upload ảnh
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log("🔍 File filter - mimetype:", file.mimetype);
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error("❌ File type not allowed:", file.mimetype);
    cb(new Error("Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF, WEBP)"));
  }
};

// Cấu hình multer
export const uploadZaloQR = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

