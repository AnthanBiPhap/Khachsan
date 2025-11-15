import * as yup from "yup";

// get all service bookings
const getAllSchema = yup
  .object({
    query: yup.object({
      page: yup.number().integer().positive().optional(),
      limit: yup.number().integer().positive().optional(),
      sort_type: yup.string().oneOf(["asc", "desc"]).optional(),
      sort_by: yup.string().oneOf(["createdAt", "scheduledAt", "price"]).optional(),
      status: yup.string().oneOf(["reserved", "completed", "cancelled"]).optional(),
      serviceId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "ID dịch vụ không hợp lệ").optional(),
      bookingId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "ID booking không hợp lệ").optional(),
      customerId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "ID khách hàng không hợp lệ").optional(),
    }),
  })
  .required();

// get by id
const getByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: "ID không hợp lệ" })
        .required("ID là bắt buộc"),
    }),
  })
  .required();

// create service booking
const createSchema = yup
  .object({
    body: yup.object({
      bookingId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "ID booking không hợp lệ")
        .optional(),
      serviceId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "ID dịch vụ không hợp lệ")
        .required("ID dịch vụ là bắt buộc"),
      customerId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "ID khách hàng không hợp lệ")
        .optional(),
      guestName: yup
        .string()
        .min(2, "Họ tên phải có ít nhất 2 ký tự")
        .max(100, "Họ tên không được vượt quá 100 ký tự")
        .when('bookingId', {
          is: (value: any) => !value || value === null || value === '',
          then: (schema) => schema.required("Họ tên là bắt buộc khi không có booking"),
          otherwise: (schema) => schema.optional(),
        }),
      phoneNumber: yup
        .string()
        .trim()
        .matches(/^(0[1-9][0-9]{8,9}|\+84[1-9][0-9]{8,9})$/, "Số điện thoại không hợp lệ. Vui lòng nhập đúng số Việt Nam (10 số bắt đầu bằng 0 hoặc +84).")
        .test('not-all-same', 'Số điện thoại không hợp lệ. Không được nhập tất cả số giống nhau.', (value) => {
          if (!value) return true;
          // Loại bỏ +84 để kiểm tra
          const digits = value.replace(/^\+84/, '0');
          // Kiểm tra không phải tất cả số giống nhau
          const firstDigit = digits[0];
          return !digits.split('').every(digit => digit === firstDigit);
        })
        .when('bookingId', {
          is: (value: any) => !value || value === null || value === '',
          then: (schema) => schema.required("Số điện thoại là bắt buộc khi không có booking"),
          otherwise: (schema) => schema.optional(),
        }),
      scheduledAt: yup
        .date()
        .required("Thời gian đặt dịch vụ là bắt buộc"),
      quantity: yup
        .number()
        .integer()
        .min(1, "Số lượng phải lớn hơn 0")
        .required("Số lượng là bắt buộc"),
      price: yup
        .number()
        .min(0, "Giá phải lớn hơn hoặc bằng 0")
        .required("Giá là bắt buộc"),
      status: yup
        .string()
        .oneOf(["reserved", "completed", "cancelled"], "Trạng thái không hợp lệ")
        .optional(),
    }),
  })
  .required();

// update service booking
const updateByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: "ID không hợp lệ" })
        .required("ID là bắt buộc"),
    }),
    body: yup.object({
      bookingId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "ID booking không hợp lệ")
        .optional(),
      serviceId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "ID dịch vụ không hợp lệ")
        .optional(),
      customerId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "ID khách hàng không hợp lệ")
        .optional(),
      guestName: yup
        .string()
        .min(2, "Họ tên phải có ít nhất 2 ký tự")
        .max(100, "Họ tên không được vượt quá 100 ký tự")
        .optional(),
      phoneNumber: yup
        .string()
        .trim()
        .matches(/^(0[1-9][0-9]{8,9}|\+84[1-9][0-9]{8,9})$/, "Số điện thoại không hợp lệ. Vui lòng nhập đúng số Việt Nam (10 số bắt đầu bằng 0 hoặc +84).")
        .test('not-all-same', 'Số điện thoại không hợp lệ. Không được nhập tất cả số giống nhau.', (value) => {
          if (!value) return true;
          // Loại bỏ +84 để kiểm tra
          const digits = value.replace(/^\+84/, '0');
          // Kiểm tra không phải tất cả số giống nhau
          const firstDigit = digits[0];
          return !digits.split('').every(digit => digit === firstDigit);
        })
        .optional(),
      scheduledAt: yup
        .date()
        .optional(),
      quantity: yup
        .number()
        .integer()
        .min(1, "Số lượng phải lớn hơn 0")
        .optional(),
      price: yup
        .number()
        .min(0, "Giá phải lớn hơn hoặc bằng 0")
        .optional(),
      status: yup
        .string()
        .oneOf(["reserved", "completed", "cancelled"], "Trạng thái không hợp lệ")
        .optional(),
    }),
  })
  .required();

// delete service booking
const deleteByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: "ID không hợp lệ" })
        .required("ID là bắt buộc"),
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

