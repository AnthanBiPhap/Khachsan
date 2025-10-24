import { Card, Input, Select, Space, Typography, Row, Col } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

interface ServiceSearchFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filterPrice: string;
  onPriceChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function ServiceSearchFilter({
  searchText,
  onSearchChange,
  filterPrice,
  onPriceChange,
  filterStatus,
  onStatusChange,
  onClearFilters,
  totalCount,
  filteredCount,
}: ServiceSearchFilterProps) {
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
                Tìm kiếm dịch vụ
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
                <Select.Option value="under100k">Dưới 100.000 VND</Select.Option>
                <Select.Option value="100k-500k">100.000 - 500.000 VND</Select.Option>
                <Select.Option value="500k-1m">500.000 - 1.000.000 VND</Select.Option>
                <Select.Option value="over1m">Trên 1.000.000 VND</Select.Option>
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
                <Select.Option value="active">Đang hoạt động</Select.Option>
                <Select.Option value="hidden">Ẩn</Select.Option>
                <Select.Option value="deleted">Đã xóa</Select.Option>
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
              Hiển thị {filteredCount} / {totalCount} dịch vụ
            </Typography.Text>
          </div>
          
          {(searchText || filterPrice !== 'all' || filterStatus !== 'all') && (
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
