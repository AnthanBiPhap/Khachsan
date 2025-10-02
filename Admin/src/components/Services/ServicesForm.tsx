import { Form, Input, InputNumber, Modal, Select, Row, Col, Typography, Tag } from "antd";
import { useEffect } from "react";
import type { ServiceItem, ServicesFormProps } from "../../types/service";

const { TextArea } = Input;
const { Title } = Typography;

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
      title={service ? "Chỉnh sửa dịch vụ" : "Tạo dịch vụ mới"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      style={{ top: 50 }}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin cơ bản</Title>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="name" 
                label="Tên dịch vụ" 
                rules={[{ required: true, message: "Nhập tên dịch vụ" }]}
              >
                <Input placeholder="Nhập tên dịch vụ" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="description" label="Mô tả">
                <TextArea 
                  rows={3} 
                  placeholder="Nhập mô tả chi tiết về dịch vụ"
                  style={{ resize: 'none' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin giá và thời gian</Title>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="basePrice" 
                label="Giá cơ bản" 
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
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: "Chọn trạng thái" }]}>
                <Select>
                  <Select.Option value="active">
                    <Tag color="green">Đang bán</Tag>
                  </Select.Option>
                  <Select.Option value="hidden">
                    <Tag color="orange">Ẩn</Tag>
                  </Select.Option>
                  <Select.Option value="deleted" disabled>
                    <Tag color="red">Đã xóa</Tag>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="slots" label="Khung giờ">
                <Select 
                  mode="tags" 
                  tokenSeparators={[","]} 
                  placeholder="Nhập khung giờ, ví dụ: 09:00, 11:00, 14:00"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Hình ảnh dịch vụ</Title>
          
          <Form.Item 
            name="images" 
            label="Danh sách URL hình ảnh"
            help="Nhập URL hình ảnh và nhấn Enter để thêm"
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
