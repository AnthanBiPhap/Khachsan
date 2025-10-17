import { Space, Tag, Rate, Avatar, Typography, Button } from "antd";
import { 
  TagOutlined, 
  StarOutlined, 
  MessageOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ReviewItem } from "../../types/review";

export const reviewsColumns = (
  handleEdit: (record: ReviewItem) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: ReviewItem) => void
): ColumnsType<ReviewItem> => [
  {
    title: (
      <Space>
        <TagOutlined style={{ color: '#1890ff' }} />
        <span>Đối tượng</span>
      </Space>
    ),
    key: "target",
    render: (_, r) => {
      const content = (
        <Space>
          <Avatar 
            size="small" 
            icon={<TagOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Typography.Text strong style={{ textTransform: 'capitalize' }}>
              {r.targetType}
            </Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              ID: {r.targetId?.slice(0,8)}...
            </Typography.Text>
          </div>
        </Space>
      );
      return handleDetail ? (
        <Button 
          type="link" 
          onClick={() => handleDetail(r)}
          style={{ padding: 0, height: 'auto' }}
        >
          {content}
        </Button>
      ) : content;
    },
  },
  {
    title: (
      <Space>
        <StarOutlined style={{ color: '#faad14' }} />
        <span>Điểm</span>
      </Space>
    ),
    dataIndex: "rating",
    key: "rating",
    render: (v: number) => (
      <Space>
        <StarOutlined style={{ color: '#faad14' }} />
        <Rate disabled defaultValue={v} />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          ({v}/5)
        </Typography.Text>
      </Space>
    ),
  },
  {
    title: (
      <Space>
        <MessageOutlined style={{ color: '#52c41a' }} />
        <span>Bình luận</span>
      </Space>
    ),
    dataIndex: "comment",
    key: "comment",
    render: (comment: string) => (
      comment ? (
        <Space>
          <MessageOutlined style={{ color: '#52c41a' }} />
          <Typography.Text 
            style={{ 
              maxWidth: 200, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={comment}
          >
            {comment}
          </Typography.Text>
        </Space>
      ) : (
        <Space>
          <MessageOutlined style={{ color: '#d9d9d9' }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Không có bình luận
          </Typography.Text>
        </Space>
      )
    ),
  },
  {
    title: (
      <Space>
        <CheckCircleOutlined style={{ color: '#722ed1' }} />
        <span>Trạng thái</span>
      </Space>
    ),
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
        active: { color: "green", text: "Hiện", icon: <CheckCircleOutlined /> },
        hidden: { color: "orange", text: "Ẩn", icon: <EyeInvisibleOutlined /> },
        deleted: { color: "red", text: "Xóa", icon: <CloseCircleOutlined /> },
      };
      const v = map[status] || { color: "default", text: status, icon: null };
      return (
        <Tag color={v.color} icon={v.icon}>
          {v.text}
        </Tag>
      );
    },
  },
  {
    title: (
      <Space>
        <EditOutlined style={{ color: '#722ed1' }} />
        <span>Thao tác</span>
      </Space>
    ),
    key: "actions",
    render: (_, r) => (
      <Space>
        <Button 
          type="link" 
          size="small" 
          icon={<EditOutlined />}
          onClick={() => handleEdit(r)}
        >
          Sửa
        </Button>
        <Button 
          type="link" 
          size="small" 
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(r._id)}
        >
          Xóa
        </Button>
        {handleDetail && (
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleDetail(r)}
          >
            Chi tiết
          </Button>
        )}
      </Space>
    ),
  },
];
