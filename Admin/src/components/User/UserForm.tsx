import React from "react";
import { Form, Input, Modal, Select } from "antd";
import type { User, UserFormProps } from "../../types/user";

export default function UserForm({ open, user, onCancel, onSave }: UserFormProps) {
  const [form] = Form.useForm();

  // Khi mở modal thì fill sẵn data
  React.useEffect(() => {
    if (user) form.setFieldsValue(user);
    else form.resetFields();
  }, [user, form]);

  return (
    <Modal
      title={user ? "Chỉnh sửa người dùng" : "Tạo người dùng"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form 
      form={form} 
      layout="vertical" 
      onFinish={onSave}
      >
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Nhập họ tên!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: "email", message: "Email không hợp lệ" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="phoneNumber" label="Số điện thoại">
          <Input />
        </Form.Item>

        <Form.Item name="role" label="Vai trò">
          <Select
            options={[
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
            ]}
          />
        </Form.Item>

        <Form.Item name="status" label="Trạng thái">
  <Select
    options={[
      { label: "Đang hoạt động", value: "active" },
      { label: "Bị khóa", value: "blocked" },
    ]}
  />
</Form.Item>

      </Form>
    </Modal>
  );
}
