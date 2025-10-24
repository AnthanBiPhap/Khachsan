import { Card, Input, Select, Space, Typography, Row, Col } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

interface LocationSearchFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onTypeChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterRating: string;
  onRatingChange: (value: string) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function LocationSearchFilter({
  searchText,
  onSearchChange,
  filterType,
  onTypeChange,
  filterStatus,
  onStatusChange,
  filterRating,
  onRatingChange,
  onClearFilters,
  totalCount,
  filteredCount,
}: LocationSearchFilterProps) {
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
                Tìm kiếm địa điểm
              </Typography.Text>
              <Input
                placeholder="Tìm theo tên, địa chỉ..."
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
                Lọc theo loại
              </Typography.Text>
              <Select
                value={filterType}
                onChange={onTypeChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn loại địa điểm"
              >
                <Select.Option value="all">Tất cả loại</Select.Option>
                <Select.Option value="tham_quan">Tham quan</Select.Option>
                <Select.Option value="an_uong">Ăn uống</Select.Option>
                <Select.Option value="the_thao">Thể thao</Select.Option>
                <Select.Option value="phim_anh">Phim ảnh</Select.Option>
                <Select.Option value="sach">Sách</Select.Option>
                <Select.Option value="game">Game</Select.Option>
                <Select.Option value="du_lich">Du lịch</Select.Option>
                <Select.Option value="thu_gian">Thư giãn</Select.Option>
                <Select.Option value="bao_tang">Bảo tàng</Select.Option>
                <Select.Option value="vuon_quoc_gia">Vườn quốc gia</Select.Option>
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
                Lọc theo đánh giá
              </Typography.Text>
              <Select
                value={filterRating}
                onChange={onRatingChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn mức đánh giá"
              >
                <Select.Option value="all">Tất cả đánh giá</Select.Option>
                <Select.Option value="5">5 sao</Select.Option>
                <Select.Option value="4">4 sao trở lên</Select.Option>
                <Select.Option value="3">3 sao trở lên</Select.Option>
                <Select.Option value="2">2 sao trở lên</Select.Option>
                <Select.Option value="1">1 sao trở lên</Select.Option>
              </Select>
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
              Hiển thị {filteredCount} / {totalCount} địa điểm
            </Typography.Text>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            
            {(searchText || filterType !== 'all' || filterStatus !== 'all' || filterRating !== 'all') && (
              <Typography.Text style={{ fontSize: '12px', color: '#1890ff' }}>
                Đang lọc dữ liệu
              </Typography.Text>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
