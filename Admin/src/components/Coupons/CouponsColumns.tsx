import { Space, Tag, Typography, Button } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Coupon } from "../../services/coupons.service";
import dayjs from "dayjs";

export const couponsColumns = (
  handleEdit: (record: Coupon) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: Coupon) => void,
  isStaff: boolean = false
): ColumnsType<Coupon> => [
  {
    title: "Mã Coupon",
    key: "code",
    dataIndex: "code",
    align: "center",
    render: (code: string) => (
      <Typography.Text strong copyable={{ text: code }}>
        {code}
      </Typography.Text>
    ),
  },
  {
    title: "Tên",
    key: "name",
    dataIndex: "name",
    align: "center",
  },
  {
    title: "Loại giảm giá",
    key: "discountType",
    dataIndex: "discountType",
    align: "center",
    render: (type: string, record: Coupon) => (
      <Space direction="vertical" size={0}>
        <Tag color={type === "percentage" ? "blue" : "green"}>
          {type === "percentage" ? "Phần trăm" : "Số tiền cố định"}
        </Tag>
        <Typography.Text strong>
          {type === "percentage"
            ? `${record.discountValue}%`
            : `${record.discountValue.toLocaleString()} VNĐ`}
        </Typography.Text>
        {type === "percentage" && record.maxDiscountAmount > 0 && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Tối đa: {record.maxDiscountAmount.toLocaleString()} VNĐ
          </Typography.Text>
        )}
      </Space>
    ),
  },
  {
    title: "Đơn hàng tối thiểu",
    key: "minOrderAmount",
    dataIndex: "minOrderAmount",
    align: "center",
    render: (amount: number) =>
      amount > 0 ? `${amount.toLocaleString()} VNĐ` : "Không giới hạn",
  },
  {
    title: "Thời gian hiệu lực",
    key: "dates",
    align: "center",
    render: (_: any, record: Coupon) => (
      <Space direction="vertical" size={0}>
        <Typography.Text>
          Từ: {dayjs(record.startDate).format("DD/MM/YYYY")}
        </Typography.Text>
        <Typography.Text>
          Đến: {dayjs(record.endDate).format("DD/MM/YYYY")}
        </Typography.Text>
      </Space>
    ),
  },
  {
    title: "Số lần sử dụng",
    key: "usage",
    align: "center",
    render: (_: any, record: Coupon) => (
      <Space direction="vertical" size={0}>
        <Typography.Text>
          Đã dùng: {record.usedCount || 0}
        </Typography.Text>
        <Typography.Text type="secondary">
          {record.usageLimit > 0
            ? `Tối đa: ${record.usageLimit}`
            : "Không giới hạn"}
        </Typography.Text>
      </Space>
    ),
  },
  {
    title: "Áp dụng cho",
    key: "applicableTo",
    dataIndex: "applicableTo",
    align: "center",
    render: (type: string) => {
      const labels: Record<string, string> = {
        all: "Tất cả",
        room: "Phòng",
        service: "Dịch vụ",
      };
      const colors: Record<string, string> = {
        all: "purple",
        room: "blue",
        service: "orange",
      };
      return (
        <Tag color={colors[type] || "default"}>{labels[type] || type}</Tag>
      );
    },
  },
  {
    title: "Trạng thái",
    key: "status",
    dataIndex: "status",
    align: "center",
    render: (status: string) => {
      const statusConfig: Record<
        string,
        { color: string; icon: React.ReactNode; label: string }
      > = {
        active: {
          color: "success",
          icon: <CheckCircleOutlined />,
          label: "Đang hoạt động",
        },
        inactive: {
          color: "default",
          icon: <CloseCircleOutlined />,
          label: "Ngừng hoạt động",
        },
        expired: {
          color: "error",
          icon: <ClockCircleOutlined />,
          label: "Hết hạn",
        },
      };
      const config = statusConfig[status] || statusConfig.inactive;
      return (
        <Tag color={config.color} icon={config.icon}>
          {config.label}
        </Tag>
      );
    },
  },
  {
    title: "Thao tác",
    key: "actions",
    align: "center",
    fixed: "right",
    width: 150,
    render: (_: any, record: Coupon) => (
      <Space>
        {handleDetail && (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleDetail(record)}
            size="small"
          >
            Chi tiết
          </Button>
        )}
        {!isStaff && (
          <>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            >
              Sửa
            </Button>
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
              size="small"
            >
              Xóa
            </Button>
          </>
        )}
      </Space>
    ),
  },
];

