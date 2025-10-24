import { Card, Input, Select, Space, Typography, Row, Col } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

interface InvoiceSearchFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterSource: string;
  onSourceChange: (value: string) => void;
  filterAmount: string;
  onAmountChange: (value: string) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function InvoiceSearchFilter({
  searchText,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterSource,
  onSourceChange,
  filterAmount,
  onAmountChange,
  onClearFilters,
  totalCount,
  filteredCount,
}: InvoiceSearchFilterProps) {
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
                Tìm kiếm hóa đơn
              </Typography.Text>
              <Input
                placeholder="Tìm theo tên khách, mã booking..."
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
                Lọc theo trạng thái
              </Typography.Text>
              <Select
                value={filterStatus}
                onChange={onStatusChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn trạng thái"
              >
                <Select.Option value="all">Tất cả trạng thái</Select.Option>
                <Select.Option value="pending">Chờ thanh toán</Select.Option>
                <Select.Option value="paid">Đã thanh toán</Select.Option>
                <Select.Option value="failed">Thanh toán thất bại</Select.Option>
                <Select.Option value="refunded">Đã hoàn tiền</Select.Option>
              </Select>
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
                <Select.Option value="online">Online</Select.Option>
                <Select.Option value="walk_in">Walk-in</Select.Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ minHeight: '40px' }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                Lọc theo số tiền
              </Typography.Text>
              <Select
                value={filterAmount}
                onChange={onAmountChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn khoảng tiền"
              >
                <Select.Option value="all">Tất cả số tiền</Select.Option>
                <Select.Option value="under1m">Dưới 1.000.000 VND</Select.Option>
                <Select.Option value="1m-5m">1.000.000 - 5.000.000 VND</Select.Option>
                <Select.Option value="5m-10m">5.000.000 - 10.000.000 VND</Select.Option>
                <Select.Option value="over10m">Trên 10.000.000 VND</Select.Option>
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
              Hiển thị {filteredCount} / {totalCount} hóa đơn
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
            
            {(searchText || filterStatus !== 'all' || filterSource !== 'all' || filterAmount !== 'all') && (
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
