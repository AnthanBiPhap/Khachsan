import createError from "http-errors";
import Review from "../models/reviews.model";

const getAll = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const sortField = query.sort_by || "createdAt";
  const sortType = query.sort_type === "asc" ? 1 : -1;
  const sortObject: Record<string, 1 | -1> = { [sortField]: sortType };

  const where: Record<string, any> = { status: { $ne: "deleted" } };

  if (query.reviewerId) where.reviewerId = query.reviewerId;
  if (query.targetType) where.targetType = query.targetType;
  if (query.targetId) where.targetId = query.targetId;
  if (query.status) where.status = query.status;
  if (query.minRating) where.rating = { $gte: Number(query.minRating) };

  const reviews = await Review.find(where)
    .populate("reviewerId", "fullName email")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sortObject);

  const count = await Review.countDocuments(where);

  return {
    reviews,
    pagination: {
      totalRecord: count,
      limit,
      page,
    },
  };
};

const getById = async (id: string) => {
  const review = await Review.findById(id).populate("reviewerId", "fullName email");
  if (!review || review.status === "deleted") throw createError(404, "Review not found");
  return review;
};

const create = async (payload: any) => {
  const existing = await Review.findOne({
    reviewerId: payload.reviewerId,
    targetType: payload.targetType,
    targetId: payload.targetId,
    status: { $ne: "deleted" },
  });
  if (existing) throw createError(400, "You have already reviewed this item");

  const review = new Review({
    reviewerId: payload.reviewerId,
    targetType: payload.targetType,
    targetId: payload.targetId,
    rating: payload.rating,
    comment: payload.comment,
    status: payload.status || "active",
  });

  await review.save();
  return review.populate("reviewerId", "fullName email");
};

const updateById = async (id: string, payload: any) => {
  const review = await getById(id);

  // Không cho đổi reviewer, targetType, targetId
  if (payload.reviewerId || payload.targetType || payload.targetId) {
    throw createError(400, "Cannot change reviewer or target information");
  }

  const cleanUpdates = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
  );

  Object.assign(review, cleanUpdates);
  await review.save();
  return review.populate("reviewerId", "fullName email");
};

const deleteById = async (id: string) => {
  const review = await getById(id);
  review.status = "deleted"; // soft delete
  await review.save();
  return review;
};

// Tính điểm trung bình cho 1 target
const getAverageRating = async (targetType: string, targetId: string) => {
  const result = await Review.aggregate([
    { $match: { targetType, targetId, status: "active" } },
    { $group: { _id: null, averageRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
  ]);

  return {
    averageRating: result[0]?.averageRating || 0,
    reviewCount: result[0]?.reviewCount || 0,
  };
};

export default {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
  getAverageRating,
};
