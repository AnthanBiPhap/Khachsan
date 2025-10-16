import {
  Table,
  Typography,
  message,
  Button,
  Drawer,
  Descriptions,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import type { InvoiceItem } from "../../types/invoice";
import { fetchInvoices, deleteInvoice } from "../../services/invoices.service";
import { env } from "../../constanst/getEnvs";
import { invoicesColumns } from "../../components/Invoices/InvoicesColumns";
import InvoicesForm from "../../components/Invoices/InvoicesForm";

export default function InvoicesPage() {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<InvoiceItem | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailItem, setDetailItem] = useState<InvoiceItem | null>(null);

  const load = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await fetchInvoices(page, limit);
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
      setPagination({
        current: res.pagination?.page || 1,
        pageSize: res.pagination?.limit || 10,
        total: res.pagination?.totalRecord || 0,
      });
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách hóa đơn");
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
      await deleteInvoice(id);
      message.success("Đã xóa hóa đơn thành công");
      load(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error("Xóa hóa đơn thất bại");
    }
  };

  const handleSave = async (values: Partial<InvoiceItem>) => {
    try {
      const url = editing
        ? `${env.API_URL}/api/v1/invoices/${editing._id}`
        : `${env.API_URL}/api/v1/invoices`;

      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Có lỗi xảy ra");
      }

      message.success(
        editing ? "Cập nhật hóa đơn thành công" : "Tạo hóa đơn thành công"
      );
      setOpenForm(false);
      setEditing(null);
      load(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      message.error(error.message || "Có lỗi xảy ra khi lưu hóa đơn");
    }
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
          <FileTextOutlined /> Quản lý hóa đơn
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
        >
          Thêm hóa đơn
        </Button>
      </div>

      <Table
        columns={invoicesColumns(
          (record) => {
            setEditing(record);
            setOpenForm(true);
          },
          handleDelete,
          (record) => {
            setDetailItem(record);
            setOpenDetail(true);
          }
        )}
        dataSource={items}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} hóa đơn`,
        }}
        onChange={(p) => load(p.current, p.pageSize)}
        bordered
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có dữ liệu hóa đơn" }}
      />

      <InvoicesForm
        open={openForm}
        item={editing}
        onCancel={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSave={handleSave}
        loading={loading}
      />

      <Drawer
        title={detailItem ? `Chi tiết hóa đơn` : "Chi tiết hóa đơn"}
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setDetailItem(null);
        }}
        width={680}
      >
        {detailItem && (
          <Descriptions column={1} bordered size="middle">
            {/* <Descriptions.Item label="ID">{detailItem._id}</Descriptions.Item> */}
            <Descriptions.Item label="Booking">
              {detailItem.bookingId?._id?.slice(0, 8)}... | Nhận:{" "}
              {detailItem.bookingId?.checkIn
                ? new Date(detailItem.bookingId.checkIn).toLocaleString("vi-VN")
                : "-"}{" "}
              | Trả:{" "}
              {detailItem.bookingId?.checkOut
                ? new Date(detailItem.bookingId.checkOut).toLocaleString(
                    "vi-VN"
                  )
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {detailItem.customerId?.fullName ||
                detailItem.bookingId?.guestInfo?.fullName ||
                detailItem.customerId?._id ||
                "-"}
              {(
                detailItem.customerId?.email ||
                detailItem.bookingId?.guestInfo?.email ||
                detailItem.bookingId?.guestInfo?.phoneNumber
              ) && (
                <div style={{ color: "#888", fontSize: 12 }}>
                  {detailItem.customerId?.email ||
                    detailItem.bookingId?.guestInfo?.email ||
                    detailItem.bookingId?.guestInfo?.phoneNumber}
                </div>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(detailItem.totalAmount)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  detailItem.status === "pending"
                    ? "orange"
                    : detailItem.status === "paid"
                    ? "green"
                    : detailItem.status === "failed"
                    ? "red"
                    : "blue"
                }
              >
                {detailItem.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phát hành">
              {detailItem.issuedAt
                ? new Date(detailItem.issuedAt).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
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
        <Button
          className="mt-4"
          type="primary"
          onClick={async () => {
            if (!detailItem?._id) return;

            try {
              // gọi API backend trực tiếp
              const res = await fetch(
                `http://localhost:8080/api/v1/invoices/${detailItem._id}/print`
              );

              if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to fetch PDF: ${text}`);
              }

              const blob = await res.blob();
              const url = URL.createObjectURL(blob);

              // mở PDF trong tab mới
              window.open(url, "_blank");

              // giải phóng bộ nhớ sau khi mở
              setTimeout(() => URL.revokeObjectURL(url), 10000);
            } catch (error) {
              console.error(error);
              alert("Lấy hóa đơn thất bại!");
            }
          }}
        >
          In hóa đơn
        </Button>
      </Drawer>
    </div>
  );
}
