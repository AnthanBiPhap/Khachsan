import { Form, Input, InputNumber, Modal, Select, Row, Col, Typography } from "antd";
import { useEffect } from "react";
import type { RoomType, RoomTypesFormProps } from "../../types/room";

const { TextArea } = Input;

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
      title={roomType ? "Chỉnh sửa loại phòng" : "Thêm loại phòng mới"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      style={{ top: 50 }}
      okText={roomType ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy bỏ"
    >
      <Form form={form} layout="vertical" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Typography.Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin cơ bản</Typography.Title>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="name" 
                label="Tên loại phòng" 
                rules={[{ required: true, message: "Nhập tên loại phòng" }]}
              >
                <Input placeholder="VD: Phòng Deluxe" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="capacity" 
                label="Sức chứa (người)" 
                rules={[{ required: true, message: "Nhập sức chứa" }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 2" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="description" 
            label="Mô tả"
          >
            <TextArea rows={2} placeholder="Nhập mô tả ngắn về loại phòng" />
          </Form.Item>
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Typography.Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin giá</Typography.Title>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="pricePerNight" 
                label="Giá/đêm" 
                rules={[{ required: true, message: "Nhập giá/đêm" }]}
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
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="extraHourPrice" 
                label="Giá phụ thu/giờ" 
                rules={[{ required: true, message: "Nhập giá phụ thu mỗi giờ" }]}
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
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="maxExtendHours" 
                label="Giờ tối đa"
                rules={[{ required: true, message: "Nhập số giờ tối đa gia hạn" }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Giờ" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Typography.Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Tiện nghi</Typography.Title>
          
          <Form.Item 
            name="amenities" 
            label="Danh sách tiện nghi"
            help="Nhập từng tiện nghi và nhấn Enter"
          >
            <Select 
              mode="tags" 
              tokenSeparators={[","]} 
              placeholder="VD: Điều hòa, Tủ lạnh, Wifi..."
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Typography.Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Hình ảnh</Typography.Title>
          
          <Form.Item 
            name="images" 
            label="Danh sách URL ảnh"
            help="Dán từng URL ảnh và nhấn Enter"
          >
            <Select 
              mode="tags" 
              tokenSeparators={[","]} 
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
