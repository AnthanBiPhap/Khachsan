import createError from 'http-errors'
import Service from '../models/services.model'
import ServiceBooking from '../models/serviceBookings.model'

/**
 * Service:
 * - Nhận đầu vào từ controller
 * - Xử lý logic / validate
 * - Truy vấn DB qua Model
 * - Trả dữ liệu về controller
 */

/**
 * Lấy danh sách tất cả dịch vụ với các bộ lọc (name, status) và phân trang.
 * Mặc định chỉ hiển thị dịch vụ active, admin có thể xem tất cả bằng status='all'
 */
const getAll = async (query: any) => {
  // Thiết lập phân trang
  const { page = 1, limit = 10 } = query

  // Thiết lập sắp xếp
  const sortBy: string = query.sort_by || 'createdAt'
  const sortType: 1 | -1 = query.sort_type === 'asc' ? 1 : -1
  const sortObject: Record<string, 1 | -1> = { [sortBy]: sortType }

  // Xây dựng điều kiện lọc
  const where: Record<string, any> = { status: { $ne: 'deleted' } } // Loại bỏ dịch vụ đã bị xóa

  // Lọc theo tên dịch vụ (tìm kiếm không phân biệt hoa thường)
  if (query.name && query.name.trim().length > 0) {
    where.name = { $regex: query.name, $options: 'i' }
  }

  // Lọc theo trạng thái
  if (query.status) {
    if (query.status === 'all') {
      // Admin muốn xem tất cả dịch vụ (kể cả ẩn)
      delete where.status; // Xóa filter status để lấy tất cả
    } else {
      where.status = query.status
    }
  } else {
    // Mặc định chỉ hiển thị dịch vụ active cho frontend
    where.status = 'active'
  }

  // Tìm dịch vụ với phân trang
  const services = await Service.find(where)
    .sort(sortObject)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))

  // Đếm tổng số dịch vụ để phân trang
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

/**
 * Lấy thông tin chi tiết của một dịch vụ theo ID.
 * Tự động loại bỏ dịch vụ đã bị xóa
 */
const getById = async (id: string) => {
  const service = await Service.findOne({
    _id: id,
    status: { $ne: 'deleted' }, // Loại bỏ dịch vụ đã bị xóa
  })
  // Nếu không tìm thấy dịch vụ thì báo lỗi
  if (!service) throw createError(404, 'Không tìm thấy dịch vụ')
  return service
}

/**
 * Tạo dịch vụ mới: kiểm tra trùng lặp tên,
 * tạo dịch vụ với các thông tin từ payload
 */
const create = async (payload: any) => {
  // Kiểm tra trùng lặp tên dịch vụ
  const nameExist = await Service.findOne({
    name: payload.name,
    status: { $ne: 'deleted' }, // Chỉ kiểm tra dịch vụ chưa bị xóa
  })
  // Nếu đã tồn tại thì báo lỗi
  if (nameExist) throw createError(400, 'Tên dịch vụ đã tồn tại')

  const newService = new Service({
    name: payload.name,
    description: payload.description,
    basePrice: payload.basePrice,
    workingHours: payload.workingHours,
    slots: payload.slots || [],
    images: payload.images || [],
    status: payload.status || 'active',
  })

  await newService.save()
  return newService
}

const updateById = async (id: string, payload: any) => {
  const service = await getById(id)

  // check duplicate name khi đổi tên (cho phép đổi tên)
  if (payload.name && payload.name !== service.name) {
    const exist = await Service.findOne({
      name: payload.name,
      _id: { $ne: id },
      status: { $ne: 'deleted' },
    })
    if (exist) throw createError(400, 'Service name already exists')
  }

  // Chỉ kiểm tra booking khi thay đổi các trường quan trọng (không phải name và description)
  // Loại bỏ name và description khỏi payload để kiểm tra
  const { name, description, ...otherFields } = payload
  const importantFields = ['basePrice', 'workingHours', 'slots', 'images', 'status']
  // Kiểm tra xem có thay đổi các trường quan trọng không
  const hasImportantChanges = importantFields.some(field => {
    if (field === 'workingHours') {
      // Kiểm tra nếu workingHours có thay đổi (so sánh startTime và endTime)
      if (otherFields.workingHours) {
        const current = service.workingHours
        const newHours = otherFields.workingHours
        return !current || 
               current.startTime !== newHours.startTime || 
               current.endTime !== newHours.endTime
      }
      return false
    }
    // Kiểm tra các trường khác có thay đổi không
    return otherFields[field] !== undefined && otherFields[field] !== (service as any)[field]
  })

  // Nếu có thay đổi các trường quan trọng thì kiểm tra service booking
  if (hasImportantChanges) {
    // Kiểm tra xem có service booking nào đang sử dụng service này không
    const now = new Date()
    
    // Tìm các service booking đã được đặt (reserved) hoặc đã hoàn thành (completed) 
    // và có scheduledAt trong tương lai hoặc gần đây (trong vòng 24 giờ qua)
    const activeServiceBookings = await ServiceBooking.find({
      serviceId: id,
      status: { $in: ['reserved', 'completed'] }, // Chỉ lấy booking đã đặt hoặc đã hoàn thành
      scheduledAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, // Trong 24 giờ qua hoặc tương lai
    })

    // Nếu có service booking đang sử dụng thì không cho phép chỉnh sửa
    if (activeServiceBookings.length > 0) {
      throw createError(
        400,
        `Không thể chỉnh sửa dịch vụ này vì có ${activeServiceBookings.length} booking đang sử dụng hoặc đã được đặt`
      )
    }
  }

  // Lọc bỏ các giá trị rỗng, null hoặc undefined để chỉ cập nhật các trường hợp lệ
  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(
      ([, v]) => v !== '' && v !== null && v !== undefined,
    ),
  )

  // Cập nhật dịch vụ với các giá trị đã lọc
  Object.assign(service, cleanUpdates)
  await service.save()
  return service
}

/**
 * Xóa dịch vụ theo ID: thực hiện soft delete bằng cách đặt status = 'deleted'
 */
const deleteById = async (id: string) => {
  const service = await getById(id)
  // Soft delete: chỉ đánh dấu status = 'deleted' thay vì xóa thật
  service.status = 'deleted'
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
