import {
  Table,
  Typography,
  message,
  Button,
  Drawer,
  Descriptions,
  Tag,
  Input,
  Select,
  Space,
  Card,
} from "antd";
import { useEffect, useState } from "react";
import {
  SearchOutlined,
  PlusOutlined,
  TagOutlined,
} from "@ant-design/icons";
import type { Coupon } from "../../services/coupons.service";
import {
  fetchCoupons,
  deleteCoupon,
  updateCoupon,
  createCoupon,
} from "../../services/coupons.service";
import { couponsColumns } from "../../components/Coupons/CouponsColumns";
import CouponForm from "../../components/Coupons/CouponForm";
import dayjs from "dayjs";

const { Search } = Input;
const { Title } = Typography;

export default function CouponsPage() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailItem, setDetailItem] = useState<Coupon | null>(null);
  const [filters, setFilters] = useState<{
    code?: string;
    status?: string;
    applicableTo?: string;
  }>({});

  const load = async (
    page = 1,
    limit = 10,
    currentFilters?: typeof filters
  ) => {
    try {
      setLoading(true);
      const res = await fetchCoupons(page, limit, currentFilters || filters);
      setItems(res.coupons || []);
      setPagination({
        current: res.pagination?.page || 1,
        pageSize: res.pagination?.limit || 10,
        total: res.pagination?.totalRecord || 0,
      });
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách coupon");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      message.success("Đã xóa coupon thành công");
      load(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error("Xóa coupon thất bại");
    }
  };

  const handleSave = async (values: Partial<Coupon>) => {
    try {
      if (editing) {
        await updateCoupon(editing._id, values);
        message.success("Cập nhật coupon thành công");
      } else {
        await createCoupon(values);
        message.success("Tạo coupon thành công");
      }
      setOpenForm(false);
      setEditing(null);
      load(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Lưu coupon thất bại"
      );
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    load(1, pagination.pageSize, newFilters);
  };

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <Space align="center">
            <TagOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <Title level={3} style={{ margin: 0 }}>
              Quản lý Coupon
            </Title>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
          >
            Tạo coupon mới
          </Button>
        </Space>
      </Card>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Tìm kiếm theo mã coupon"
            allowClear
            style={{ width: 300 }}
            onSearch={(value) => {
              handleFilterChange("code", value || undefined);
            }}
            enterButton={<SearchOutlined />}
          />
          <Select
            placeholder="Chọn trạng thái"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => {
              handleFilterChange("status", value);
            }}
          >
            <Select.Option value="active">Đang hoạt động</Select.Option>
            <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
            <Select.Option value="expired">Hết hạn</Select.Option>
          </Select>
          <Select
            placeholder="Chọn loại áp dụng"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => {
              handleFilterChange("applicableTo", value);
            }}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="room">Phòng</Select.Option>
            <Select.Option value="service">Dịch vụ</Select.Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={couponsColumns(
          (record) => {
            setEditing(record);
            setOpenForm(true);
          },
          handleDelete,
          (record) => {
            setDetailItem(record);
            setOpenDetail(true);
          }
        )}
        dataSource={items}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} coupon`,
        }}
        onChange={(p) => load(p.current, p.pageSize, filters)}
        bordered
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có dữ liệu coupon" }}
      />

      <CouponForm
        open={openForm}
        coupon={editing}
        onCancel={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSave={handleSave}
        loading={loading}
      />

      <Drawer
        title="Chi tiết coupon"
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setDetailItem(null);
        }}
        width={680}
      >
        {detailItem && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Mã coupon">
              <Typography.Text strong copyable={{ text: detailItem.code }}>
                {detailItem.code}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên">
              {detailItem.name}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {detailItem.description || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Loại giảm giá">
              <Tag color={detailItem.discountType === "percentage" ? "blue" : "green"}>
                {detailItem.discountType === "percentage" ? "Phần trăm" : "Số tiền cố định"}
              </Tag>
              <Typography.Text strong style={{ marginLeft: 8 }}>
                {detailItem.discountType === "percentage"
                  ? `${detailItem.discountValue}%`
                  : `${detailItem.discountValue.toLocaleString()} VNĐ`}
              </Typography.Text>
            </Descriptions.Item>
            {detailItem.discountType === "percentage" && detailItem.maxDiscountAmount > 0 && (
              <Descriptions.Item label="Số tiền giảm tối đa">
                {detailItem.maxDiscountAmount.toLocaleString()} VNĐ
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Giá trị đơn hàng tối thiểu">
              {detailItem.minOrderAmount > 0
                ? `${detailItem.minOrderAmount.toLocaleString()} VNĐ`
                : "Không giới hạn"}
            </Descriptions.Item>
            <Descriptions.Item label="Áp dụng cho">
              <Tag
                color={
                  detailItem.applicableTo === "all"
                    ? "purple"
                    : detailItem.applicableTo === "room"
                    ? "blue"
                    : "orange"
                }
              >
                {detailItem.applicableTo === "all"
                  ? "Tất cả"
                  : detailItem.applicableTo === "room"
                  ? "Phòng"
                  : "Dịch vụ"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian hiệu lực">
              <Space direction="vertical" size={0}>
                <Typography.Text>
                  Từ: {dayjs(detailItem.startDate).format("DD/MM/YYYY HH:mm")}
                </Typography.Text>
                <Typography.Text>
                  Đến: {dayjs(detailItem.endDate).format("DD/MM/YYYY HH:mm")}
                </Typography.Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Số lần sử dụng">
              <Space direction="vertical" size={0}>
                <Typography.Text>
                  Đã dùng: {detailItem.usedCount || 0}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {detailItem.usageLimit > 0
                    ? `Tối đa: ${detailItem.usageLimit}`
                    : "Không giới hạn"}
                </Typography.Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  detailItem.status === "active"
                    ? "success"
                    : detailItem.status === "expired"
                    ? "error"
                    : "default"
                }
              >
                {detailItem.status === "active"
                  ? "Đang hoạt động"
                  : detailItem.status === "expired"
                  ? "Hết hạn"
                  : "Ngừng hoạt động"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(detailItem.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              {dayjs(detailItem.updatedAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}

