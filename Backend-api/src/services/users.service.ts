import createError from 'http-errors';
import User from '../models/users.model';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import emailService from './email.service';
/**
 * Service :
 * - Nhận đầu vào từ controller
 * - Xử lý logic
 * - Lấy dữ liệu về cho Controller
 */

/**
 * Lấy danh sách tất cả users chưa bị xóa với các bộ lọc (fullName) và phân trang
 */
const getAll = async(query: any) => {
    // Thiết lập phân trang
    const { page = 1, limit = 10} = query;
    // Thiết lập sắp xếp
    let sortObject = {};
    const sortType = query.sort_type || 'desc';
    const sortBy = query.sort_by || 'createdAt';
    sortObject = {...sortObject, [sortBy]: sortType === 'desc' ? -1 : 1};

    console.log('sortObject : ', sortObject);
    console.log(query);

    // Xây dựng điều kiện tìm kiếm
    let where: any = { deletedAt: null }; // Chỉ lấy users chưa bị xóa
    // Lọc theo tên (tìm kiếm không phân biệt hoa thường)
    if (query.fullName && query.fullName.length > 0) {
        where = { ...where, fullName: { $regex: query.fullName, $options: 'i'}};
    }
    
    // Tìm users với phân trang
    const users = await User
    .find(where)
    .skip((page-1)*limit)
    .limit(limit)
    .sort({...sortObject});

    // Đếm tổng số record hiện có của collection user (chưa bị xóa)
    const count = await User.countDocuments(where);
    console.log('user: ', users);

    return {
        users,
        pagination: {
            totalRecord: count,
            limit,
            page
        }
    };
}

/**
 * Lấy thông tin chi tiết của một user theo ID.
 * Tự động loại bỏ user đã bị xóa và không trả về password
 */
const getById = async(id: string) => {
    const user = await User.findOne({ _id: id, deletedAt: null }).select('-password');
    // Nếu không tìm thấy user thì báo lỗi
    if (!user) {
        throw createError(404, "Không tìm thấy người dùng");
    }
    return user;
}

/**
 * Tạo user mới: kiểm tra trùng lặp email và số điện thoại,
 * tạo token xác nhận email cho customer, gửi email xác nhận và tạo user
 */
const create = async (payload: any) => {
    // Kiểm tra xem email có tồn tại không (chỉ kiểm tra users chưa bị xóa)
    const emailExist = await User.findOne({email: payload.email, deletedAt: null});
    // Nếu email đã tồn tại thì báo lỗi
    if(emailExist) {
        throw createError(400, 'Email đã được sử dụng. Vui lòng chọn email khác.');
    }
    
    // Kiểm tra xem số điện thoại có tồn tại không (chỉ kiểm tra users chưa bị xóa)
    const phoneExist = await User.findOne({phoneNumber: payload.phoneNumber, deletedAt: null});
    // Nếu số điện thoại đã tồn tại thì báo lỗi
    if(phoneExist) {
        throw createError(400, 'Số điện thoại đã được sử dụng. Vui lòng chọn số điện thoại khác.');
    }
    
    // Tạo token xác nhận email (chỉ cho customer, admin và staff không cần xác nhận)
    const isCustomer = !payload.role || payload.role === 'customer';
    let emailVerificationToken = undefined;
    let emailVerificationTokenExpires = undefined;
    
    // Nếu là customer thì tạo token xác nhận email
    if (isCustomer) {
        // Tạo token ngẫu nhiên 32 bytes
        emailVerificationToken = crypto.randomBytes(32).toString('hex');
        // Token hết hạn sau 24 giờ
        emailVerificationTokenExpires = new Date();
        emailVerificationTokenExpires.setHours(emailVerificationTokenExpires.getHours() + 24);
    }
    
    // Tạo user mới với các thông tin từ payload
    const user = new User({
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        password: payload.password,
        dateOfBirth: payload.dateOfBirth || undefined,
        role: payload.role || 'customer', // Mặc định role là customer
        isActive: payload.isActive,
        preferences: payload.preferences || [],
        emailVerified: !isCustomer, // Admin và staff mặc định đã verified
        emailVerificationToken: emailVerificationToken,
        emailVerificationTokenExpires: emailVerificationTokenExpires
    });
    
    // Lưu user vào database
    await user.save();
    
    // Gửi email xác nhận cho customer
    if (isCustomer && emailVerificationToken) {
        try {
            await emailService.sendEmailVerification({
                to: user.email,
                fullName: user.fullName,
                verificationToken: emailVerificationToken
            });
            console.log(`✅ Đã gửi email xác nhận đến ${user.email}`);
        } catch (emailError) {
            console.error("❌ Lỗi gửi email xác nhận:", emailError);
            // Không throw error để không làm crash quá trình đăng ký
            // User vẫn được tạo, nhưng cần xác nhận email sau
        }
    }
    
    // Trả về user đã tạo (không trả về password và token để bảo mật)
    const userResponse: any = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    return userResponse;
}

/**
 * Cập nhật user theo ID: kiểm tra trùng lặp email và số điện thoại nếu thay đổi,
 * mã hóa password nếu có, lọc bỏ các giá trị rỗng và cập nhật
 */
const updateById = async (id: string, payload: any) => {
    const user = await getById(id);
  
    // Kiểm tra trùng lặp email nếu thay đổi (chỉ kiểm tra users chưa bị xóa)
    if (payload.email) {
      const emailExist = await User.findOne({
        email: payload.email,
        _id: { $ne: id }, // Loại trừ chính user đang cập nhật
        deletedAt: null,
      });
      // Nếu email đã tồn tại thì báo lỗi
      if (emailExist) throw createError(400, "Email đã được sử dụng. Vui lòng chọn email khác.");
    }
    
    // Kiểm tra trùng lặp số điện thoại nếu thay đổi (chỉ kiểm tra users chưa bị xóa)
    if (payload.phoneNumber) {
      const phoneExist = await User.findOne({
        phoneNumber: payload.phoneNumber,
        _id: { $ne: id }, // Loại trừ chính user đang cập nhật
        deletedAt: null,
      });
      // Nếu số điện thoại đã tồn tại thì báo lỗi
      if (phoneExist) throw createError(400, "Số điện thoại đã được sử dụng. Vui lòng chọn số điện thoại khác.");
    }
  
    // Lọc bỏ các giá trị rỗng, null hoặc undefined để chỉ cập nhật các trường hợp lệ
    const cleanUpdates = Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );
  
    // Nếu có password mới thì mã hóa trước khi lưu
    if (payload.password) {
        // Mã hóa password với bcrypt (salt rounds = 10)
        const hashedPassword = await bcrypt.hash(payload.password, 10);
        cleanUpdates.password = hashedPassword; // Cập nhật mật khẩu đã mã hóa
    }
  
    // Cập nhật user với các giá trị đã lọc
    Object.assign(user, cleanUpdates);
    await user.save();
    return user;
  };
  
/**
 * Xóa user theo ID: thực hiện soft delete bằng cách đặt deletedAt = thời gian hiện tại
 */
const deleteById = async(id: string) => {
    // Kiểm tra xem user có tồn tại không
    const user = await getById(id);
    // Thực hiện soft delete - chỉ set deletedAt thay vì xóa thật
    user.deletedAt = new Date();
    await user.save();
    return user;
}

/**
 * Lấy danh sách users đã bị xóa (soft delete) với các bộ lọc (fullName) và phân trang
 */
const getDeletedUsers = async(query: any) => {
    // Thiết lập phân trang
    const { page = 1, limit = 10} = query;
    // Thiết lập sắp xếp
    let sortObject = {};
    const sortType = query.sort_type || 'desc';
    const sortBy = query.sort_by || 'deletedAt';
    sortObject = {...sortObject, [sortBy]: sortType === 'desc' ? -1 : 1};

    // Xây dựng điều kiện tìm kiếm - chỉ lấy users đã bị xóa
    let where: any = { deletedAt: { $ne: null } };
    // Lọc theo tên (tìm kiếm không phân biệt hoa thường)
    if (query.fullName && query.fullName.length > 0) {
        where = { ...where, fullName: { $regex: query.fullName, $options: 'i'}};
    }
    
    // Tìm users đã bị xóa với phân trang
    const users = await User
    .find(where)
    .skip((page-1)*limit)
    .limit(limit)
    .sort({...sortObject});

    // Đếm tổng số record đã bị xóa
    const count = await User.countDocuments(where);

    return {
        users,
        pagination: {
            totalRecord: count,
            limit,
            page
        }
    };
}

export default {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    getDeletedUsers
}