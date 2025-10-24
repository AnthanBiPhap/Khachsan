import { Card, Input, Select, Space, Typography, Row, Col } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { fetchRoomTypes } from "../../services/roomTypes.service";

interface RoomSearchFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onTypeChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function RoomSearchFilter({
  searchText,
  onSearchChange,
  filterType,
  onTypeChange,
  filterStatus,
  onStatusChange,
  onClearFilters,
  totalCount,
  filteredCount,
}: RoomSearchFilterProps) {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  // Fetch room types
  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        setLoadingRoomTypes(true);
        const res = await fetchRoomTypes(1, 100); // Lấy tất cả room types
        setRoomTypes(res.data || []);
      } catch (error) {
        console.error("Error loading room types:", error);
      } finally {
        setLoadingRoomTypes(false);
      }
    };

    loadRoomTypes();
  }, []);
  return (
    <div style={{ width: '100%', minWidth: '800px' }}>
      <Card
        style={{
          marginBottom: 16,
          minHeight: '120px',
        }}
        bodyStyle={{
          padding: '16px',
          minHeight: '88px',
        }}
      >
        <Row gutter={[16, 16]} style={{ minHeight: '56px' }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ minHeight: '40px' }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                Tìm kiếm phòng
              </Typography.Text>
              <Input
                placeholder="Tìm theo số phòng, loại phòng..."
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ height: '32px' }}
              />
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ minHeight: '40px' }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                Lọc theo loại phòng
              </Typography.Text>
              <Select
                value={filterType}
                onChange={onTypeChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn loại phòng"
                loading={loadingRoomTypes}
              >
                <Select.Option value="all">Tất cả loại phòng</Select.Option>
                {roomTypes.map((roomType) => (
                  <Select.Option key={roomType._id} value={roomType._id}>
                    {roomType.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ minHeight: '40px' }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                Lọc theo trạng thái
              </Typography.Text>
              <Select
                value={filterStatus}
                onChange={onStatusChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn trạng thái"
              >
                <Select.Option value="all">Tất cả trạng thái</Select.Option>
                <Select.Option value="available">Có sẵn</Select.Option>
                <Select.Option value="occupied">Đã thuê</Select.Option>
                <Select.Option value="maintenance">Bảo trì</Select.Option>
                <Select.Option value="cleaning">Đang dọn dẹp</Select.Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ minHeight: '40px' }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                Thao tác
              </Typography.Text>
              <Space>
                <button
                  onClick={onClearFilters}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    height: '32px'
                  }}
                >
                  Xóa bộ lọc
                </button>
              </Space>
            </div>
          </Col>
        </Row>
        
        <div
          style={{
            marginTop: 12,
            padding: '8px 12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            minHeight: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: '200px', whiteSpace: 'nowrap' }}>
            <FilterOutlined style={{ color: '#1890ff' }} />
            <Typography.Text style={{ fontSize: '12px', color: '#666' }}>
              Hiển thị {filteredCount} / {totalCount} phòng
            </Typography.Text>
          </div>
          
          {(searchText || filterType !== 'all' || filterStatus !== 'all') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: '150px', whiteSpace: 'nowrap' }}>
              <Typography.Text style={{ fontSize: '12px', color: '#1890ff' }}>
                Đang lọc dữ liệu
              </Typography.Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
