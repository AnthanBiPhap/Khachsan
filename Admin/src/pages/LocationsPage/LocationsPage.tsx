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
import { EnvironmentOutlined, PlusOutlined } from "@ant-design/icons";
import type { LocationItem } from "../../types/location";
import {
  fetchLocations,
  deleteLocation,
} from "../../services/locations.service";
import { env } from "../../constanst/getEnvs";
import { locationsColumns } from "../../components/Locations/LocationsColumns";
import LocationsForm from "../../components/Locations/LocationsForm";
import LocationSearchFilter from "../../components/Locations/LocationSearchFilter";
import LocationStatistics from "../../components/Locations/LocationStatistics";

export default function LocationsPage() {
  const [items, setItems] = useState<LocationItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<LocationItem | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailItem, setDetailItem] = useState<LocationItem | null>(null);
  
  // Search và Filter states
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");
  
  // Statistics state
  const [statistics, setStatistics] = useState({
    totalLocations: 0,
    activeLocations: 0,
    hiddenLocations: 0,
    deletedLocations: 0,
    averageRating: 0,
    topRatedCount: 0,
  });

  const load = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await fetchLocations(page, limit);
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
      setFilteredItems(list);
      setPagination({
        current: res.pagination?.page || 1,
        pageSize: res.pagination?.limit || 10,
        total: res.pagination?.totalRecord || 0,
      });
      
      // Calculate statistics
      calculateStatistics(list);
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách địa điểm");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Calculate statistics function
  const calculateStatistics = (data: LocationItem[]) => {
    const totalLocations = data.length;
    const activeLocations = data.filter(item => item.status === 'active').length;
    const hiddenLocations = data.filter(item => item.status === 'hidden').length;
    const deletedLocations = data.filter(item => item.status === 'deleted').length;
    
    const locationsWithRating = data.filter(item => item.ratingAvg && item.ratingAvg > 0);
    const averageRating = locationsWithRating.length > 0 
      ? locationsWithRating.reduce((sum, item) => sum + (item.ratingAvg || 0), 0) / locationsWithRating.length
      : 0;
    
    const topRatedCount = data.filter(item => item.ratingAvg && item.ratingAvg >= 5).length;
    
    setStatistics({
      totalLocations,
      activeLocations,
      hiddenLocations,
      deletedLocations,
      averageRating,
      topRatedCount,
    });
  };

  // Filter locations based on search and filter criteria
  useEffect(() => {
    let filtered = [...items];

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(location =>
        location.name?.toLowerCase().includes(searchLower) ||
        location.address?.toLowerCase().includes(searchLower) ||
        location.description?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(location => location.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(location => location.status === filterStatus);
    }

    // Rating filter
    if (filterRating !== 'all') {
      const minRating = parseFloat(filterRating);
      filtered = filtered.filter(location => 
        location.ratingAvg && location.ratingAvg >= minRating
      );
    }

    setFilteredItems(filtered);
  }, [items, searchText, filterType, filterStatus, filterRating]);

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation(id);
      message.success("Đã xóa địa điểm thành công");
      load(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error("Xóa địa điểm thất bại");
    }
  };

  const handleSave = async (values: Partial<LocationItem>) => {
    try {
      const url = editing
        ? `${env.API_URL}/api/v1/locations/${editing._id}`
        : `${env.API_URL}/api/v1/locations`;

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
        editing ? "Cập nhật địa điểm thành công" : "Tạo địa điểm thành công"
      );
      setOpenForm(false);
      setEditing(null);
      load(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("Error saving location:", error);
      message.error(error.message || "Có lỗi xảy ra khi lưu địa điểm");
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
          <EnvironmentOutlined /> Quản lý địa điểm
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
        >
          Thêm địa điểm
        </Button>
      </div>

      {/* Statistics */}
      <LocationStatistics
        totalLocations={statistics.totalLocations}
        activeLocations={statistics.activeLocations}
        hiddenLocations={statistics.hiddenLocations}
        deletedLocations={statistics.deletedLocations}
        averageRating={statistics.averageRating}
        topRatedCount={statistics.topRatedCount}
      />

      {/* Search và Filter */}
      <LocationSearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        filterType={filterType}
        onTypeChange={setFilterType}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterRating={filterRating}
        onRatingChange={setFilterRating}
        onClearFilters={() => {
          setSearchText("");
          setFilterType("all");
          setFilterStatus("all");
          setFilterRating("all");
        }}
        totalCount={items.length}
        filteredCount={filteredItems.length}
      />

      <Table
        columns={locationsColumns(
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
          showTotal: (total) => `Tổng ${total} địa điểm`,
        }}
        onChange={(p) => load(p.current, p.pageSize)}
        bordered
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có dữ liệu địa điểm" }}
      />

      <LocationsForm
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
        title={
          detailItem
            ? `Chi tiết địa điểm: ${detailItem.name}`
            : "Chi tiết địa điểm"
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
            <Descriptions.Item label="Tên địa điểm">
              {detailItem.name}
            </Descriptions.Item>
            <Descriptions.Item label="Loại">
              <Tag>{detailItem.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {detailItem.description || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {detailItem.address || "-"}
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
            <Descriptions.Item label="Điểm">
              {detailItem.ratingAvg ?? "-"}
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
                ? new Date(detailItem.createdAt as any).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật">
              {detailItem.updatedAt
                ? new Date(detailItem.updatedAt as any).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
