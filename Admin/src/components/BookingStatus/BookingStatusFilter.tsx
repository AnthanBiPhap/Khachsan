import { Input, Select, Space, Button, DatePicker } from "antd";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface BookingStatusFilterProps {
  filters: {
    search: string;
    action?: string;
    actorName?: string;
    dateFrom?: any;
    dateTo?: any;
  };
  onFiltersChange: (filters: any) => void;
}

export default function BookingStatusFilter({ filters, onFiltersChange }: BookingStatusFilterProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleActionChange = (value?: string) => {
    onFiltersChange({ ...filters, action: value });
  };

  const handleActorNameChange = (value: string) => {
    onFiltersChange({ ...filters, actorName: value });
  };

  const handleDateFromChange = (date: any) => {
    onFiltersChange({ ...filters, dateFrom: date?.format('YYYY-MM-DD') });
  };

  const handleDateToChange = (date: any) => {
    onFiltersChange({ ...filters, dateTo: date?.format('YYYY-MM-DD') });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      action: undefined,
      actorName: '',
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  return (
    <Space wrap>
      <Input
        placeholder="Tìm kiếm (booking ID, ghi chú...)"
        prefix={<SearchOutlined />}
        value={filters.search}
        onChange={(e) => handleSearchChange(e.target.value)}
        style={{ width: 250 }}
        allowClear
      />
      <Select
        placeholder="Hành động"
        value={filters.action}
        onChange={handleActionChange}
        style={{ width: 150 }}
        allowClear
      >
        <Select.Option value="pending">Chờ xác nhận</Select.Option>
        <Select.Option value="confirmed">Đã xác nhận</Select.Option>
        <Select.Option value="paid">Đã thanh toán</Select.Option>
        <Select.Option value="check_in">Nhận phòng</Select.Option>
        <Select.Option value="check_out">Trả phòng</Select.Option>
        <Select.Option value="cancelled">Đã hủy</Select.Option>
        <Select.Option value="failed">Thất bại</Select.Option>
        <Select.Option value="refunded">Hoàn tiền</Select.Option>
        <Select.Option value="refund_requested">Yêu cầu hoàn tiền</Select.Option>
        <Select.Option value="extend_check_out">Gia hạn trả phòng</Select.Option>
      </Select>
      <Input
        placeholder="Người thao tác"
        value={filters.actorName}
        onChange={(e) => handleActorNameChange(e.target.value)}
        style={{ width: 150 }}
        allowClear
      />
      <DatePicker
        placeholder="Từ ngày"
        value={filters.dateFrom ? dayjs(filters.dateFrom) : null}
        onChange={handleDateFromChange}
        style={{ width: 120 }}
      />
      <DatePicker
        placeholder="Đến ngày"
        value={filters.dateTo ? dayjs(filters.dateTo) : null}
        onChange={handleDateToChange}
        style={{ width: 120 }}
      />
      <Button
        icon={<ClearOutlined />}
        onClick={handleClearFilters}
      >
        Xóa bộ lọc
      </Button>
    </Space>
  );
}
