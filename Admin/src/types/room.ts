export interface RoomType {
    _id: string;
    name: string;
    pricePerNight: number;
    capacity: number;
    description?: string;
    amenities?: string[];
    images?: string[];
    createdAt?: string;
    updatedAt?: string;
     // thêm 2 field mới
  extraHourPrice: number;    // Giá phụ thu mỗi giờ
  maxExtendHours: number;    // Số giờ tối đa được gia hạn
  }
  
  export interface Room {
    _id: string;
    roomNumber: string;
    typeId?: RoomType;
    status: string;
    amenities?: string[];
    images?: string[];
    createdAt?: string;
    updatedAt?: string;
  }

  export interface RoomTypesFormProps {
    open: boolean;
    roomType?: RoomType | null;
    onCancel: () => void;
    onSave: (values: Partial<RoomType>) => Promise<void>;
    loading?: boolean;
  }
  export interface RoomsFormProps {
    open: boolean;
    room?: Room | null;
    onCancel: () => void;
    onSave: (values: Partial<Room>) => Promise<void>;
    loading?: boolean;
  }
  