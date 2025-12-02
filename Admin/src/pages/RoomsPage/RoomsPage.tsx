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
  Row,
  Col,
  Card,
  DatePicker,
  List,
  Empty,
  Spin
} from "antd";
import { useEffect, useState } from "react";
import { HomeOutlined, PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import type { Room } from "../../types/room";
import { fetchRooms, deleteRoom, getAvailableRooms } from "../../services/rooms.service";
import { env } from "../../constanst/getEnvs";
import { roomsColumns } from "../../components/Rooms/RoomsColumns";
import RoomsForm from "../../components/Rooms/RoomsForm";
import RoomSearchFilter from "../../components/Rooms/RoomSearchFilter";
import { useAuthStore } from "../../stores/authStore";
import type { Dayjs } from "dayjs";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openForm, setOpenForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailItem, setDetailItem] = useState<Room | null>(null);
  
  // Search và Filter states
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const user = useAuthStore.getState().user;
  const isStaff = user?.role === 'staff';
  
  // Available rooms states
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingAvailableRooms, setLoadingAvailableRooms] = useState(false);

  const loadRooms = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await fetchRooms(page, limit);
      const list = Array.isArray(res.data) ? res.data : [];
      setRooms(list);
      setFilteredRooms(list);
      setPagination({
        current: res.pagination?.page || 1,
        pageSize: res.pagination?.limit || 10,
        total: res.pagination?.total || 0,
      });
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách phòng");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Filter rooms based on search and filter criteria
  useEffect(() => {
    let filtered = [...rooms];

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(room =>
        room.roomNumber?.toLowerCase().includes(searchLower) ||
        room.typeId?.name?.toLowerCase().includes(searchLower) ||
        (room as any).description?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(room => room.typeId?._id === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(room => {
        // Giả sử có field status trong Room type
        const roomStatus = (room as any).status || 'available';
        return roomStatus === filterStatus;
      });
    }

    setFilteredRooms(filtered);
  }, [rooms, searchText, filterType, filterStatus]);

  // Function để tìm phòng trống trong khoảng thời gian
  const handleSearchAvailableRooms = async () => {
    if (!dateRange[0] || !dateRange[1]) {
      message.warning("Vui lòng chọn khoảng thời gian");
      return;
    }

    setLoadingAvailableRooms(true);
    try {
      const checkIn = dateRange[0].hour(14).minute(0).second(0).toISOString();
      const checkOut = dateRange[1].hour(12).minute(0).second(0).toISOString();
      const rooms = await getAvailableRooms(checkIn, checkOut, 0);
      setAvailableRooms(rooms);
      if (rooms.length === 0) {
        message.info("Không có phòng trống trong khoảng thời gian này");
      } else {
        message.success(`Tìm thấy ${rooms.length} phòng trống`);
      }
    } catch (error: any) {
      console.error("Error fetching available rooms:", error);
      message.error(error.message || "Không thể tải danh sách phòng trống");
      setAvailableRooms([]);
    } finally {
      setLoadingAvailableRooms(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRoom(id);
      message.success("Đã xóa phòng thành công");
      loadRooms(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error("Xóa phòng thất bại");
    }
  };

  const handleSave = async (values: Partial<Room>) => {
    try {
      const url = editingRoom
        ? `${env.API_URL}/api/v1/rooms/${editingRoom._id}`
        : `${env.API_URL}/api/v1/rooms`;

      const method = editingRoom ? "PUT" : "POST";

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
        editingRoom ? "Cập nhật phòng thành công" : "Tạo phòng thành công"
      );
      setOpenForm(false);
      setEditingRoom(null);
      loadRooms(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("Error saving room:", error);
      message.error(error.message || "Có lỗi xảy ra khi lưu phòng");
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
          <HomeOutlined /> Quản lý phòng
        </Typography.Title>
        {!isStaff && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRoom(null);
              setOpenForm(true);
            }}
          >
            Thêm phòng
          </Button>
        )}
      </div>

      {/* Search và Filter */}
      <RoomSearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        filterType={filterType}
        onTypeChange={setFilterType}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        onClearFilters={() => {
          setSearchText("");
          setFilterType("all");
          setFilterStatus("all");
        }}
        totalCount={rooms.length}
        filteredCount={filteredRooms.length}
      />

      {/* Tìm phòng trống trong khoảng thời gian */}
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>Tìm phòng trống theo khoảng thời gian</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              onClick={handleSearchAvailableRooms}
              loading={loadingAvailableRooms}
              icon={<CalendarOutlined />}
            >
              Tìm kiếm
            </Button>
            {dateRange[0] && dateRange[1] && (
              <Button
                onClick={() => {
                  setDateRange([null, null]);
                  setAvailableRooms([]);
                }}
              >
                Xóa
              </Button>
            )}
          </Space>

          {loadingAvailableRooms && (
            <div style={{ textAlign: "center", padding: 20 }}>
              <Spin size="large" />
            </div>
          )}

          {!loadingAvailableRooms && availableRooms.length > 0 && (
            <div>
              <Typography.Text strong style={{ fontSize: 16, marginBottom: 12, display: "block" }}>
                Tìm thấy {availableRooms.length} phòng trống:
              </Typography.Text>
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                dataSource={availableRooms}
                renderItem={(room) => (
                  <List.Item>
                    <Card
                      size="small"
                      hoverable
                      onClick={() => {
                        setDetailItem(room);
                        setOpenDetail(true);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Typography.Text strong style={{ fontSize: 16 }}>
                          Phòng {room.roomNumber}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {room.typeId?.name || (room.typeId as any)?.name || "-"}
                        </Typography.Text>
                        {room.typeId && (room.typeId as any).capacity && (
                          <Typography.Text>
                            Sức chứa: {(room.typeId as any).capacity} người
                          </Typography.Text>
                        )}
                        {room.typeId && (room.typeId as any).pricePerNight && (
                          <Typography.Text strong style={{ color: "#1890ff" }}>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format((room.typeId as any).pricePerNight)}
                            /đêm
                          </Typography.Text>
                        )}
                        <Tag color="green">Sẵn sàng</Tag>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          )}

          {!loadingAvailableRooms && dateRange[0] && dateRange[1] && availableRooms.length === 0 && (
            <Empty
              description="Không có phòng trống trong khoảng thời gian này"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Space>
      </Card>

      <Table
        columns={roomsColumns(
          (record) => {
            setEditingRoom(record);
            setOpenForm(true);
          },
          handleDelete,
          (record) => {
            setDetailItem(record);
            setOpenDetail(true);
          },
          !isStaff
        )}
        dataSource={filteredRooms}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} phòng`,
        }}
        onChange={(p) => loadRooms(p.current, p.pageSize)}
        bordered
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có dữ liệu phòng" }}
      />

      {!isStaff && (
        <RoomsForm
          open={openForm}
          room={editingRoom}
          onCancel={() => {
            setOpenForm(false);
            setEditingRoom(null);
          }}
          onSave={handleSave}
          loading={loading}
        />
      )}

      <Drawer
        title={
          detailItem
            ? `Chi tiết phòng: ${detailItem.roomNumber}`  
            : "Chi tiết phòng"
        }
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setDetailItem(null);
        }}
        width={720}
      >
        {detailItem && (
          <div style={{ padding: '16px 0' }}>
            {/* Phần hình ảnh */}
            {(detailItem.images && detailItem.images.length > 0) && (
              <div style={{ marginBottom: 24 }}>
                <h3>Hình ảnh phòng</h3>
                <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                  {detailItem.images.map((img, index) => (
                    <Col key={index} xs={24} sm={12} md={8} lg={6}>
                      <Image
                        src={img}
                        alt={`Hình ảnh ${index + 1}`}
                        style={{ 
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                        preview={{
                          src: img,
                          mask: 'Xem ảnh',
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* Thông tin chi tiết */}
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Số phòng">
                {detailItem.roomNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Loại phòng">
                {detailItem.typeId?.name ||
                  (detailItem.typeId as any)?.name ||
                  "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Giá / đêm">
                {detailItem.typeId &&
                (detailItem.typeId as any).pricePerNight !== undefined
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format((detailItem.typeId as any).pricePerNight)
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Sức chứa">
                {detailItem.typeId?.capacity || 
                 (detailItem.typeId as any)?.capacity ||
                 "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={
                    detailItem.status === "available"
                      ? "green"
                      : detailItem.status === "maintenance"
                      ? "orange"
                      : detailItem.status === "unavailable"
                      ? "red"
                      : "default"
                  }
                >
                  {detailItem.status === "available"
                    ? "Sẵn sàng"
                    : detailItem.status === "maintenance"
                    ? "Bảo trì"
                    : detailItem.status === "unavailable"
                    ? "Không khả dụng"
                    : detailItem.status || "-"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tiện nghi">
                <Space wrap>
                  {(detailItem.amenities && detailItem.amenities.length > 0)
                    ? detailItem.amenities.map((a, i) => (
                        <Tag key={i} color="blue">{a}</Tag>
                      ))
                    : "-"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {detailItem.createdAt
                  ? new Date(detailItem.createdAt as any).toLocaleString("vi-VN")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {detailItem.updatedAt
                  ? new Date(detailItem.updatedAt as any).toLocaleString("vi-VN")
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
}
