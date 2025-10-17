import { 
  Form, 
  Input, 
  Modal, 
  Select, 
  message, 
  Row, 
  Col, 
  Typography, 
  Image, 
  Card, 
  Space, 
  Avatar, 
  Tag 
} from "antd";
import { 
  HomeOutlined, 
  EditOutlined, 
  PlusOutlined, 
  SettingOutlined, 
  PictureOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import type { RoomType } from "../../types/room";
import type { RoomsFormProps } from "../../types/room";

export default function RoomsForm({ open, room, onCancel, onSave, loading }: RoomsFormProps) {
  const [form] = Form.useForm();
  const [types, setTypes] = useState<RoomType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoadingTypes(true);
        const res = await axios.get("http://localhost:8080/api/v1/roomTypes");
        setTypes(res.data?.data?.roomTypes || []);
      } catch {
        message.error("Không tải được danh sách loại phòng");
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchRoomTypes();
  }, []);

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (room) {
      const initialImages = room.images || [];
      form.setFieldsValue({
        roomNumber: room.roomNumber,
        typeId: room.typeId?._id,
        status: room.status,
        amenities: room.amenities || [],
        images: initialImages
      });
      setImageUrls(initialImages);
    } else {
      form.setFieldsValue({
        status: 'available',
        amenities: [],
        images: []
      });
      setImageUrls([]);
    }
  }, [room, form]);

  // Hàm xử lý khi thay đổi loại phòng
  const handleRoomTypeChange = (typeId: string) => {
    const selectedType = types.find(t => t._id === typeId);
    if (selectedType && selectedType.amenities) {
      form.setFieldsValue({
        amenities: selectedType.amenities
      });
    }
  };

  const handleImageChange = (urls: string[]) => {
    setImageUrls(urls);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        roomNumber: values.roomNumber,
        typeId: values.typeId,
        status: values.status,
        amenities: values.amenities,
        images: values.images || []
      });
    } catch (error) {
      console.error(error);
      message.error("Vui lòng điền đủ thông tin");
    }
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <Avatar 
            style={{ backgroundColor: room ? '#1890ff' : '#52c41a' }} 
            icon={room ? <EditOutlined /> : <PlusOutlined />} 
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {room ? "Chỉnh sửa thông tin phòng" : "Thêm phòng mới"}
          </Typography.Title>
        </Space>
      }
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      style={{ top: 20 }}
      okText={room ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy bỏ"
    >
      <Form layout="vertical" form={form} style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0 8px' }}>
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
                name="roomNumber" 
                label={
                  <Space>
                    <HomeOutlined />
                    <span>Số phòng</span>
                  </Space>
                }
                rules={[{ required: true, message: "Nhập số phòng" }]}
              >
                <Input 
                  placeholder="VD: 101A" 
                  prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />}
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
                <Select placeholder="Chọn trạng thái" style={{ width: '100%' }}>
                  <Select.Option value="available">
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span>Sẵn sàng</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="occupied">
                    <Space>
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <span>Đang ở</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="maintenance">
                    <Space>
                      <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                      <span>Bảo trì</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="unavailable">
                    <Space>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      <span>Không khả dụng</span>
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin loại phòng */}
        <Card 
          title={
            <Space>
              <SettingOutlined style={{ color: '#52c41a' }} />
              <span>Thông tin loại phòng</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Form.Item 
            name="typeId" 
            label={
              <Space>
                <SettingOutlined />
                <span>Chọn loại phòng</span>
              </Space>
            }
            rules={[{ required: true, message: "Chọn loại phòng" }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Chọn loại phòng"
              loading={loadingTypes}
              style={{ width: '100%' }}
              onChange={handleRoomTypeChange}
              filterOption={(input, option) => 
                ((option?.label as string) ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={types.map((t) => ({ 
                label: `${t.name} - ${new Intl.NumberFormat("vi-VN", { 
                  style: "currency", 
                  currency: "VND" 
                }).format(t.pricePerNight)}`,
                value: t._id 
              }))}
            />
          </Form.Item>
        </Card>

        {/* Tiện nghi phòng */}
        <Card 
          title={
            <Space>
              <SettingOutlined style={{ color: '#fa8c16' }} />
              <span>Tiện nghi phòng</span>
              <Tag color="green">Tự động từ loại phòng</Tag>
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
                <span>Tiện nghi (có thể chỉnh sửa)</span>
                <Tag color="blue">Tự động lấy từ loại phòng, có thể thêm/bớt</Tag>
              </Space>
            }
            help="Tiện nghi sẽ tự động lấy từ loại phòng đã chọn, bạn có thể thêm hoặc bớt"
          >
            <Select 
              mode="tags" 
              tokenSeparators={[","]} 
              placeholder="Tiện nghi sẽ tự động hiển thị khi chọn loại phòng..."
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Card>

        {/* Hình ảnh phòng */}
        <Card 
          title={
            <Space>
              <PictureOutlined style={{ color: '#722ed1' }} />
              <span>Hình ảnh phòng</span>
            </Space>
          }
          size="small"
        >
          <Form.Item 
            name="images" 
            label={
              <Space>
                <PictureOutlined />
                <span>Nhập URL hình ảnh</span>
                <Tag color="purple">Dán URL và nhấn Enter</Tag>
              </Space>
            }
            rules={[{ required: true, message: 'Vui lòng nhập ít nhất 1 URL hình ảnh' }]}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Dán URL hình ảnh và nhấn Enter"
              onChange={handleImageChange}
              tokenSeparators={[',', ' ']}
            />
          </Form.Item>
          
          {imageUrls.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <Space style={{ marginBottom: '8px' }}>
                <PictureOutlined style={{ color: '#722ed1' }} />
                <Typography.Text type="secondary">Xem trước hình ảnh:</Typography.Text>
                <Tag color="green">{imageUrls.length} hình</Tag>
              </Space>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                marginTop: '8px',
                padding: '12px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                border: '1px dashed #d9d9d9'
              }}>
                {imageUrls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    width={100}
                    height={100}
                    style={{ 
                      objectFit: 'cover', 
                      borderRadius: '6px',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    preview={{ src: url }}
                    fallback="https://via.placeholder.com/100"
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </Form>
    </Modal>
  );
}
