import { Card, Input, Select, Space, Typography, Row, Col } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

interface GuestSearchFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filterSource: string;
  onSourceChange: (value: string) => void;
  filterAge: string;
  onAgeChange: (value: string) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function GuestSearchFilter({
  searchText,
  onSearchChange,
  filterSource,
  onSourceChange,
  filterAge,
  onAgeChange,
  onClearFilters,
  totalCount,
  filteredCount,
}: GuestSearchFilterProps) {
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
                Tìm kiếm khách hàng
              </Typography.Text>
              <Input
                placeholder="Tìm theo tên, SĐT, CMND..."
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
                Lọc theo nguồn
              </Typography.Text>
              <Select
                value={filterSource}
                onChange={onSourceChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn nguồn"
              >
                <Select.Option value="all">Tất cả nguồn</Select.Option>
                <Select.Option value="online">Trực tuyến</Select.Option>
                <Select.Option value="walk_in">Trực tiếp</Select.Option>
                <Select.Option value="group">Đoàn</Select.Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ minHeight: '40px' }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                Lọc theo độ tuổi
              </Typography.Text>
              <Select
                value={filterAge}
                onChange={onAgeChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn độ tuổi"
              >
                <Select.Option value="all">Tất cả độ tuổi</Select.Option>
                <Select.Option value="under18">Dưới 18 tuổi</Select.Option>
                <Select.Option value="18-30">18-30 tuổi</Select.Option>
                <Select.Option value="31-50">31-50 tuổi</Select.Option>
                <Select.Option value="over50">Trên 50 tuổi</Select.Option>
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
              Hiển thị {filteredCount} / {totalCount} khách hàng
            </Typography.Text>
          </div>
          
          {(searchText || filterSource !== 'all' || filterAge !== 'all') && (
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
