import { Form, Input, Modal, Select, message, Row, Col, Typography, Image } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import type { Room, RoomType } from "../../types/room";
import type { RoomsFormProps } from "../../types/room";

const { Title, Text } = Typography;

const { Option } = Select;

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
      title={room ? "Chỉnh sửa thông tin phòng" : "Thêm phòng mới"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      style={{ top: 50 }}
      okText={room ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy bỏ"
    >
      <Form layout="vertical" form={form} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Typography.Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin cơ bản</Typography.Title>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="roomNumber" 
                label="Số phòng" 
                rules={[{ required: true, message: "Nhập số phòng" }]}
              >
                <Input placeholder="VD: 101A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="status" 
                label="Trạng thái" 
                rules={[{ required: true, message: "Chọn trạng thái" }]}
              >
                <Select placeholder="Chọn trạng thái" style={{ width: '100%' }}>
                  <Option value="available">Sẵn sàng</Option>
                  <Option value="occupied">Đang ở</Option>
                  <Option value="maintenance">Bảo trì</Option>
                  <Option value="unavailable">Không khả dụng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Typography.Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin loại phòng</Typography.Title>
          
          <Form.Item 
            name="typeId" 
            label="Chọn loại phòng"
            rules={[{ required: true, message: "Chọn loại phòng" }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Chọn loại phòng"
              loading={loadingTypes}
              style={{ width: '100%' }}
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
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Typography.Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Tiện nghi phòng</Typography.Title>
          
          <Form.Item 
            name="amenities" 
            label="Thêm tiện nghi"
            help="Nhập từng tiện nghi và nhấn Enter"
          >
            <Select 
              mode="tags" 
              tokenSeparators={[","]} 
              placeholder="VD: Tủ lạnh, Điều hòa, Wifi..."
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Hình ảnh phòng</Title>
          
          <Form.Item 
            name="images" 
            label="Nhập URL hình ảnh"
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
              <Text type="secondary">Xem trước hình ảnh:</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {imageUrls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                    preview={{ src: url }}
                    fallback="https://via.placeholder.com/100"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
}
