import * as yup from "yup";

// get all
const getAllSchema = yup
  .object({
    query: yup.object({
      page: yup.number().integer().positive().optional(),
      limit: yup.number().integer().positive().optional(),
      sort_type: yup.string().oneOf(["asc", "desc"]).optional(),
      sort_by: yup.string().oneOf(["createdAt", "fullName", "email"]).optional(),
      keyword: yup.string().min(1).max(50).optional(),
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

// create user
const createSchema = yup
  .object({
    body: yup.object({
      fullName: yup
        .string()
        .min(2, 'Họ tên phải có ít nhất 2 ký tự')
        .max(100, 'Họ tên không được vượt quá 100 ký tự')
        .required('Họ tên là bắt buộc'),
      email: yup
        .string()
        .max(100, 'Email không được vượt quá 100 ký tự')
        .email('Email không hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: example@email.com)')
        .required('Email là bắt buộc'),
      phoneNumber: yup
        .string()
        .trim()
        .matches(/^(0[1-9][0-9]{8,9}|\+84[1-9][0-9]{8,9})$/, 'Số điện thoại không hợp lệ. Vui lòng nhập đúng số Việt Nam (10 số bắt đầu bằng 0 hoặc +84).')
        .test('not-all-same', 'Số điện thoại không hợp lệ. Không được nhập tất cả số giống nhau.', (value) => {
          if (!value) return true;
          // Loại bỏ +84 để kiểm tra
          const digits = value.replace(/^\+84/, '0');
          // Kiểm tra không phải tất cả số giống nhau
          const firstDigit = digits[0];
          return !digits.split('').every(digit => digit === firstDigit);
        })
        .required('Số điện thoại là bắt buộc'),
      password: yup
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(255, 'Mật khẩu không được vượt quá 255 ký tự')
        .required('Mật khẩu là bắt buộc'),
      dateOfBirth: yup
        .date()
        .nullable()
        .transform((value, originalValue) => {
          // Chuyển empty string thành null
          if (originalValue === '' || originalValue === null || originalValue === undefined) {
            return null;
          }
          return value;
        })
        .optional(),
      role: yup.string().oneOf(["customer", "admin", "staff"], 'Vai trò không hợp lệ').optional(),
      isActive: yup.boolean().optional(),
    }),
  })
  .required();

// update user
const updateByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: "ID không hợp lệ" })
        .required('ID là bắt buộc'),
    }),
    body: yup.object({
      fullName: yup
        .string()
        .min(2, 'Họ tên phải có ít nhất 2 ký tự')
        .max(100, 'Họ tên không được vượt quá 100 ký tự')
        .optional(),
      email: yup
        .string()
        .max(100, 'Email không được vượt quá 100 ký tự')
        .email('Email không hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: example@email.com)')
        .optional(),
      phoneNumber: yup
        .string()
        .trim()
        .matches(/^(0[1-9][0-9]{8,9}|\+84[1-9][0-9]{8,9})$/, 'Số điện thoại không hợp lệ. Vui lòng nhập đúng số Việt Nam (10 số bắt đầu bằng 0 hoặc +84).')
        .test('not-all-same', 'Số điện thoại không hợp lệ. Không được nhập tất cả số giống nhau.', (value) => {
          if (!value) return true;
          // Loại bỏ +84 để kiểm tra
          const digits = value.replace(/^\+84/, '0');
          // Kiểm tra không phải tất cả số giống nhau
          const firstDigit = digits[0];
          return !digits.split('').every(digit => digit === firstDigit);
        })
        .optional(),
      password: yup
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(255, 'Mật khẩu không được vượt quá 255 ký tự')
        .optional(),
      dateOfBirth: yup
        .date()
        .nullable()
        .transform((value, originalValue) => {
          // Chuyển empty string thành null
          if (originalValue === '' || originalValue === null || originalValue === undefined) {
            return null;
          }
          return value;
        })
        .optional(),
      role: yup.string().oneOf(["customer", "admin", "staff"], 'Vai trò không hợp lệ').optional(),
      isActive: yup.boolean().optional(),
    }),
  })
  .required();

// delete user
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
