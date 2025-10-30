import {
  Table,
  Typography,
  message,
  Button,
  Drawer,
  Descriptions,
  Tag,
} from "antd";
import { useEffect, useState, useCallback, useRef } from "react";
import { FileTextOutlined } from "@ant-design/icons";
import type { InvoiceItem } from "../../types/invoice";
import { fetchInvoices, deleteInvoice } from "../../services/invoices.service";
import { env } from "../../constanst/getEnvs";
import { invoicesColumns } from "../../components/Invoices/InvoicesColumns";
import InvoicesForm from "../../components/Invoices/InvoicesForm";
import InvoiceSearchFilter from "../../components/Invoices/InvoiceSearchFilter";
import InvoiceStatistics from "../../components/Invoices/InvoiceStatistics";

export default function InvoicesPage() {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const paginationRef = useRef(pagination);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<InvoiceItem | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailItem, setDetailItem] = useState<InvoiceItem | null>(null);
  
  // Search và Filter states
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterAmount, setFilterAmount] = useState<string>("all");
  
  // Statistics state
  const [statistics, setStatistics] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    failedInvoices: 0,
    refundedInvoices: 0,
    totalRevenue: 0,
  });

  const load = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await fetchInvoices(page, limit);
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
      setFilteredItems(list);
      const newPagination = {
        current: res.pagination?.page || 1,
        pageSize: res.pagination?.limit || 10,
        total: res.pagination?.total || 0,
      };
      setPagination(newPagination);
      paginationRef.current = newPagination;
      
      // Calculate statistics
      calculateStatistics(list);
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách hóa đơn");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    
    // Lắng nghe event booking được update để refresh invoice
    const handleBookingUpdate = () => {
      console.log('🔄 Booking updated, refreshing invoices...');
      load(paginationRef.current.current, paginationRef.current.pageSize);
    };
    
    window.addEventListener('bookingUpdated', handleBookingUpdate);
    
    return () => {
      window.removeEventListener('bookingUpdated', handleBookingUpdate);
    };
  }, [load]);

  // Calculate statistics function
  const calculateStatistics = (data: InvoiceItem[]) => {
    const totalInvoices = data.length;
    const paidInvoices = data.filter(item => item.status === 'paid').length;
    const pendingInvoices = data.filter(item => item.status === 'pending').length;
    const failedInvoices = data.filter(item => item.status === 'failed').length;
    const refundedInvoices = data.filter(item => item.status === 'refunded').length;
    
    const totalRevenue = data
      .filter(item => item.status === 'paid')
      .reduce((sum, item) => sum + item.totalAmount, 0);
    
    setStatistics({
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      failedInvoices,
      refundedInvoices,
      totalRevenue,
    });
  };

  // Filter invoices based on search and filter criteria
  useEffect(() => {
    let filtered = [...items];

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(invoice => {
        const customerName = invoice.customerId?.fullName || '';
        const bookingId = invoice.bookingId?._id || '';
        const guestName = invoice.bookingId?.guestInfo?.fullName || '';
        const walkInGuestName = invoice.bookingId?.guests?.find(g => g.isMainGuest)?.fullName || '';
        
        return customerName.toLowerCase().includes(searchLower) ||
               bookingId.toLowerCase().includes(searchLower) ||
               guestName.toLowerCase().includes(searchLower) ||
               walkInGuestName.toLowerCase().includes(searchLower);
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus);
    }

    // Source filter
    if (filterSource !== 'all') {
      filtered = filtered.filter(invoice => invoice.bookingId?.source === filterSource);
    }

    // Amount filter
    if (filterAmount !== 'all') {
      filtered = filtered.filter(invoice => {
        const amount = invoice.totalAmount;
        switch (filterAmount) {
          case 'under1m':
            return amount < 1000000;
          case '1m-5m':
            return amount >= 1000000 && amount <= 5000000;
          case '5m-10m':
            return amount >= 5000000 && amount <= 10000000;
          case 'over10m':
            return amount > 10000000;
          default:
            return true;
        }
      });
    }

    setFilteredItems(filtered);
  }, [items, searchText, filterStatus, filterSource, filterAmount]);

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
    } catch (error: unknown) {
      console.error("Error saving invoice:", error);
      message.error((error as Error)?.message || "Có lỗi xảy ra khi lưu hóa đơn");
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
        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
        >
          Thêm hóa đơn
        </Button> */}
      </div>

      {/* Statistics */}
      <InvoiceStatistics
        totalInvoices={statistics.totalInvoices}
        paidInvoices={statistics.paidInvoices}
        pendingInvoices={statistics.pendingInvoices}
        failedInvoices={statistics.failedInvoices}
        refundedInvoices={statistics.refundedInvoices}
        totalRevenue={statistics.totalRevenue}
      />

      {/* Search và Filter */}
      <InvoiceSearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterSource={filterSource}
        onSourceChange={setFilterSource}
        filterAmount={filterAmount}
        onAmountChange={setFilterAmount}
        onClearFilters={() => {
          setSearchText("");
          setFilterStatus("all");
          setFilterSource("all");
          setFilterAmount("all");
        }}
        totalCount={items.length}
        filteredCount={filteredItems.length}
      />

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
        dataSource={filteredItems}
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
              {(() => {
                // Logic mới với mảng guests
                let customerName = "-";
                let customerContact = "";
                
                if (detailItem.customerId?.fullName) {
                  // Khách hàng online
                  customerName = detailItem.customerId.fullName;
                  customerContact = detailItem.customerId.email || detailItem.customerId.phoneNumber || "";
                } else if (detailItem.bookingId?.guests && detailItem.bookingId.guests.length > 0) {
                  // Khách hàng walk_in - lấy tên khách chính
                  const mainGuest = detailItem.bookingId.guests.find((guest) => guest.isMainGuest) || detailItem.bookingId.guests[0];
                  customerName = mainGuest?.fullName || "-";
                  customerContact = mainGuest?.phoneNumber || mainGuest?.email || "";
                } else if (detailItem.bookingId?.guestInfo?.fullName) {
                  // Fallback cho dữ liệu cũ
                  customerName = detailItem.bookingId.guestInfo.fullName;
                  customerContact = detailItem.bookingId.guestInfo.phoneNumber || detailItem.bookingId.guestInfo.email || "";
                }
                
                return (
                  <div>
                    <div>{customerName}</div>
                    {customerContact && (
                      <div style={{ color: "#888", fontSize: 12 }}>
                        {customerContact}
                      </div>
                    )}
                  </div>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(detailItem.totalAmount)}
            </Descriptions.Item>
            {detailItem.paidAmount !== undefined && detailItem.remainingAmount !== undefined && (
              <>
                <Descriptions.Item label="Đã thanh toán">
                  <Typography.Text strong style={{ color: '#52c41a' }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(detailItem.paidAmount)}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Còn lại">
                  <Typography.Text strong style={{ color: '#fa8c16' }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(detailItem.remainingAmount)}
                  </Typography.Text>
                </Descriptions.Item>
              </>
            )}
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
            {detailItem.paymentStatus && (
              <Descriptions.Item label="Trạng thái thanh toán">
                <Tag
                  color={
                    detailItem.paymentStatus === "pending"
                      ? "orange"
                      : detailItem.paymentStatus === "partial_paid"
                      ? "blue"
                      : detailItem.paymentStatus === "paid"
                      ? "green"
                      : detailItem.paymentStatus === "failed"
                      ? "red"
                      : "blue"
                  }
                >
                  {detailItem.paymentStatus === "partial_paid" ? "Thanh toán 50%" : 
                   detailItem.paymentStatus === "paid" ? "Đã thanh toán đủ" :
                   detailItem.paymentStatus === "pending" ? "Chờ thanh toán" :
                   detailItem.paymentStatus}
                </Tag>
              </Descriptions.Item>
            )}
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
