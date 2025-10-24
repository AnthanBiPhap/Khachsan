import {
  Table,
  Typography,
  message,
  Button,
  Drawer,
  Descriptions,
  Space,
  Tag,
  Image,
} from "antd";
import { useEffect, useState } from "react";
import { ToolOutlined, PlusOutlined } from "@ant-design/icons";
import type { ServiceItem } from "../../types/service";
import { fetchServices, deleteService } from "../../services/services.service";
import { env } from "../../constanst/getEnvs";
import { servicesColumns } from "../../components/Services/ServicesColumns";
import ServicesForm from "../../components/Services/ServicesForm";
import ServiceSearchFilter from "../../components/Services/ServiceSearchFilter";

export default function ServicesPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailItem, setDetailItem] = useState<ServiceItem | null>(null);
  
  // Search và Filter states
  const [searchText, setSearchText] = useState("");
  const [filterPrice, setFilterPrice] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const load = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await fetchServices(page, limit);
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
      setFilteredItems(list);
      setPagination({
        current: res.pagination?.page || 1,
        pageSize: res.pagination?.limit || 10,
        total: res.pagination?.total || 0,
      });
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách dịch vụ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter services based on search and filter criteria
  useEffect(() => {
    let filtered = [...items];

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(service =>
        service.name?.toLowerCase().includes(searchLower) ||
        service.description?.toLowerCase().includes(searchLower)
      );
    }

    // Price filter
    if (filterPrice !== 'all') {
      filtered = filtered.filter(service => {
        const price = service.basePrice || 0;
        switch (filterPrice) {
          case 'under100k':
            return price < 100000;
          case '100k-500k':
            return price >= 100000 && price <= 500000;
          case '500k-1m':
            return price >= 500000 && price <= 1000000;
          case 'over1m':
            return price > 1000000;
          default:
            return true;
        }
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(service => service.status === filterStatus);
    }

    setFilteredItems(filtered);
  }, [items, searchText, filterPrice, filterStatus]);

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      message.success("Đã xóa dịch vụ thành công");
      load(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error("Xóa dịch vụ thất bại");
    }
  };

  const handleSave = async (values: Partial<ServiceItem>) => {
    try {
      const url = editing
        ? `${env.API_URL}/api/v1/services/${editing._id}`
        : `${env.API_URL}/api/v1/services`;

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
        editing ? "Cập nhật dịch vụ thành công" : "Tạo dịch vụ thành công"
      );
      setOpenForm(false);
      setEditing(null);
      load(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("Error saving service:", error);
      message.error(error.message || "Có lỗi xảy ra khi lưu dịch vụ");
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
          <ToolOutlined /> Quản lý dịch vụ
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
        >
          Thêm dịch vụ
        </Button>
      </div>

      {/* Search và Filter */}
      <ServiceSearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        filterPrice={filterPrice}
        onPriceChange={setFilterPrice}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        onClearFilters={() => {
          setSearchText("");
          setFilterPrice("all");
          setFilterStatus("all");
        }}
        totalCount={items.length}
        filteredCount={filteredItems.length}
      />

      <Table
        columns={servicesColumns(
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
          showTotal: (total) => `Tổng ${total} dịch vụ`,
        }}
        onChange={(p) => load(p.current, p.pageSize)}
        bordered
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có dữ liệu dịch vụ" }}
      />

      <ServicesForm
        open={openForm}
        service={editing}
        onCancel={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSave={handleSave}
        loading={loading}
      />

      <Drawer
        title={
          detailItem
            ? `Chi tiết dịch vụ: ${detailItem.name}`
            : "Chi tiết dịch vụ"
        }
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
            <Descriptions.Item label="Tên dịch vụ">
              {detailItem.name}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {detailItem.description || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá cơ bản">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(detailItem.basePrice)}
            </Descriptions.Item>
            <Descriptions.Item label="Giờ hoạt động">
              {detailItem.workingHours ? (
                <Tag color="green">
                  từ {detailItem.workingHours.startTime} đến {detailItem.workingHours.endTime}
                </Tag>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ảnh">
              <Space wrap>
                {(detailItem.images || []).length
                  ? (detailItem.images || []).map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        width={80}
                        height={60}
                        style={{ objectFit: "cover" }}
                      />
                    ))
                  : "-"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  detailItem.status === "active"
                    ? "green"
                    : detailItem.status === "hidden"
                    ? "orange"
                    : "red"
                }
              >
                {detailItem.status}
              </Tag>
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
      </Drawer>
    </div>
  );
}
