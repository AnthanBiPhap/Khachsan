export type LocationType =
  | "tham_quan"
  | "an_uong"
  | "the_thao"
  | "phim_anh"
  | "sach"
  | "game"
  | "du_lich"
  | "thu_gian"
  | "bao_tang"
  | "vuon_quoc_gia"
  | string;

export type LocationStatus = "active" | "hidden" | "deleted" | string;

export interface LocationItem {
  _id: string;
  name: string;
  type: LocationType;
  description?: string;
  address?: string;
  images?: string[];
  ratingAvg?: number;
  status: LocationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationsFormProps {
  open: boolean;
  item?: LocationItem | null;
  onCancel: () => void;
  onSave: (values: Partial<LocationItem>) => Promise<void>;
  loading?: boolean;
}
