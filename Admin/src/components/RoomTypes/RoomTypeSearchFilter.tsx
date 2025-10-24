import { Card, Input, Select, Space, Typography, Row, Col } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

interface RoomTypeSearchFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filterPrice: string;
  onPriceChange: (value: string) => void;
  filterCapacity: string;
  onCapacityChange: (value: string) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function RoomTypeSearchFilter({
  searchText,
  onSearchChange,
  filterPrice,
  onPriceChange,
  filterCapacity,
  onCapacityChange,
  onClearFilters,
  totalCount,
  filteredCount,
}: RoomTypeSearchFilterProps) {
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
                Tìm kiếm loại phòng
              </Typography.Text>
              <Input
                placeholder="Tìm theo tên, mô tả..."
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
                Lọc theo giá
              </Typography.Text>
              <Select
                value={filterPrice}
                onChange={onPriceChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn khoảng giá"
              >
                <Select.Option value="all">Tất cả giá</Select.Option>
                <Select.Option value="under500k">Dưới 500.000 VND</Select.Option>
                <Select.Option value="500k-1m">500.000 - 1.000.000 VND</Select.Option>
                <Select.Option value="1m-2m">1.000.000 - 2.000.000 VND</Select.Option>
                <Select.Option value="over2m">Trên 2.000.000 VND</Select.Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ minHeight: '40px' }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                Lọc theo sức chứa
              </Typography.Text>
              <Select
                value={filterCapacity}
                onChange={onCapacityChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn sức chứa"
              >
                <Select.Option value="all">Tất cả sức chứa</Select.Option>
                <Select.Option value="1">1 người</Select.Option>
                <Select.Option value="2">2 người</Select.Option>
                <Select.Option value="3">3 người</Select.Option>
                <Select.Option value="4">4 người</Select.Option>
                <Select.Option value="over4">Trên 4 người</Select.Option>
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
              Hiển thị {filteredCount} / {totalCount} loại phòng
            </Typography.Text>
          </div>
          
          {(searchText || filterPrice !== 'all' || filterCapacity !== 'all') && (
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
