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
  Col
} from "antd";
import { useEffect, useState } from "react";
import { HomeOutlined, PlusOutlined } from "@ant-design/icons";
import type { Room } from "../../types/room";
import { fetchRooms, deleteRoom } from "../../services/rooms.service";
import { env } from "../../constanst/getEnvs";
import { roomsColumns } from "../../components/Rooms/RoomsColumns";
import RoomsForm from "../../components/Rooms/RoomsForm";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
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

  const loadRooms = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await fetchRooms(page, limit);
      const list = Array.isArray(res.data) ? res.data : [];
      setRooms(list);
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
      </div>

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
          }
        )}
        dataSource={rooms}
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
                      : detailItem.status === "occupied"
                      ? "blue"
                      : detailItem.status === "maintenance"
                      ? "orange"
                      : "red"
                  }
                >
                  {detailItem.status === "available"
                    ? "Sẵn sàng"
                    : detailItem.status === "occupied"
                    ? "Đang sử dụng"
                    : detailItem.status === "maintenance"
                    ? "Bảo trì"
                    : "Không khả dụng"}
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
