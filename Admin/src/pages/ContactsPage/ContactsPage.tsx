import {
  Table,
  Typography,
  message,
  Button,
  Drawer,
  Descriptions,
  Tag,
  Input,
  Select,
  Space,
} from "antd";
import { useEffect, useState } from "react";
import { MessageOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import type { Contact } from "../../services/contacts.service";
import {
  fetchContacts,
  deleteContact,
  updateContact,
  createContact,
  markContactAsRead,
} from "../../services/contacts.service";
import { contactsColumns } from "../../components/Contacts/ContactsColumns";
import ContactForm from "../../components/Contacts/ContactForm";

const { Search } = Input;

export default function ContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailItem, setDetailItem] = useState<Contact | null>(null);
  const [filters, setFilters] = useState<{
    name?: string;
    contact?: string;
    subject?: string;
    status?: string;
  }>({});

  const load = async (
    page = 1,
    limit = 10,
    currentFilters?: typeof filters
  ) => {
    try {
      setLoading(true);
      const res = await fetchContacts(page, limit, currentFilters || filters);
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
      setPagination({
        current: res.pagination?.page || 1,
        pageSize: res.pagination?.limit || 10,
        total: res.pagination?.total || 0,
      });
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách liên hệ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteContact(id);
      message.success("Đã xóa liên hệ thành công");
      load(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error("Xóa liên hệ thất bại");
    }
  };

  const handleSave = async (values: {
    name?: string;
    contact?: string;
    subject?: string;
    message?: string;
    status?: string;
    replyMessage?: string;
  }) => {
    try {
      if (editing) {
        // Cập nhật liên hệ hiện có
        await updateContact(editing._id, values);
        message.success("Cập nhật liên hệ thành công");
      } else {
        // Tạo liên hệ mới
        if (!values.name || !values.contact || !values.message) {
          message.error("Vui lòng điền đầy đủ thông tin");
          return;
        }
        await createContact({
          name: values.name!,
          contact: values.contact!,
          subject: values.subject || "general",
          message: values.message!,
          status: values.status || "new",
        });
        message.success("Tạo liên hệ thành công");
      }
      setOpenForm(false);
      setEditing(null);
      load(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("Error saving contact:", error);
      message.error(error.message || "Có lỗi xảy ra khi lưu liên hệ");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markContactAsRead(id);
      message.success("Đã đánh dấu đã đọc");
      load(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error("Đánh dấu đã đọc thất bại");
    }
  };

  const handleSearch = () => {
    load(1, pagination.pageSize, filters);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={4}>
          <MessageOutlined /> Quản lý liên hệ
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
        >
          Thêm liên hệ
        </Button>
      </div>

      {/* Filters */}
      <div
        style={{
          marginBottom: 16,
          padding: 16,
          background: "#fafafa",
          borderRadius: 8,
        }}
      >
        <Space wrap>
          <Search
            placeholder="Tìm theo tên"
            allowClear
            style={{ width: 200 }}
            onSearch={(value) => {
              handleFilterChange("name", value);
              setFilters((prev) => ({ ...prev, name: value }));
              load(1, pagination.pageSize, { ...filters, name: value });
            }}
          />
          <Search
            placeholder="Tìm theo email/phone"
            allowClear
            style={{ width: 200 }}
            onSearch={(value) => {
              handleFilterChange("contact", value);
              setFilters((prev) => ({ ...prev, contact: value }));
              load(1, pagination.pageSize, { ...filters, contact: value });
            }}
          />
          <Select
            placeholder="Chọn chủ đề"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => {
              handleFilterChange("subject", value);
              setFilters((prev) => ({ ...prev, subject: value }));
              load(1, pagination.pageSize, { ...filters, subject: value });
            }}
          >
            <Select.Option value="booking">Đặt phòng</Select.Option>
            <Select.Option value="service">Thắc mắc dịch vụ</Select.Option>
            <Select.Option value="issue">Báo sự cố</Select.Option>
            <Select.Option value="feedback">Góp ý</Select.Option>
            <Select.Option value="general">Thông tin chung</Select.Option>
          </Select>
          <Select
            placeholder="Chọn trạng thái"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => {
              handleFilterChange("status", value);
              setFilters((prev) => ({ ...prev, status: value }));
              load(1, pagination.pageSize, { ...filters, status: value });
            }}
          >
            <Select.Option value="new">Mới</Select.Option>
            <Select.Option value="read">Đã đọc</Select.Option>
            <Select.Option value="replied">Đã trả lời</Select.Option>
            <Select.Option value="archived">Đã lưu trữ</Select.Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={contactsColumns(
          (record) => {
            setEditing(record);
            setOpenForm(true);
          },
          handleDelete,
          (record) => {
            setDetailItem(record);
            setOpenDetail(true);
          },
          handleMarkAsRead
        )}
        dataSource={items}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} liên hệ`,
        }}
        onChange={(p) => load(p.current, p.pageSize, filters)}
        bordered
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có dữ liệu liên hệ" }}
      />

      <ContactForm
        open={openForm}
        contact={editing}
        onCancel={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSave={handleSave}
        loading={loading}
      />

      <Drawer
        title="Chi tiết liên hệ"
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setDetailItem(null);
        }}
        width={680}
      >
        {detailItem && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Tên">
              {detailItem.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email/Số điện thoại">
              <Typography.Text copyable>{detailItem.contact}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Chủ đề">
              <Tag>
                {detailItem.subject === "booking"
                  ? "Đặt phòng"
                  : detailItem.subject === "service"
                  ? "Thắc mắc dịch vụ"
                  : detailItem.subject === "issue"
                  ? "Báo sự cố"
                  : detailItem.subject === "feedback"
                  ? "Góp ý"
                  : "Thông tin chung"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tin nhắn">
              {detailItem.message}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  detailItem.status === "new"
                    ? "red"
                    : detailItem.status === "read"
                    ? "blue"
                    : detailItem.status === "replied"
                    ? "green"
                    : "default"
                }
              >
                {detailItem.status === "new"
                  ? "Mới"
                  : detailItem.status === "read"
                  ? "Đã đọc"
                  : detailItem.status === "replied"
                  ? "Đã trả lời"
                  : "Đã lưu trữ"}
              </Tag>
            </Descriptions.Item>
            {detailItem.replyMessage && (
              <Descriptions.Item label="Phản hồi">
                {detailItem.replyMessage}
              </Descriptions.Item>
            )}
            {detailItem.repliedBy && (
              <Descriptions.Item label="Người phản hồi">
                {(detailItem.repliedBy as any)?.fullName || "-"}
              </Descriptions.Item>
            )}
            {detailItem.repliedAt && (
              <Descriptions.Item label="Thời gian phản hồi">
                {new Date(detailItem.repliedAt).toLocaleString("vi-VN")}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Tạo lúc">
              {detailItem.createdAt
                ? new Date(detailItem.createdAt).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật">
              {detailItem.updatedAt
                ? new Date(detailItem.updatedAt).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}

