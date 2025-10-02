export type ReviewTargetType = "room" | "service" | "location" | string;
export type ReviewStatus = "active" | "hidden" | "deleted" | string;

export interface UserRef { _id: string; fullName?: string; email?: string }

export interface ReviewItem {
  _id: string;
  reviewerId?: UserRef | null;
  targetType: ReviewTargetType;
  targetId: string; // objectId string of target
  rating: number; // 1..5
  comment?: string;
  status: ReviewStatus;
  createdAt?: string;
  updatedAt?: string;
}
export interface SimpleRef { _id: string; name?: string; fullName?: string }

export interface ReviewsFormProps {
  open: boolean;
  item?: ReviewItem | null;
  onCancel: () => void;
  onSave: (values: Partial<ReviewItem>) => Promise<void>;
  loading?: boolean;
}