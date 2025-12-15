import { Modal, Form, Input, Select, message } from "antd";
import { useEffect } from "react";
import type { Contact } from "../../services/contacts.service";

const { TextArea } = Input;

interface ContactFormProps {
  open: boolean;
  contact: Contact | null;
  onCancel: () => void;
  onSave: (values: {
    name?: string;
    contact?: string;
    subject?: string;
    message?: string;
    status?: string;
    replyMessage?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export default function ContactForm({
  open,
  contact,
  onCancel,
  onSave,
  loading = false,
}: ContactFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (contact) {
      form.setFieldsValue({
        name: contact.name,
        contact: contact.contact,
        subject: contact.subject,
        message: contact.message,
        status: contact.status,
        replyMessage: contact.replyMessage || "",
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: "new",
        subject: "general",
      });
    }
  }, [contact, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      open={open}
      title={contact ? "Phản hồi liên hệ" : "Tạo liên hệ"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên người liên hệ"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input placeholder="Nhập tên người liên hệ" />
        </Form.Item>
        <Form.Item
          name="contact"
          label="Email/Số điện thoại"
          rules={[{ required: true, message: "Vui lòng nhập email hoặc số điện thoại" }]}
        >
          <Input placeholder="Nhập email hoặc số điện thoại" />
        </Form.Item>
        <Form.Item
          name="subject"
          label="Chủ đề"
          rules={[{ required: true, message: "Vui lòng chọn chủ đề" }]}
        >
          <Select placeholder="Chọn chủ đề">
            <Select.Option value="booking">Đặt phòng</Select.Option>
            <Select.Option value="service">Thắc mắc dịch vụ</Select.Option>
            <Select.Option value="issue">Báo sự cố</Select.Option>
            <Select.Option value="feedback">Góp ý</Select.Option>
            <Select.Option value="general">Thông tin chung</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="message"
          label="Tin nhắn"
          rules={[{ required: true, message: "Vui lòng nhập tin nhắn" }]}
        >
          <TextArea rows={4} placeholder="Nhập nội dung tin nhắn" />
        </Form.Item>
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select>
            <Select.Option value="new">Mới</Select.Option>
            <Select.Option value="read">Đã đọc</Select.Option>
            <Select.Option value="replied">Đã trả lời</Select.Option>
            <Select.Option value="archived">Đã lưu trữ</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="replyMessage"
          label="Phản hồi"
          rules={[
            {
              required: false,
              message: "Vui lòng nhập phản hồi",
            },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Nhập phản hồi cho khách hàng..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

