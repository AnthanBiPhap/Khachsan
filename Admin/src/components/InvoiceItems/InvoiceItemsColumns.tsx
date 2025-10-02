import { Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { InvoiceItemEntry } from "../../types/invoiceItem";

export const invoiceItemsColumns = (
  handleEdit: (record: InvoiceItemEntry) => void,
  handleDelete: (id: string) => void,
  handleDetail?: (record: InvoiceItemEntry) => void
): ColumnsType<InvoiceItemEntry> => [
  {
    title: "Hóa đơn",
    key: "invoice",
    render: (_, r) => {
      const content = (
        <div>
          <div>Mã: {r.invoiceId?._id?.slice(0,8)}...</div>
          <div style={{ color: '#888', fontSize: 12 }}>Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.invoiceId?.totalAmount || 0)}</div>
          <div style={{ color: '#888', fontSize: 12 }}>TT: {r.invoiceId?.status}</div>
        </div>
      );
      return handleDetail ? <a onClick={() => handleDetail(r)}>{content}</a> : content;
    }
  },
  {
    title: "Loại",
    dataIndex: "itemType",
    key: "itemType",
    render: (t: string) => {
      const map: Record<string, { color: string; text: string }> = {
        room: { color: 'geekblue', text: 'Phòng' },
        service: { color: 'green', text: 'Dịch vụ' },
        late_fee: { color: 'orange', text: 'Phí trễ' },
        other: { color: 'default', text: 'Khác' },
      };
      const v = map[t] || { color: 'default', text: t };
      return <Tag color={v.color}>{v.text}</Tag>;
    }
  },
  {
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Số tiền",
    key: "amount",
    render: (_, r) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.amount),
  },
  {
    title: "Thao tác",
    key: "actions",
    render: (_, r) => (
      <Space>
        <a onClick={() => handleEdit(r)}>Chỉnh sửa</a>
        <a onClick={() => handleDelete(r._id)}>Xóa</a>
        <a onClick={() => handleDetail?.(r)}>Chi tiết</a>
      </Space>
    )
  }
];
