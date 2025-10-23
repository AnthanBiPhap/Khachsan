import * as yup from "yup";

// Guest validation schema
const guestSchema = yup.object({
  fullName: yup.string().min(2).max(100).required("Tên khách hàng là bắt buộc"),
  idNumber: yup.string().min(9).max(20).required("Số CMND/CCCD là bắt buộc"),
  age: yup.number().min(0).max(120).required("Tuổi là bắt buộc"),
  phoneNumber: yup.string().min(6).max(20).required("Số điện thoại là bắt buộc"),
  email: yup.string().email("Email không hợp lệ").optional(),
  isMainGuest: yup.boolean().optional(),
});

// get all bookings
const getAllSchema = yup
  .object({
    query: yup.object({
      page: yup.number().integer().positive().optional(),
      limit: yup.number().integer().positive().optional(),
      sort_type: yup.string().oneOf(["asc", "desc"]).optional(),
      sort_by: yup.string().oneOf(["createdAt", "checkIn", "checkOut", "totalPrice"]).optional(),
      customerId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "ID khách hàng không hợp lệ").optional(),
      roomId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "ID phòng không hợp lệ").optional(),
      paymentStatus: yup.string().oneOf(["pending", "paid", "failed", "refunded", "refund_requested", "cancelled"]).optional(),
      source: yup.string().oneOf(["online", "walk_in"]).optional(),
      startDate: yup.date().optional(),
      endDate: yup.date().optional(),
      guestName: yup.string().min(1).max(100).optional(),
    }),
  })
  .required();

// get by id
const getByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: "ID must be a valid ObjectId" })
        .required(),
    }),
  })
  .required();

// create booking
const createSchema = yup
  .object({
    body: yup.object({
      customerId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "ID khách hàng không hợp lệ").optional(),
      guests: yup
        .array()
        .of(guestSchema)
        .min(1, "Cần ít nhất 1 khách hàng")
        .max(10, "Tối đa 10 khách hàng")
        .required("Danh sách khách hàng là bắt buộc"),
      roomId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "ID phòng không hợp lệ")
        .required("ID phòng là bắt buộc"),
      checkIn: yup.date().required("Ngày nhận phòng là bắt buộc"),
      checkOut: yup.date().required("Ngày trả phòng là bắt buộc"),
      totalPrice: yup.number().min(0).required("Tổng tiền là bắt buộc"),
      source: yup.string().oneOf(["online", "walk_in"]).optional(),
      paymentStatus: yup.string().oneOf(["pending", "paid", "failed", "refunded", "refund_requested", "cancelled"]).optional(),
      notes: yup.string().max(500).optional(),
      services: yup.array().of(
        yup.object({
          serviceId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "ID dịch vụ không hợp lệ").required(),
          name: yup.string().required("Tên dịch vụ là bắt buộc"),
          price: yup.number().min(0).required("Giá dịch vụ là bắt buộc"),
          quantity: yup.number().min(1).required("Số lượng dịch vụ là bắt buộc"),
        })
      ).optional(),
    }),
  })
  .required();

// update booking
const updateByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: "ID must be a valid ObjectId" })
        .required(),
    }),
    body: yup.object({
      customerId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "ID khách hàng không hợp lệ").optional(),
      guests: yup
        .array()
        .of(guestSchema)
        .min(1, "Cần ít nhất 1 khách hàng")
        .max(10, "Tối đa 10 khách hàng")
        .optional(),
      roomId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "ID phòng không hợp lệ")
        .optional(),
      checkIn: yup.date().optional(),
      checkOut: yup.date().optional(),
      totalPrice: yup.number().min(0).optional(),
      paymentStatus: yup.string().oneOf(["pending", "paid", "failed", "refunded", "refund_requested", "cancelled"]).optional(),
      notes: yup.string().max(500).optional(),
      services: yup.array().of(
        yup.object({
          serviceId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "ID dịch vụ không hợp lệ").required(),
          name: yup.string().required("Tên dịch vụ là bắt buộc"),
          price: yup.number().min(0).required("Giá dịch vụ là bắt buộc"),
          quantity: yup.number().min(1).required("Số lượng dịch vụ là bắt buộc"),
        })
      ).optional(),
    }),
  })
  .required();

// delete booking
const deleteByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: "ID must be a valid ObjectId" })
        .required(),
    }),
  })
  .required();

export default {
  getAllSchema,
  getByIdSchema,
  createSchema,
  updateByIdSchema,
  deleteByIdSchema,
};
