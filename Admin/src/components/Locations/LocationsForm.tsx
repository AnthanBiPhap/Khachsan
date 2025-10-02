import { Form, Input, Modal, Select, InputNumber, Row, Col, Typography, Tag } from "antd";
import { useEffect } from "react";
import type { LocationStatus, LocationType, LocationsFormProps } from "../../types/location";

const { TextArea } = Input;
const { Title } = Typography;

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

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active': return <Tag color="green">Hoạt động</Tag>;
      case 'hidden': return <Tag color="orange">Ẩn</Tag>;
      case 'deleted': return <Tag color="red">Xóa</Tag>;
      default: return <Tag>{status}</Tag>;
    }
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
      title={item ? "Chỉnh sửa địa điểm" : "Tạo địa điểm mới"}
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
                label="Tên địa điểm" 
                rules={[{ required: true, message: "Nhập tên địa điểm" }]}
              >
                <Input placeholder="Nhập tên địa điểm" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                name="type" 
                label="Loại địa điểm" 
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
                label="Trạng thái" 
                rules={[{ required: true, message: "Chọn trạng thái" }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="active">
                    <Tag color="green">Hoạt động</Tag>
                  </Select.Option>
                  <Select.Option value="hidden">
                    <Tag color="orange">Ẩn</Tag>
                  </Select.Option>
                  <Select.Option value="deleted" disabled>
                    <Tag color="red">Xóa</Tag>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ">
                <Input placeholder="Nhập địa chỉ chi tiết" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="description" label="Mô tả">
                <TextArea 
                  rows={3} 
                  placeholder="Nhập mô tả chi tiết về địa điểm"
                  style={{ resize: 'none' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Đánh giá và hình ảnh</Title>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="ratingAvg" 
                label="Điểm đánh giá" 
                rules={[{ type: "number", min: 0, max: 5 }]}
              >
                <InputNumber 
                  min={0} 
                  max={5} 
                  step={0.1} 
                  style={{ width: '100%' }} 
                  placeholder="0.0 - 5.0"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                name="images" 
                label="Hình ảnh (URL)"
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
        </div>
      </Form>
    </Modal>
  );
}
