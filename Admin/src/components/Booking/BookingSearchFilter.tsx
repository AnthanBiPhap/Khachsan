import { Input, Select, Row, Col, Card, Space, Button, Typography } from "antd";
import { SearchOutlined, FilterOutlined, SortAscendingOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface BookingSearchFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterSource: string;
  onSourceChange: (value: string) => void;
  sortField: string;
  onSortFieldChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function BookingSearchFilter({
  searchText,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterSource,
  onSourceChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  totalCount,
  filteredCount,
}: BookingSearchFilterProps) {
  return (
    <Card 
      style={{ 
        marginBottom: 16,
        minHeight: '120px', // Đảm bảo chiều cao tối thiểu
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Row gutter={[16, 16]} style={{ flex: 1 }}>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Tìm kiếm theo mã booking, phòng, tên khách, SĐT..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            style={{ 
              height: '40px',
              minWidth: '200px' // Đảm bảo chiều rộng tối thiểu
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Lọc theo trạng thái"
            value={filterStatus}
            onChange={onStatusChange}
            style={{ 
              width: '100%', 
              height: '40px',
              minWidth: '200px' // Đảm bảo chiều rộng tối thiểu
            }}
            styles={{ popup: { root: { minWidth: '200px' } } }} // Cố định chiều rộng dropdown
          >
            <Select.Option value="all">Tất cả trạng thái</Select.Option>
            <Select.Option value="pending">Chờ thanh toán</Select.Option>
            <Select.Option value="partial_paid">Đã thanh toán một phần</Select.Option>
            <Select.Option value="paid">Đã thanh toán</Select.Option>
            <Select.Option value="failed">Thanh toán thất bại</Select.Option>
            <Select.Option value="refund_requested">Đang xử lý hoàn tiền</Select.Option>
            <Select.Option value="refunded">Đã hoàn tiền</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Lọc theo nguồn"
            value={filterSource}
            onChange={onSourceChange}
            style={{ 
              width: '100%',
              height: '40px'
            }}
            styles={{ popup: { root: { width: '200px' } } }}
          >
            <Select.Option value="all">Tất cả nguồn</Select.Option>
            <Select.Option value="online">Online</Select.Option>
            <Select.Option value="walk_in">Walk-in</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space.Compact style={{ width: '100%' }}>
            <Select
              placeholder="Sắp xếp theo"
              value={sortField}
              onChange={onSortFieldChange}
              style={{ 
                width: '60%',
                height: '40px'
              }}
            >
              <Select.Option value="createdAt">Ngày tạo</Select.Option>
              <Select.Option value="checkIn">Ngày nhận phòng</Select.Option>
              <Select.Option value="checkOut">Ngày trả phòng</Select.Option>
              <Select.Option value="totalPrice">Tổng tiền</Select.Option>
              <Select.Option value="paymentStatus">Trạng thái thanh toán</Select.Option>
              <Select.Option value="guestName">Tên khách hàng</Select.Option>
              <Select.Option value="roomNumber">Số phòng</Select.Option>
            </Select>
            <Select
              value={sortOrder}
              onChange={onSortOrderChange}
              style={{ 
                width: '40%',
                height: '40px'
              }}
            >
              <Select.Option value="desc">
                <SortAscendingOutlined /> Giảm dần
              </Select.Option>
              <Select.Option value="asc">
                <SortAscendingOutlined style={{ transform: 'rotate(180deg)' }} /> Tăng dần
              </Select.Option>
            </Select>
          </Space.Compact>
        </Col>
      </Row>
      <div 
        style={{ 
          marginTop: 12, 
          textAlign: 'right',
          minHeight: '32px', // Đảm bảo chiều cao tối thiểu cho phần footer
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}
      >
        <Space>
          <Button 
            icon={<FilterOutlined />} 
            onClick={onClearFilters}
            size="small"
          >
            Xóa bộ lọc
          </Button>
          <Text type="secondary">
            Hiển thị {filteredCount} / {totalCount} booking
          </Text>
        </Space>
      </div>
    </Card>
  );
}