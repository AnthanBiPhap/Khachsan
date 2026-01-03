import React from "react";
import { 
  Form, 
  Input, 
  Modal, 
  Select, 
  Row, 
  Col, 
  Typography, 
  Card, 
  Space, 
  Avatar 
} from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CrownOutlined, 
  TeamOutlined, 
  EditOutlined, 
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import type { UserFormProps } from "../../types/user";

export default function UserForm({ open, user, onCancel, onSave }: UserFormProps) {
  const [form] = Form.useForm();

  // Khi mở modal thì fill sẵn data
  React.useEffect(() => {
    if (user) form.setFieldsValue(user);
    else form.resetFields();
  }, [user, form]);

  return (
    <Modal
      title={
        <Space>
          <Avatar 
            style={{ backgroundColor: user ? '#1890ff' : '#52c41a' }} 
            icon={user ? <EditOutlined /> : <PlusOutlined />} 
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {user ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}
          </Typography.Title>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
      width={800}
      style={{ top: 20 }}
      okText={user ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy bỏ"
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onSave}
        style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0 8px' }}
      >
        {/* Thông tin cơ bản */}
        <Card 
          title={
            <Space>
              <UserOutlined style={{ color: '#1890ff' }} />
              <span>Thông tin cơ bản</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                required={false}
                label={
                  <Space>
                    <UserOutlined />
                    <span>
                      Họ và tên <span style={{ color: '#ff4d4f' }}>*</span>
                    </span>
                  </Space>
                }
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input 
                  placeholder="Nhập họ và tên" 
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                required={false}
                label={
                  <Space>
                    <MailOutlined />
                    <span>
                      Email <span style={{ color: '#ff4d4f' }}>*</span>
                    </span>
                  </Space>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" }
                ]}
              >
                <Input 
                  placeholder="Nhập email" 
                  prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item 
                name="phoneNumber" 
                required={false}
                label={
                  <Space>
                    <PhoneOutlined />
                    <span>
                      Số điện thoại <span style={{ color: '#ff4d4f' }}>*</span>
                    </span>
                  </Space>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^\d{8,15}$/, message: "Số điện thoại không hợp lệ" }
                ]}
              >
                <Input 
                  placeholder="Nhập số điện thoại" 
                  prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin vai trò và trạng thái */}
        <Card 
          title={
            <Space>
              <CrownOutlined style={{ color: '#722ed1' }} />
              <span>Vai trò và trạng thái</span>
            </Space>
          }
          size="small"
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item 
                name="role" 
                label={
                  <Space>
                    <CrownOutlined />
                    <span>Vai trò</span>
                  </Space>
                }
              >
                <Select
                  placeholder="Chọn vai trò"
                  options={[
                    { 
                      label: (
                        <Space>
                          <CrownOutlined style={{ color: '#fa541c' }} />
                          <span>Admin</span>
                        </Space>
                      ), 
                      value: "admin" 
                    },
                    { 
                      label: (
                        <Space>
                          <TeamOutlined style={{ color: '#13c2c2' }} />
                          <span>Staff</span>
                        </Space>
                      ), 
                      value: "staff" 
                    },
                    { 
                      label: (
                        <Space>
                          <UserOutlined style={{ color: '#1890ff' }} />
                          <span>User</span>
                        </Space>
                      ), 
                      value: "user" 
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="status" 
                label={
                  <Space>
                    <TeamOutlined />
                    <span>Trạng thái</span>
                  </Space>
                }
              >
                <Select
                  placeholder="Chọn trạng thái"
                  options={[
                    { 
                      label: (
                        <Space>
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          <span>Đang hoạt động</span>
                        </Space>
                      ), 
                      value: "active" 
                    },
                    { 
                      label: (
                        <Space>
                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                          <span>Bị khóa</span>
                        </Space>
                      ), 
                      value: "blocked" 
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}
