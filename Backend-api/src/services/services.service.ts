import createError from 'http-errors'
import Service from '../models/services.model'

/**
 * Service:
 * - Nhận đầu vào từ controller
 * - Xử lý logic / validate
 * - Truy vấn DB qua Model
 * - Trả dữ liệu về controller
 */

const getAll = async (query: any) => {
  const { page = 1, limit = 10 } = query

  // ===== Sort =====
  const sortBy: string = query.sort_by || 'createdAt'
  const sortType: 1 | -1 = query.sort_type === 'asc' ? 1 : -1
  const sortObject: Record<string, 1 | -1> = { [sortBy]: sortType }

  // ===== Filter =====
  const where: Record<string, any> = { status: { $ne: 'deleted' } }

  if (query.name && query.name.trim().length > 0) {
    where.name = { $regex: query.name, $options: 'i' }
  }

  if (query.status) {
    where.status = query.status
  }

  const services = await Service.find(where)
    .sort(sortObject)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))

  const count = await Service.countDocuments(where)

  return {
    data: services,
    pagination: {
      totalRecord: count,
      limit: Number(limit),
      page: Number(page),
    },
  }
}

const getById = async (id: string) => {
  const service = await Service.findOne({
    _id: id,
    status: { $ne: 'deleted' },
  })
  if (!service) throw createError(404, 'Service not found')
  return service
}

const create = async (payload: any) => {
  // check trùng tên
  const nameExist = await Service.findOne({
    name: payload.name,
    status: { $ne: 'deleted' },
  })
  if (nameExist) throw createError(400, 'Service name already exists')

  const newService = new Service({
    name: payload.name,
    description: payload.description,
    basePrice: payload.basePrice,
    slots: payload.slots || [],
    images: payload.images || [],
    status: payload.status || 'active',
  })

  await newService.save()
  return newService
}

const updateById = async (id: string, payload: any) => {
  const service = await getById(id)

  // check duplicate name khi đổi tên
  if (payload.name && payload.name !== service.name) {
    const exist = await Service.findOne({
      name: payload.name,
      _id: { $ne: id },
      status: { $ne: 'deleted' },
    })
    if (exist) throw createError(400, 'Service name already exists')
  }

  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([, v]) => v !== '' && v !== null && v !== undefined,
    ),
  )

  Object.assign(service, cleanUpdates)
  await service.save()
  return service
}

const deleteById = async (id: string) => {
  const service = await getById(id)
  service.status = 'deleted' // soft delete
  await service.save()
  return service
}

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
}
