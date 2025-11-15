import { Card, Input, Select, Space, Typography, Row, Col } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { fetchServices } from "../../services/services.service";
import type { ServiceItem } from "../../types/service";

interface ServiceBookingSearchFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterService: string;
  onServiceChange: (value: string) => void;
  filterDate: string;
  onDateChange: (value: string) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function ServiceBookingSearchFilter({
  searchText,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterService,
  onServiceChange,
  filterDate,
  onDateChange,
  onClearFilters,
  totalCount,
  filteredCount,
}: ServiceBookingSearchFilterProps) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Fetch services from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        const res = await fetchServices(1, 100); // Get all services
        setServices(res.data || []);
      } catch (error) {
        console.error("Error loading services:", error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);
  return (
    <div style={{ width: '100%', minWidth: '800px' }}>
      <Card
        style={{
          marginBottom: 16,
          minHeight: '120px',
        }}
        styles={{
          body: {
            padding: '16px',
            minHeight: '88px',
          }
        }}
      >
        <Row gutter={[16, 16]} style={{ minHeight: '56px' }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ minHeight: '40px' }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                Tìm kiếm đặt dịch vụ
              </Typography.Text>
              <Input
                placeholder="Tìm theo tên khách, dịch vụ..."
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
                <Select.Option value="reserved">Đã đặt</Select.Option>
                <Select.Option value="completed">Hoàn thành</Select.Option>
                <Select.Option value="cancelled">Đã hủy</Select.Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ minHeight: '40px' }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                Lọc theo dịch vụ
              </Typography.Text>
              <Select
                value={filterService}
                onChange={onServiceChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn dịch vụ"
                loading={loadingServices}
              >
                <Select.Option value="all">Tất cả dịch vụ</Select.Option>
                {services.map((service) => (
                  <Select.Option key={service._id} value={service._id}>
                    {service.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ minHeight: '40px' }}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
                Lọc theo ngày
              </Typography.Text>
              <Select
                value={filterDate}
                onChange={onDateChange}
                style={{ width: '100%', height: '32px' }}
                placeholder="Chọn khoảng thời gian"
              >
                <Select.Option value="all">Tất cả thời gian</Select.Option>
                <Select.Option value="today">Hôm nay</Select.Option>
                <Select.Option value="tomorrow">Ngày mai</Select.Option>
                <Select.Option value="thisWeek">Tuần này</Select.Option>
                <Select.Option value="thisMonth">Tháng này</Select.Option>
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
              Hiển thị {filteredCount} / {totalCount} đặt dịch vụ
            </Typography.Text>
          </div>
          
          {(searchText || filterStatus !== 'all' || filterService !== 'all' || filterDate !== 'all') && (
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
