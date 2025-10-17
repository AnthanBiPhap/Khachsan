import { 
  Form, 
  Input, 
  Modal, 
  Select, 
  InputNumber, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Card, 
  Space, 
  Avatar 
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  EnvironmentOutlined, 
  SettingOutlined, 
  StarOutlined, 
  PictureOutlined, 
  CheckCircleOutlined, 
  EyeInvisibleOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import { useEffect } from "react";
import type { LocationStatus, LocationType, LocationsFormProps } from "../../types/location";


const LOCATION_TYPES: LocationType[] = [
  "tham_quan",
  "an_uong",
  "the_thao",
  "phim_anh",
  "sach",
  "game",
  "du_lich",
  "thu_gian",
  "bao_tang",
  "vuon_quoc_gia",
];

export default function LocationsForm({ open, item, onCancel, onSave, loading }: LocationsFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        name: item.name,
        type: item.type,
        description: item.description,
        address: item.address,
        images: item.images || [],
        ratingAvg: item.ratingAvg,
        status: item.status,
      });
    } else {
      form.resetFields();
    }
  }, [item, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await onSave({
      name: values.name,
      type: values.type,
      description: values.description,
      address: values.address,
      images: values.images,
      ratingAvg: values.ratingAvg,
      status: values.status as LocationStatus,
    });
  };


  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'tham_quan': 'Tham quan',
      'an_uong': 'Ăn uống',
      'the_thao': 'Thể thao',
      'phim_anh': 'Phim ảnh',
      'sach': 'Sách',
      'game': 'Game',
      'du_lich': 'Du lịch',
      'thu_gian': 'Thư giãn',
      'bao_tang': 'Bảo tàng',
      'vuon_quoc_gia': 'Vườn quốc gia'
    };
    return typeLabels[type] || type;
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <Avatar 
            style={{ backgroundColor: item ? '#1890ff' : '#52c41a' }} 
            icon={item ? <EditOutlined /> : <PlusOutlined />} 
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {item ? "Chỉnh sửa địa điểm" : "Tạo địa điểm mới"}
          </Typography.Title>
        </Space>
      }
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      style={{ top: 20 }}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0 8px' }}>
        {/* Thông tin cơ bản */}
        <Card 
          title={
            <Space>
              <EnvironmentOutlined style={{ color: '#1890ff' }} />
              <span>Thông tin cơ bản</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <Form.Item 
                name="name" 
                label={
                  <Space>
                    <EnvironmentOutlined />
                    <span>Tên địa điểm</span>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập tên địa điểm" }]}
              >
                <Input 
                  placeholder="Nhập tên địa điểm" 
                  prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                name="type" 
                label={
                  <Space>
                    <SettingOutlined />
                    <span>Loại địa điểm</span>
                  </Space>
                }
                rules={[{ required: true, message: "Chọn loại địa điểm" }]}
              >
                <Select 
                  placeholder="Chọn loại địa điểm"
                  options={LOCATION_TYPES.map(t => ({ 
                    label: getTypeLabel(t), 
                    value: t 
                  }))} 
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                name="status" 
                label={
                  <Space>
                    <SettingOutlined />
                    <span>Trạng thái</span>
                  </Space>
                }
                rules={[{ required: true, message: "Chọn trạng thái" }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="active">
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span>Hoạt động</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="hidden">
                    <Space>
                      <EyeInvisibleOutlined style={{ color: '#faad14' }} />
                      <span>Ẩn</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="deleted" disabled>
                    <Space>
                      <DeleteOutlined style={{ color: '#ff4d4f' }} />
                      <span>Xóa</span>
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                name="address" 
                label={
                  <Space>
                    <EnvironmentOutlined />
                    <span>Địa chỉ</span>
                  </Space>
                }
              >
                <Input 
                  placeholder="Nhập địa chỉ chi tiết" 
                  prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                name="description" 
                label={
                  <Space>
                    <EditOutlined />
                    <span>Mô tả</span>
                  </Space>
                }
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Nhập mô tả chi tiết về địa điểm"
                  style={{ resize: 'none' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Đánh giá và hình ảnh */}
        <Card 
          title={
            <Space>
              <StarOutlined style={{ color: '#fa8c16' }} />
              <span>Đánh giá và hình ảnh</span>
            </Space>
          }
          size="small"
        >
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <Form.Item 
                name="ratingAvg" 
                label={
                  <Space>
                    <StarOutlined />
                    <span>Điểm đánh giá</span>
                    <Tag color="orange">0.0 - 5.0</Tag>
                  </Space>
                }
                rules={[{ type: "number", min: 0, max: 5 }]}
              >
                <InputNumber 
                  min={0} 
                  max={5} 
                  step={0.1} 
                  style={{ width: '100%' }} 
                  placeholder="0.0 - 5.0"
                  prefix={<StarOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                name="images" 
                label={
                  <Space>
                    <PictureOutlined />
                    <span>Hình ảnh (URL)</span>
                    <Tag color="purple">Nhập URL hình ảnh và nhấn Enter để thêm</Tag>
                  </Space>
                }
                help="Nhập URL hình ảnh và nhấn Enter để thêm"
              >
                <Select 
                  mode="tags" 
                  tokenSeparators={[","]} 
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}
