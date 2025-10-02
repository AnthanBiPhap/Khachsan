import { Form, Input, Modal, Select, Row, Col, Typography, Tag } from "antd";
import { useEffect, useState } from "react";
import type { ReviewStatus, ReviewTargetType, SimpleRef, ReviewsFormProps } from "../../types/review";
import axios from "axios";
import { StarFilled } from "@ant-design/icons";

const { TextArea } = Input;
const { Title } = Typography;

export default function ReviewsForm({ open, item, onCancel, onSave, loading }: ReviewsFormProps) {
  const [form] = Form.useForm();
  const [rooms, setRooms] = useState<SimpleRef[]>([]);
  const [services, setServices] = useState<SimpleRef[]>([]);
  const [locations, setLocations] = useState<SimpleRef[]>([]);
  const [users, setUsers] = useState<SimpleRef[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try { const res = await axios.get("http://localhost:8080/api/v1/rooms"); setRooms(res.data?.data?.rooms || []); } catch {}
    };
    const fetchServices = async () => {
      try { const res = await axios.get("http://localhost:8080/api/v1/services"); const arr = res.data?.data?.data || res.data?.data?.services || []; setServices(arr); } catch {}
    };
    const fetchLocations = async () => {
      try { const res = await axios.get("http://localhost:8080/api/v1/locations"); setLocations(res.data?.data?.locations || []); } catch {}
    };
    const fetchUsers = async () => {
      try { const res = await axios.get("http://localhost:8080/api/v1/users"); setUsers(res.data?.data?.users || []); } catch {}
    };

    fetchRooms();
    fetchServices();
    fetchLocations();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        reviewerId: item.reviewerId?._id,
        targetType: item.targetType,
        targetId: item.targetId,
        rating: item.rating,
        comment: item.comment,
        status: item.status,
      });
    } else {
      form.resetFields();
    }
  }, [item, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await onSave({
      reviewerId: values.reviewerId,
      targetType: values.targetType as ReviewTargetType,
      targetId: values.targetId,
      rating: values.rating,
      comment: values.comment,
      status: values.status as ReviewStatus,
    });
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active': return <Tag color="green">Hiện</Tag>;
      case 'hidden': return <Tag color="orange">Ẩn</Tag>;
      case 'deleted': return <Tag color="red">Xóa</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const getTargetTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'room': 'Phòng',
      'service': 'Dịch vụ',
      'location': 'Địa điểm'
    };
    return typeLabels[type] || type;
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <StarFilled key={i} style={{ color: i < rating ? '#faad14' : '#e8e8e8', marginRight: 4 }} />
    ));
  };

  return (
    <Modal
      open={open}
      title={item ? "Chỉnh sửa đánh giá" : "Tạo đánh giá mới"}
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
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Thông tin đánh giá</Title>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="reviewerId" 
                label="Người đánh giá" 
                rules={[{ required: true, message: "Chọn người đánh giá" }]}
              >
                <Select
                  showSearch
                  placeholder="Tìm kiếm người đánh giá..."
                  filterOption={(input, option) => 
                    ((option?.label as string) ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  options={users.map(u => ({ 
                    label: u.fullName || `User ${u._id.slice(0,6)}...`, 
                    value: u._id 
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                name="targetType" 
                label="Loại đối tượng" 
                rules={[{ required: true, message: "Chọn loại đối tượng" }]}
              >
                <Select 
                  placeholder="Chọn loại đối tượng"
                  options={[
                    {value: 'room', label: 'Phòng'}, 
                    {value: 'service', label: 'Dịch vụ'}, 
                    {value: 'location', label: 'Địa điểm'}
                  ]} 
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item shouldUpdate noStyle>
                {() => {
                  const type = form.getFieldValue('targetType');
                  const options = type === 'room' 
                    ? rooms.map(r => ({label: r.name || `Phòng ${r._id.slice(0,6)}...`, value: r._id}))
                    : type === 'service' 
                      ? services.map(s => ({label: s.name || `Dịch vụ ${s._id.slice(0,6)}...`, value: s._id}))
                      : locations.map(l => ({label: l.name || `Địa điểm ${l._id.slice(0,6)}...`, value: l._id}));
                  
                  return (
                    <Form.Item 
                      name="targetId" 
                      label="Đối tượng" 
                      rules={[{ required: true, message: "Chọn đối tượng" }]}
                    > 
                      <Select 
                        showSearch 
                        placeholder={`Chọn ${getTargetTypeLabel(type) || 'đối tượng'}`}
                        options={options} 
                        filterOption={(input, option) => 
                          ((option?.label as string) ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                name="rating" 
                label="Đánh giá" 
                rules={[{ required: true, message: "Chọn số sao từ 1-5" }]}
              >
                <Select placeholder="Chọn số sao">
                  {[1, 2, 3, 4, 5].map(num => (
                    <Select.Option key={num} value={num}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {renderStars(num)}
                        <span style={{ marginLeft: 8 }}>{num} sao</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                name="status" 
                label="Trạng thái" 
                rules={[{ required: true, message: "Chọn trạng thái" }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="active">
                    <Tag color="green">Hiện</Tag>
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
          </Row>
        </div>

        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: '14px' }}>Nội dung đánh giá</Title>
          
          <Form.Item 
            name="comment" 
            label="Bình luận"
            rules={[{ max: 1000, message: "Bình luận không được vượt quá 1000 ký tự" }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập nội dung đánh giá chi tiết..."
              style={{ resize: 'none' }}
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
