import * as yup from "yup";

// get all services
const getAllSchema = yup
  .object({
    query: yup.object({
      page: yup.number().integer().positive().optional(),
      limit: yup.number().integer().positive().optional(),
      sort_type: yup.string().oneOf(["asc", "desc"]).optional(),
      sort_by: yup.string().oneOf(["createdAt", "name", "basePrice"]).optional(),
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

// create service
const createSchema = yup
  .object({
    body: yup.object({
      name: yup.string().min(2).max(100).required(),
      description: yup.string().min(10).max(500).required(),
      basePrice: yup.number().min(0).required(),
      workingHours: yup.object({
        startTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ không hợp lệ (HH:MM)').required(),
        endTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ không hợp lệ (HH:MM)').required()
      }).required(),
      slots: yup.array().of(yup.string()).optional(),
      images: yup.array().of(yup.string()).optional(),
      status: yup.string().oneOf(["active", "hidden", "deleted"]).optional(),
    }),
  })
  .required();

// update service
const updateByIdSchema = yup
  .object({
    params: yup.object({
      id: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: "ID must be a valid ObjectId" })
        .required(),
    }),
    body: yup.object({
      name: yup.string().min(2).max(100).optional(),
      description: yup.string().min(10).max(500).optional(),
      basePrice: yup.number().min(0).optional(),
      workingHours: yup.object({
        startTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ không hợp lệ (HH:MM)').optional(),
        endTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ không hợp lệ (HH:MM)').optional()
      }).optional(),
      slots: yup.array().of(yup.string()).optional(),
      images: yup.array().of(yup.string()).optional(),
      status: yup.string().oneOf(["active", "hidden", "deleted"]).optional(),
    }),
  })
  .required();

// delete service
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
