import { 
  Form, 
  Input, 
  InputNumber, 
  Modal, 
  Select, 
  Row, 
  Col, 
  Typography, 
  Card, 
  Space, 
  Avatar, 
  Tag 
} from "antd";
import { 
  HomeOutlined, 
  EditOutlined, 
  PlusOutlined, 
  DollarOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  SettingOutlined, 
  PictureOutlined 
} from "@ant-design/icons";
import { useEffect } from "react";
import type { RoomTypesFormProps } from "../../types/room";

export default function RoomTypesForm({ open, roomType, onCancel, onSave, loading }: RoomTypesFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (roomType) {
      form.setFieldsValue({
        name: roomType.name,
        description: roomType.description,
        pricePerNight: roomType.pricePerNight,
        extraHourPrice: roomType.extraHourPrice,
        maxExtendHours: roomType.maxExtendHours,
        capacity: roomType.capacity,
        amenities: roomType.amenities || [],
        images: roomType.images || [],
      });
    } else {
      form.resetFields();
    }
  }, [roomType, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await onSave({
      name: values.name,
      description: values.description,
      pricePerNight: values.pricePerNight,
      extraHourPrice: values.extraHourPrice,
      maxExtendHours: values.maxExtendHours,
      capacity: values.capacity,
      amenities: values.amenities,
      images: values.images,
    });
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <Avatar 
            style={{ backgroundColor: roomType ? '#1890ff' : '#52c41a' }} 
            icon={roomType ? <EditOutlined /> : <PlusOutlined />} 
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {roomType ? "Chỉnh sửa loại phòng" : "Thêm loại phòng mới"}
          </Typography.Title>
        </Space>
      }
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      style={{ top: 20 }}
      okText={roomType ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy bỏ"
    >
      <Form form={form} layout="vertical" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0 8px' }}>
        {/* Thông tin cơ bản */}
        <Card 
          title={
            <Space>
              <HomeOutlined style={{ color: '#1890ff' }} />
              <span>Thông tin cơ bản</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item 
                name="name" 
                label={
                  <Space>
                    <HomeOutlined />
                    <span>Tên loại phòng</span>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập tên loại phòng" }]}
              >
                <Input 
                  placeholder="VD: Phòng Deluxe" 
                  prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="capacity" 
                label={
                  <Space>
                    <UserOutlined />
                    <span>Sức chứa (người)</span>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập sức chứa" }]}
              >
                <InputNumber<number> 
                  min={1} 
                  style={{ width: '100%' }} 
                  placeholder="VD: 2"
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
          </Row>

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
              placeholder="Nhập mô tả ngắn về loại phòng" 
            />
          </Form.Item>
        </Card>

        {/* Thông tin giá */}
        <Card 
          title={
            <Space>
              <DollarOutlined style={{ color: '#52c41a' }} />
              <span>Thông tin giá</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <Form.Item 
                name="pricePerNight" 
                label={
                  <Space>
                    <DollarOutlined />
                    <span>Giá/đêm</span>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập giá/đêm" }]}
              >
                <InputNumber<number> 
                  min={0} 
                  style={{ width: '100%' }} 
                  step={10000}
                  addonAfter="₫"
                  precision={0}
                  formatter={(value) =>
                    value
                      ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      : ''
                  }
                  parser={(value) =>
                    Number((value || '').replace(/[^\d]/g, '')) || 0
                  }
                  placeholder="Nhập giá/đêm"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="extraHourPrice" 
                label={
                  <Space>
                    <ClockCircleOutlined />
                    <span>Giá phụ thu/giờ</span>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập giá phụ thu mỗi giờ" }]}
              >
                <InputNumber<number> 
                  min={0} 
                  style={{ width: '100%' }} 
                  step={10000}
                  addonAfter="₫"
                  precision={0}
                  formatter={(value) =>
                    value
                      ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      : ''
                  }
                  parser={(value) =>
                    Number((value || '').replace(/[^\d]/g, '')) || 0
                  }
                  placeholder="Nhập giá phụ thu mỗi giờ"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="maxExtendHours" 
                label={
                  <Space>
                    <ClockCircleOutlined />
                    <span>Giờ tối đa</span>
                    <Tag color="blue">Gia hạn</Tag>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập số giờ tối đa gia hạn" }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  placeholder="Giờ"
                  prefix={<ClockCircleOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Tiện nghi */}
        <Card 
          title={
            <Space>
              <SettingOutlined style={{ color: '#fa8c16' }} />
              <span>Tiện nghi</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Form.Item 
            name="amenities" 
            label={
              <Space>
                <SettingOutlined />
                <span>Danh sách tiện nghi</span>
                <Tag color="orange">Nhập từng tiện nghi và nhấn Enter</Tag>
              </Space>
            }
            help="Nhập từng tiện nghi và nhấn Enter"
          >
            <Select 
              mode="tags" 
              tokenSeparators={[","]} 
              placeholder="VD: Điều hòa, Tủ lạnh, Wifi..."
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Card>

        {/* Hình ảnh */}
        <Card 
          title={
            <Space>
              <PictureOutlined style={{ color: '#722ed1' }} />
              <span>Hình ảnh</span>
            </Space>
          }
          size="small"
        >
          <Form.Item 
            name="images" 
            label={
              <Space>
                <PictureOutlined />
                <span>Danh sách URL ảnh</span>
                <Tag color="purple">Dán từng URL ảnh và nhấn Enter</Tag>
              </Space>
            }
            help="Dán từng URL ảnh và nhấn Enter"
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
