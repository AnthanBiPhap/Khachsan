import { 
  Form, 
  Input, 
  InputNumber, 
  Modal, 
  Select, 
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
  SettingOutlined, 
  DollarOutlined, 
  ClockCircleOutlined, 
  PictureOutlined, 
  CheckCircleOutlined, 
  EyeInvisibleOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import { useEffect } from "react";
import type { ServicesFormProps } from "../../types/service";


export default function ServicesForm({ open, service, onCancel, onSave, loading }: ServicesFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (service) {
      form.setFieldsValue({
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        slots: service.slots || [],
        images: service.images || [],
        status: service.status,
      });
    } else {
      form.resetFields();
    }
  }, [service, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await onSave({
      name: values.name,
      description: values.description,
      basePrice: values.basePrice,
      slots: values.slots,
      images: values.images,
      status: values.status,
    });
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <Avatar 
            style={{ backgroundColor: service ? '#1890ff' : '#52c41a' }} 
            icon={service ? <EditOutlined /> : <PlusOutlined />} 
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {service ? "Chỉnh sửa dịch vụ" : "Tạo dịch vụ mới"}
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
              <SettingOutlined style={{ color: '#1890ff' }} />
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
                    <SettingOutlined />
                    <span>Tên dịch vụ</span>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập tên dịch vụ" }]}
              >
                <Input 
                  placeholder="Nhập tên dịch vụ" 
                  prefix={<SettingOutlined style={{ color: '#bfbfbf' }} />}
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
                  placeholder="Nhập mô tả chi tiết về dịch vụ"
                  style={{ resize: 'none' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin giá và thời gian */}
        <Card 
          title={
            <Space>
              <DollarOutlined style={{ color: '#52c41a' }} />
              <span>Thông tin giá và thời gian</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item 
                name="basePrice" 
                label={
                  <Space>
                    <DollarOutlined />
                    <span>Giá cơ bản</span>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập giá cơ bản" }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  formatter={(value: string | number | undefined) => 
                    `₫${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value: string | undefined) => 
                    parseInt(value?.replace(/₫\s?|(,*)/g, '') || '0', 10)
                  }
                  placeholder="0"
                  prefix={<DollarOutlined style={{ color: '#bfbfbf' }} />}
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
                <Select>
                  <Select.Option value="active">
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span>Đang bán</span>
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
                      <span>Đã xóa</span>
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                name="slots" 
                label={
                  <Space>
                    <ClockCircleOutlined />
                    <span>Khung giờ</span>
                    <Tag color="blue">Nhập từng khung giờ và nhấn Enter</Tag>
                  </Space>
                }
              >
                <Select 
                  mode="tags" 
                  tokenSeparators={[","]} 
                  placeholder="Nhập khung giờ, ví dụ: 09:00, 11:00, 14:00"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Hình ảnh dịch vụ */}
        <Card 
          title={
            <Space>
              <PictureOutlined style={{ color: '#722ed1' }} />
              <span>Hình ảnh dịch vụ</span>
            </Space>
          }
          size="small"
        >
          <Form.Item 
            name="images" 
            label={
              <Space>
                <PictureOutlined />
                <span>Danh sách URL hình ảnh</span>
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
        </Card>
      </Form>
    </Modal>
  );
}
