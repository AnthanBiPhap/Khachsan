import { Schema, model} from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Tên là bắt buộc'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
        },
        password: {
            type: String,
            required: [true, 'Mật khẩu là bắt buộc'],
            minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
        },
        phoneNumber: {
            type: String,
            required: [true, 'Số điện thoại là bắt buộc'],
            trim: true,
            match: [/^(0[1-9][0-9]{8,9}|\+84[1-9][0-9]{8,9})$/, 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (bắt đầu bằng 0 hoặc +84)']
        },
        dateOfBirth: {
            type: Date,
            required: false
        },
        role: {
            type: String,
            enum: ['customer','staff','admin'],
            default: 'customer'
        },
        status: {
            type: String,
            enum: ['active','blocked'],
            default: 'active'
        },
        preferences: {
            type: Array,
            default: ['tham quan','ăn uống','thể thao','phim ảnh','sách','game','du lịch','thư giãn','thăm bảo tàng','thăm vườn quốc gia']
        },
        emailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: {
            type: String,
            required: false
        },
        emailVerificationTokenExpires: {
            type: Date,
            required: false
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);
//Middleware pre save ở lớp database
//trước khi data được lưu xuống ---> mã khóa mật khẩu

userSchema.pre('save', async function (next) {
    const user = this;
    // Nếu password không được set hoặc chưa thay đổi thì bỏ qua
    if (!user.isModified('password')) {
        return next();
    }

    if (!user.password) {
        return next(new Error("Password là bắt buộc"));
    }

    const hash = bcrypt.hashSync(user.password, 10);

    user.password = hash;

    next();
})

export default model('User', userSchema);
