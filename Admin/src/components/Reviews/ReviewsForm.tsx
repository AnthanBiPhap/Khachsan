import { 
  Form, 
  Input, 
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
  UserOutlined, 
  StarOutlined, 
  SettingOutlined, 
  CommentOutlined, 
  CheckCircleOutlined, 
  EyeInvisibleOutlined, 
  DeleteOutlined,
  StarFilled 
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import type { ReviewStatus, ReviewTargetType, SimpleRef, ReviewsFormProps } from "../../types/review";
import axios from "axios";


export default function ReviewsForm({ open, item, onCancel, onSave, loading }: ReviewsFormProps) {
  const [form] = Form.useForm();
  const [rooms, setRooms] = useState<SimpleRef[]>([]);
  const [services, setServices] = useState<SimpleRef[]>([]);
  const [locations, setLocations] = useState<SimpleRef[]>([]);
  const [users, setUsers] = useState<SimpleRef[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try { 
        const res = await axios.get("http://localhost:8080/api/v1/rooms"); 
        setRooms(res.data?.data?.rooms || []); 
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    const fetchServices = async () => {
      try { 
        const res = await axios.get("http://localhost:8080/api/v1/services"); 
        const arr = res.data?.data?.data || res.data?.data?.services || []; 
        setServices(arr); 
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    const fetchLocations = async () => {
      try { 
        const res = await axios.get("http://localhost:8080/api/v1/locations"); 
        setLocations(res.data?.data?.locations || []); 
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    const fetchUsers = async () => {
      try { 
        const res = await axios.get("http://localhost:8080/api/v1/users"); 
        setUsers(res.data?.data?.users || []); 
      } catch (error) {
        console.error('Error fetching users:', error);
      }
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
      title={
        <Space>
          <Avatar 
            style={{ backgroundColor: item ? '#1890ff' : '#52c41a' }} 
            icon={item ? <EditOutlined /> : <PlusOutlined />} 
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {item ? "Chỉnh sửa đánh giá" : "Tạo đánh giá mới"}
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
        {/* Thông tin đánh giá */}
        <Card 
          title={
            <Space>
              <StarOutlined style={{ color: '#1890ff' }} />
              <span>Thông tin đánh giá</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <Form.Item 
                name="reviewerId" 
                label={
                  <Space>
                    <UserOutlined />
                    <span>Người đánh giá</span>
                  </Space>
                }
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
                label={
                  <Space>
                    <SettingOutlined />
                    <span>Loại đối tượng</span>
                  </Space>
                }
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
                      label={
                        <Space>
                          <SettingOutlined />
                          <span>Đối tượng</span>
                        </Space>
                      }
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

            <Col span={12}>
              <Form.Item 
                name="rating" 
                label={
                  <Space>
                    <StarOutlined />
                    <span>Đánh giá</span>
                    <Tag color="orange">1-5 sao</Tag>
                  </Space>
                }
                rules={[{ required: true, message: "Chọn số sao từ 1-5" }]}
              >
                <Select placeholder="Chọn số sao">
                  {[1, 2, 3, 4, 5].map(num => (
                    <Select.Option key={num} value={num}>
                      <Space>
                        {renderStars(num)}
                        <span>{num} sao</span>
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
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
                      <span>Hiện</span>
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
          </Row>
        </Card>

        {/* Nội dung đánh giá */}
        <Card 
          title={
            <Space>
              <CommentOutlined style={{ color: '#fa8c16' }} />
              <span>Nội dung đánh giá</span>
            </Space>
          }
          size="small"
        >
          <Form.Item 
            name="comment" 
            label={
              <Space>
                <CommentOutlined />
                <span>Bình luận</span>
                <Tag color="blue">Tối đa 1000 ký tự</Tag>
              </Space>
            }
            rules={[{ max: 1000, message: "Bình luận không được vượt quá 1000 ký tự" }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Nhập nội dung đánh giá chi tiết..."
              style={{ resize: 'none' }}
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
}
