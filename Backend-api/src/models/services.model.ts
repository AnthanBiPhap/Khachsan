import { Schema, model} from "mongoose";
import bcrypt from 'bcryptjs';

const serviceSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên là bắt buộc'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Mô tả là bắt buộc'],
            trim: true,
        },
        basePrice: {
            type: Number,
            required: [true, 'Giá cơ bản là bắt buộc'],
            min: 0,
        },
        workingHours: {
            startTime: {
                type: String,
                required: [true, 'Giờ bắt đầu là bắt buộc'],
                match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ không hợp lệ (HH:MM)']
            },
            endTime: {
                type: String,
                required: [true, 'Giờ kết thúc là bắt buộc'],
                match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ không hợp lệ (HH:MM)']
            }
        },
        slots: {
            type: Array,
            default: []
        },
        images: {
            type: Array,
            default: []
        },
        status: {
            type: String,
            enum: ["active", "hidden", "deleted"],
            default: "active",
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);


export default model('Service', serviceSchema);
