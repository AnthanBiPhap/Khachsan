import createError from 'http-errors';
import User from '../models/users.model';
import bcrypt from 'bcryptjs';
/**
 * Service :
 * - Nhận đầu vào từ controller
 * - Xử lý logic
 * - Lấy dữ liệu về cho Controller
 */

const getAll = async(query: any) => {
    const { page = 1, limit = 10} = query;
    let sortObject = {};
    const sortType = query.sort_type || 'desc';
    const sortBy = query.sort_by || 'createdAt';
    sortObject = {...sortObject, [sortBy]: sortType === 'desc' ? -1 : 1};

    console.log('sortObject : ', sortObject);
    console.log(query);

    //Tìm kiếm theo điều kiện
    let where = { deletedAt: null }; // Chỉ lấy users chưa bị xóa
    // nếu có tìm kiếm theo tên nhân viên
    if (query.fullName && query.fullName.length > 0) {
        where = { ...where, fullName: { $regex: query.fullName, $options: 'i'}};
    }
    const users = await User
    .find(where)
    .skip((page-1)*limit)
    .limit(limit)
    .sort({...sortObject});

    //Đếm tổng số record hiện có của collection user (chưa bị xóa)
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

const getById = async(id: string) => {
    const user = await User.findOne({ _id: id, deletedAt: null }).select('-password');
        if (!user) {
            //throw new Error("user not found");
            throw createError(404, "user not found");
        }
        return user;
}

const create = async (payload: any) => {
    //kiểm tra xem email có tồn tại không (chỉ kiểm tra users chưa bị xóa)
    const emailExist = await User.findOne({email: payload.email, deletedAt: null});
    if(emailExist) {
        throw createError(400, 'Email đã được sử dụng. Vui lòng chọn email khác.');
    }
    
    //kiểm tra xem số điện thoại có tồn tại không (chỉ kiểm tra users chưa bị xóa)
    const phoneExist = await User.findOne({phoneNumber: payload.phoneNumber, deletedAt: null});
    if(phoneExist) {
        throw createError(400, 'Số điện thoại đã được sử dụng. Vui lòng chọn số điện thoại khác.');
    }
    
    const user = new User({
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        password: payload.password,
        dateOfBirth: payload.dateOfBirth,
        role: payload.role,
        isActive: payload.isActive,
        preferences: payload.preferences || []
       
    });
    // lưu vào database
    await user.save();
    // trả về item được tạo ra
    return user;
}

const updateById = async (id: string, payload: any) => {
    const user = await getById(id);
  
    // check trùng email (chỉ kiểm tra users chưa bị xóa)
    if (payload.email) {
      const emailExist = await User.findOne({
        email: payload.email,
        _id: { $ne: id },
        deletedAt: null,
      });
      if (emailExist) throw createError(400, "Email đã được sử dụng. Vui lòng chọn email khác.");
    }
    
    // check trùng số điện thoại (chỉ kiểm tra users chưa bị xóa)
    if (payload.phoneNumber) {
      const phoneExist = await User.findOne({
        phoneNumber: payload.phoneNumber,
        _id: { $ne: id },
        deletedAt: null,
      });
      if (phoneExist) throw createError(400, "Số điện thoại đã được sử dụng. Vui lòng chọn số điện thoại khác.");
    }
  
    // chỉ giữ field có value hợp lệ
    const cleanUpdates = Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );
  
    if (payload.password) {
        // Mã hóa lại mật khẩu mới
        const hashedPassword = await bcrypt.hash(payload.password, 10);
        cleanUpdates.password = hashedPassword; // Cập nhật mật khẩu đã mã hóa
    }
  
    Object.assign(user, cleanUpdates);
    await user.save();
    return user;
  };
  
const deleteById = async(id: string) => {
    // kiểm tra xem id có tồn tại không
    const user = await getById(id);
    // thực hiện soft delete - chỉ set deletedAt
    user.deletedAt = new Date();
    await user.save();
    return user;
}

// Lấy danh sách users đã bị xóa (soft delete)
const getDeletedUsers = async(query: any) => {
    const { page = 1, limit = 10} = query;
    let sortObject = {};
    const sortType = query.sort_type || 'desc';
    const sortBy = query.sort_by || 'deletedAt';
    sortObject = {...sortObject, [sortBy]: sortType === 'desc' ? -1 : 1};

    //Tìm kiếm theo điều kiện - chỉ lấy users đã bị xóa
    let where = { deletedAt: { $ne: null } };
    // nếu có tìm kiếm theo tên nhân viên
    if (query.fullName && query.fullName.length > 0) {
        where = { ...where, fullName: { $regex: query.fullName, $options: 'i'}};
    }
    const users = await User
    .find(where)
    .skip((page-1)*limit)
    .limit(limit)
    .sort({...sortObject});

    //Đếm tổng số record đã bị xóa
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