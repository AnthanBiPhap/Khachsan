import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export interface Location {
  _id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  ratingAvg: number;
  reviewCount: number;
  distance?: number;
}

// Định nghĩa các loại địa điểm
export const locationTypes = [
  { value: 'tham_quan', label: 'Tham quan' },
  { value: 'an_uong', label: 'Ăn uống' },
  { value: 'the_thao', label: 'Thể thao' },
  { value: 'phim_anh', label: 'Phim ảnh' },
  { value: 'sach', label: 'Sách' },
  { value: 'game', label: 'Game' },
  { value: 'du_lich', label: 'Du lịch' },
  { value: 'thu_gian', label: 'Thư giãn' },
  { value: 'bao_tang', label: 'Bảo tàng' },
  { value: 'vuon_quoc_gia', label: 'Vườn quốc gia' },
] as const;

export type LocationType = typeof locationTypes[number]['value'];

export const locationService = {
  // Lấy danh sách địa điểm theo loại hoặc nhiều loại
  getLocationsByType: async (type: string | string[], limit: number = 6): Promise<{ locations: Location[] }> => {
    try {
      // Nếu type là mảng, sử dụng tham số 'types' để lọc theo nhiều loại
      const params = Array.isArray(type) 
        ? { types: type.join(','), limit }
        : { type, limit };
        
      const response = await axios.get(`${API_URL}/locations`, { 
        params,
        validateStatus: (status) => status < 500 // Chỉ throw lỗi cho status >= 500
      });
      
      // Đảm bảo response có đúng định dạng
      if (response.data && response.data.data && Array.isArray(response.data.data.locations)) {
        return response.data.data;
      }
      
      // Nếu dữ liệu không đúng định dạng, trả về mảng rỗng
      console.warn('Unexpected API response format:', response.data);
      return { locations: [] };
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Trả về mảng rỗng nếu có lỗi
      return { locations: [] };
    }
  },

  // Lấy tất cả địa điểm
  getAllLocations: async (): Promise<{ locations: Location[] }> => {
    try {
      const response = await axios.get(`${API_URL}/locations`, {
        validateStatus: (status) => status < 500
      });
      
      // Đảm bảo response có đúng định dạng
      if (response.data && response.data.data && Array.isArray(response.data.data.locations)) {
        return response.data.data;
      }
      
      console.warn('Unexpected API response format:', response.data);
      return { locations: [] };
    } catch (error) {
      console.error('Error fetching all locations:', error);
      return { locations: [] };
    }
  },

  // Lấy tất cả các loại địa điểm
  getLocationTypes: () => {
    return locationTypes;
  }
};
