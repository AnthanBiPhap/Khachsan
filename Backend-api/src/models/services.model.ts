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
