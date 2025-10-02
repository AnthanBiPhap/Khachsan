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
import { AppstoreOutlined, PlusOutlined } from "@ant-design/icons";
import type { RoomType } from "../../types/room";
import {
  fetchRoomTypes,
  deleteRoomType,
} from "../../services/roomTypes.service";
import { env } from "../../constanst/getEnvs";
import { roomTypesColumns } from "../../components/RoomTypes/RoomTypesColumns";
import RoomTypesForm from "../../components/RoomTypes/RoomTypesForm";

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailItem, setDetailItem] = useState<RoomType | null>(null);

  const load = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await fetchRoomTypes(page, limit);
      const list = Array.isArray(res.data) ? res.data : [];
      setRoomTypes(list);
      setPagination({
        current: res.pagination?.page || 1,
        pageSize: res.pagination?.limit || 10,
        total: res.pagination?.totalRecord || 0,
      });
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách loại phòng");
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteRoomType(id);
      message.success("Đã xóa loại phòng thành công");
      load(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error("Xóa loại phòng thất bại");
    }
  };

  const handleSave = async (values: Partial<RoomType>) => {
    try {
      const url = editing
        ? `${env.API_URL}/api/v1/roomTypes/${editing._id}`
        : `${env.API_URL}/api/v1/roomTypes`;

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
        editing ? "Cập nhật loại phòng thành công" : "Tạo loại phòng thành công"
      );
      setOpenForm(false);
      setEditing(null);
      load(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("Error saving room type:", error);
      message.error(error.message || "Có lỗi xảy ra khi lưu loại phòng");
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
          <AppstoreOutlined /> Quản lý loại phòng
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
        >
          Thêm loại phòng
        </Button>
      </div>

      <Table
        columns={roomTypesColumns(
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
        dataSource={roomTypes}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} loại phòng`,
        }}
        onChange={(p) => load(p.current, p.pageSize)}
        bordered
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có dữ liệu loại phòng" }}
      />

      <RoomTypesForm
        open={openForm}
        roomType={editing}
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
            ? `Chi tiết loại phòng: ${detailItem.name}`
            : "Chi tiết loại phòng"
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
            <Descriptions.Item label="Tên loại phòng">
              {detailItem.name}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {detailItem.description || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá / đêm">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(detailItem.pricePerNight)}
            </Descriptions.Item>
            <Descriptions.Item label="Sức chứa">
              {detailItem.capacity}
            </Descriptions.Item>
            <Descriptions.Item label="Tiện nghi">
              <Space wrap>
                {(detailItem.amenities || []).length
                  ? (detailItem.amenities || []).map((a) => (
                      <Tag key={a}>{a}</Tag>
                    ))
                  : "-"}
              </Space>
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
