import createError from "http-errors";
import Coupon from "../models/coupons.model";

/**
 * Service:
 * - Nhận đầu vào từ controller
 * - Xử lý logic / validate
 * - Truy vấn DB qua Model
 * - Trả dữ liệu về controller
 */

/**
 * Lấy danh sách coupon công khai (chỉ active, chưa hết hạn, còn lượt sử dụng)
 */
const getPublicCoupons = async (query: any) => {
  const limit = Number(query.limit) || 10;
  const now = new Date();

  console.log('🔍 getPublicCoupons - Current time:', now.toISOString());
  console.log('🔍 getPublicCoupons - Limit:', limit);

  // Chỉ lấy coupon có status = "active", không filter theo date
  // Admin có thể set status = "inactive" hoặc "expired" để ẩn coupon
  const where: Record<string, any> = {
    status: "active", // Chỉ lấy coupon active
  };

  const coupons = await Coupon.find(where)
    .sort({ createdAt: -1 })
    .limit(limit);

  console.log('📦 Found active coupons:', coupons.length);
  coupons.forEach((coupon) => {
    console.log(`  - ${coupon.code}: ${coupon.name} (Status: ${coupon.status})`);
  });

  // Chỉ filter theo usage limit, không filter theo date
  const availableCoupons = coupons.filter((coupon) => {
    const hasUsageLeft = coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit;
    
    if (!hasUsageLeft) {
      console.log(`🎫 Coupon ${coupon.code} - Usage limit reached:`, {
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
      });
    }
    
    return hasUsageLeft;
  });

  console.log('✅ Available coupons after filter:', availableCoupons.length);

  return {
    coupons: availableCoupons,
  };
};

/**
 * Lấy danh sách tất cả coupon với các bộ lọc (code, status) và phân trang
 */
const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = {};

  // Lọc theo mã coupon
  if (query.code) {
    where.code = { $regex: query.code, $options: "i" };
  }

  // Lọc theo trạng thái
  if (query.status) {
    where.status = query.status;
  }

  // Lọc theo loại áp dụng
  if (query.applicableTo) {
    where.applicableTo = query.applicableTo;
  }

  const coupons = await Coupon.find(where)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  const count = await Coupon.countDocuments(where);

  return {
    coupons,
    pagination: { totalRecord: count, limit, page },
  };
};

/**
 * Lấy thông tin chi tiết của một coupon theo ID
 */
const getById = async (id: string) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw createError(404, "Không tìm thấy coupon");
  return coupon;
};

/**
 * Lấy coupon theo mã code (dùng để validate khi áp dụng)
 */
const getByCode = async (code: string) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw createError(404, "Mã coupon không tồn tại");
  return coupon;
};

/**
 * Tạo coupon mới
 */
const create = async (payload: any) => {
  // Kiểm tra mã coupon đã tồn tại chưa
  const existingCoupon = await Coupon.findOne({
    code: payload.code.toUpperCase(),
  });
  if (existingCoupon) {
    throw createError(400, "Mã coupon đã tồn tại");
  }

  // Validate discountValue
  if (payload.discountType === "percentage" && payload.discountValue > 100) {
    throw createError(400, "Giảm giá phần trăm không được vượt quá 100%");
  }

  // Validate dates
  if (payload.startDate && payload.endDate) {
    const startDate = new Date(payload.startDate);
    const endDate = new Date(payload.endDate);
    if (endDate <= startDate) {
      throw createError(400, "Ngày kết thúc phải sau ngày bắt đầu");
    }
  }

  // Tự động set status dựa trên ngày
  const now = new Date();
  let status = payload.status || "active";
  if (payload.endDate && new Date(payload.endDate) < now) {
    status = "expired";
  }

  const coupon = new Coupon({
    ...payload,
    code: payload.code.toUpperCase(),
    status,
  });

  const savedCoupon = await coupon.save();
  return savedCoupon;
};

/**
 * Cập nhật coupon theo ID
 */
const updateById = async (id: string, payload: any) => {
  const coupon = await getById(id);

  // Nếu đổi mã code, kiểm tra mã mới có trùng không
  if (payload.code && payload.code.toUpperCase() !== coupon.code) {
    const existingCoupon = await Coupon.findOne({
      code: payload.code.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingCoupon) {
      throw createError(400, "Mã coupon đã tồn tại");
    }
    payload.code = payload.code.toUpperCase();
  }

  // Validate discountValue
  if (payload.discountType === "percentage" && payload.discountValue > 100) {
    throw createError(400, "Giảm giá phần trăm không được vượt quá 100%");
  }

  // Validate dates
  if (payload.startDate && payload.endDate) {
    const startDate = new Date(payload.startDate);
    const endDate = new Date(payload.endDate);
    if (endDate <= startDate) {
      throw createError(400, "Ngày kết thúc phải sau ngày bắt đầu");
    }
  }

  // Tự động cập nhật status dựa trên ngày
  const now = new Date();
  if (payload.endDate || coupon.endDate) {
    const endDate = payload.endDate ? new Date(payload.endDate) : coupon.endDate;
    if (endDate < now) {
      payload.status = "expired";
    }
  }

  Object.assign(coupon, payload);
  const updatedCoupon = await coupon.save();
  return updatedCoupon;
};

/**
 * Xóa coupon theo ID (soft delete)
 */
const deleteById = async (id: string) => {
  const coupon = await getById(id);
  coupon.status = "inactive";
  await coupon.save();
  return coupon;
};

/**
 * Validate và áp dụng coupon
 * Kiểm tra coupon có hợp lệ không và tính toán số tiền giảm giá
 */
const validateCoupon = async (
  code: string,
  orderAmount: number,
  applicableTo: "all" | "room" | "service" = "all",
  roomAmount?: number,
  serviceAmount?: number,
  pricePerNight?: number
) => {
  const coupon = await getByCode(code);
  
  console.log('🎟️ Validating coupon:', {
    code: coupon.code,
    couponApplicableTo: coupon.applicableTo,
    requestApplicableTo: applicableTo,
    orderAmount,
    roomAmount,
    serviceAmount,
    pricePerNight,
  });

  // Kiểm tra trạng thái
  // Chỉ kiểm tra status, không kiểm tra startDate/endDate
  // Admin có thể set status = "inactive" hoặc "expired" để ẩn coupon
  if (coupon.status !== "active") {
    throw createError(400, "Coupon không còn hiệu lực");
  }

  // Không kiểm tra startDate/endDate - coupon sẽ luôn có thể sử dụng nếu status = "active"
  // Admin có thể tự quản lý status để ẩn/hiện coupon

  // Kiểm tra số lần sử dụng
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw createError(400, "Coupon đã hết lượt sử dụng");
  }

  // Xác định số tiền để tính giảm giá dựa trên applicableTo
  // QUAN TRỌNG: Coupon chỉ giảm giá cho 1 đêm (giá gốc), không phụ thuộc số đêm đặt
  let amountForDiscount = orderAmount; // Mặc định là tổng
  let amountForMinOrderCheck = orderAmount; // Số tiền để kiểm tra minOrderAmount

  if (coupon.applicableTo === "room") {
    // Nếu coupon chỉ áp dụng cho phòng, chỉ tính trên giá 1 đêm (pricePerNight)
    if (pricePerNight !== undefined) {
      amountForDiscount = pricePerNight; // Chỉ tính trên 1 đêm
      amountForMinOrderCheck = roomAmount || orderAmount; // Kiểm tra minOrderAmount trên tổng giá phòng
    } else if (roomAmount !== undefined) {
      // Fallback: nếu không có pricePerNight, dùng roomAmount
      amountForDiscount = roomAmount;
      amountForMinOrderCheck = roomAmount;
    }
  } else if (coupon.applicableTo === "all") {
    // Nếu coupon áp dụng cho tất cả, tính trên giá 1 đêm + dịch vụ
    if (pricePerNight !== undefined) {
      const serviceAmountForDiscount = serviceAmount || 0;
      amountForDiscount = pricePerNight + serviceAmountForDiscount; // 1 đêm + dịch vụ
      amountForMinOrderCheck = orderAmount; // Kiểm tra minOrderAmount trên tổng
      
      console.log('🎟️ Coupon "all" - Calculating discount:', {
        pricePerNight,
        serviceAmountForDiscount,
        amountForDiscount,
        discountPercentage: coupon.discountValue,
      });
    } else {
      // Fallback: nếu không có pricePerNight, dùng orderAmount
      amountForDiscount = orderAmount;
      amountForMinOrderCheck = orderAmount;
      console.log('⚠️ Coupon "all" - No pricePerNight, using orderAmount:', orderAmount);
    }
  } else if (coupon.applicableTo === "service") {
    // Nếu coupon chỉ áp dụng cho dịch vụ, tính trên tổng dịch vụ
    if (serviceAmount !== undefined) {
      amountForDiscount = serviceAmount;
      amountForMinOrderCheck = serviceAmount;
    }
  }

  // Kiểm tra giá trị đơn hàng tối thiểu (dựa trên phần áp dụng)
  if (coupon.minOrderAmount > 0 && amountForMinOrderCheck < coupon.minOrderAmount) {
    throw createError(
      400,
      `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString()} VNĐ để sử dụng coupon này`
    );
  }

  // Kiểm tra áp dụng cho loại nào
  // Nếu coupon là "all" thì luôn chấp nhận
  // Nếu coupon là "room" hoặc "service" thì phải khớp với applicableTo từ request
  if (coupon.applicableTo !== "all") {
    // Nếu coupon chỉ áp dụng cho room hoặc service, kiểm tra xem có khớp không
    // Nhưng nếu đang ở trang đặt phòng (applicableTo = "room"), coupon "room" hoặc "all" đều được chấp nhận
    if (coupon.applicableTo === "service" && applicableTo !== "service") {
      throw createError(
        400,
        `Coupon này chỉ áp dụng cho dịch vụ`
      );
    }
    // Coupon "room" có thể được dùng khi applicableTo = "room" hoặc "all"
    // Không cần kiểm tra thêm
  }

  // Tính toán số tiền giảm giá dựa trên phần áp dụng (chỉ 1 đêm cho room/all)
  let discountAmount = 0;
  let roomDiscount = 0;
  let serviceDiscount = 0;

  // Xử lý riêng cho coupon "all" với fixed amount
  if (coupon.applicableTo === "all" && coupon.discountType === "fixed") {
    // Với fixed amount và "all": mỗi phần được giảm số tiền cố định
    const fixedDiscountValue = coupon.discountValue;
    
    // Giảm cho phòng (1 đêm)
    if (pricePerNight !== undefined) {
      roomDiscount = Math.min(fixedDiscountValue, pricePerNight); // Không vượt quá giá phòng
    } else {
      roomDiscount = fixedDiscountValue;
    }
    
    // Giảm cho dịch vụ
    if (serviceAmount !== undefined && serviceAmount > 0) {
      serviceDiscount = Math.min(fixedDiscountValue, serviceAmount); // Không vượt quá giá dịch vụ
    } else {
      // Nếu không có dịch vụ, chỉ giảm phòng
      serviceDiscount = 0;
    }
    
    // Tổng discount = tổng của cả hai phần
    discountAmount = roomDiscount + serviceDiscount;
    
    console.log('🎟️ Coupon "all" + "fixed" - Separate discounts:', {
      fixedDiscountValue,
      roomDiscount,
      serviceDiscount,
      totalDiscountAmount: discountAmount,
    });
  } else {
    // Xử lý cho percentage hoặc các loại khác
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((amountForDiscount * coupon.discountValue) / 100);
      // Áp dụng giới hạn tối đa nếu có
      if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed amount cho "room" hoặc "service"
      discountAmount = coupon.discountValue;
      // Không được vượt quá giá trị phần áp dụng
      if (discountAmount > amountForDiscount) {
        discountAmount = amountForDiscount;
      }
    }

    // Phân bổ discount cho phòng và dịch vụ nếu coupon áp dụng cho "all" (percentage)
    if (coupon.applicableTo === "all" && coupon.discountType === "percentage" && pricePerNight !== undefined && serviceAmount !== undefined && serviceAmount > 0) {
      const totalForDiscount = pricePerNight + serviceAmount;
      if (totalForDiscount > 0) {
        // Phân bổ theo tỷ lệ cho percentage
        const roomRatio = pricePerNight / totalForDiscount;
        const serviceRatio = serviceAmount / totalForDiscount;
        
        roomDiscount = Math.round(discountAmount * roomRatio);
        serviceDiscount = Math.round(discountAmount * serviceRatio);
        
        // Đảm bảo tổng bằng discountAmount (làm tròn có thể sai lệch 1-2 VNĐ)
        const totalBreakdown = roomDiscount + serviceDiscount;
        if (totalBreakdown !== discountAmount) {
          // Điều chỉnh phần lớn hơn
          if (roomDiscount >= serviceDiscount) {
            roomDiscount += (discountAmount - totalBreakdown);
          } else {
            serviceDiscount += (discountAmount - totalBreakdown);
          }
        }
      } else {
        // Nếu không có dịch vụ, toàn bộ discount cho phòng
        roomDiscount = discountAmount;
      }
    } else if (coupon.applicableTo === "room") {
      // Chỉ giảm phòng
      roomDiscount = discountAmount;
    } else if (coupon.applicableTo === "service") {
      // Chỉ giảm dịch vụ
      serviceDiscount = discountAmount;
    } else {
      // Fallback: không phân bổ được, để discountAmount tổng
      roomDiscount = discountAmount;
    }
  }

  console.log('🎟️ Final discount calculation:', {
    amountForDiscount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    roomDiscount,
    serviceDiscount,
    maxDiscountAmount: coupon.maxDiscountAmount,
    finalAmount: orderAmount - discountAmount,
  });

  return {
    coupon,
    discountAmount,
    roomDiscount,
    serviceDiscount,
    finalAmount: orderAmount - discountAmount,
  };
};

/**
 * Tăng số lần sử dụng coupon (khi áp dụng thành công)
 */
const incrementUsage = async (code: string) => {
  const coupon = await getByCode(code);
  coupon.usedCount = (coupon.usedCount || 0) + 1;
  await coupon.save();
  return coupon;
};

export default {
  getAll,
  getPublicCoupons,
  getById,
  getByCode,
  create,
  updateById,
  deleteById,
  validateCoupon,
  incrementUsage,
};

