import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Space,
  Row,
  Col,
  Tag,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import {
  InfoCircleOutlined,
  SaveOutlined,
  ReloadOutlined,
  PictureOutlined,
  StarOutlined,
  TeamOutlined,
  BulbOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  getAboutInfo,
  updateAboutInfo,
  type AboutInfo,
} from "../../services/aboutInfo.service";

const { TextArea } = Input;
const { Title } = Typography;

export default function AboutInfoPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [aboutInfo, setAboutInfo] = useState<AboutInfo | null>(null);

  const loadAboutInfo = async () => {
    try {
      setLoading(true);
      const info = await getAboutInfo();
      setAboutInfo(info);
      form.setFieldsValue({
        heroTitle: info.heroTitle,
        heroDescription: info.heroDescription,
        heroImage: info.heroImage,
        "stats.yearsExperience.number": info.stats.yearsExperience.number,
        "stats.yearsExperience.label": info.stats.yearsExperience.label,
        "stats.rooms.number": info.stats.rooms.number,
        "stats.rooms.label": info.stats.rooms.label,
        "stats.satisfiedCustomers.number": info.stats.satisfiedCustomers.number,
        "stats.satisfiedCustomers.label": info.stats.satisfiedCustomers.label,
        "stats.averageRating.number": info.stats.averageRating.number,
        "stats.averageRating.label": info.stats.averageRating.label,
        "introduction.title": info.introduction.title,
        "introduction.description": info.introduction.description,
        "story.title": info.story.title,
        "story.paragraph1": info.story.paragraph1,
        "story.paragraph2": info.story.paragraph2,
        "story.image": info.story.image,
        "mission.title": info.mission.title,
        "mission.description": info.mission.description,
        "vision.title": info.vision.title,
        "vision.description": info.vision.description,
        "team.title": info.team.title,
        "team.description": info.team.description,
      });
    } catch (error: any) {
      console.error("Error loading about info:", error);
      message.error("Không thể tải thông tin về chúng tôi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAboutInfo();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const payload: any = {};

      if (values.heroTitle && values.heroTitle.trim()) {
        payload.heroTitle = values.heroTitle.trim();
      }
      if (values.heroDescription && values.heroDescription.trim()) {
        payload.heroDescription = values.heroDescription.trim();
      }
      if (values.heroImage && values.heroImage.trim()) {
        payload.heroImage = values.heroImage.trim();
      }

      // Stats
      const stats: any = {};
      if (values["stats.yearsExperience.number"]?.trim()) {
        stats.yearsExperience = {
          number: values["stats.yearsExperience.number"].trim(),
          label: values["stats.yearsExperience.label"]?.trim() || aboutInfo?.stats.yearsExperience.label,
        };
      }
      if (values["stats.rooms.number"]?.trim()) {
        stats.rooms = {
          number: values["stats.rooms.number"].trim(),
          label: values["stats.rooms.label"]?.trim() || aboutInfo?.stats.rooms.label,
        };
      }
      if (values["stats.satisfiedCustomers.number"]?.trim()) {
        stats.satisfiedCustomers = {
          number: values["stats.satisfiedCustomers.number"].trim(),
          label: values["stats.satisfiedCustomers.label"]?.trim() || aboutInfo?.stats.satisfiedCustomers.label,
        };
      }
      if (values["stats.averageRating.number"]?.trim()) {
        stats.averageRating = {
          number: values["stats.averageRating.number"].trim(),
          label: values["stats.averageRating.label"]?.trim() || aboutInfo?.stats.averageRating.label,
        };
      }
      if (Object.keys(stats).length > 0) {
        payload.stats = stats;
      }

      // Introduction
      if (values["introduction.title"]?.trim() || values["introduction.description"]?.trim()) {
        payload.introduction = {};
        if (values["introduction.title"]?.trim()) {
          payload.introduction.title = values["introduction.title"].trim();
        }
        if (values["introduction.description"]?.trim()) {
          payload.introduction.description = values["introduction.description"].trim();
        }
      }

      // Story
      if (
        values["story.title"]?.trim() ||
        values["story.paragraph1"]?.trim() ||
        values["story.paragraph2"]?.trim() ||
        values["story.image"]?.trim()
      ) {
        payload.story = {};
        if (values["story.title"]?.trim()) {
          payload.story.title = values["story.title"].trim();
        }
        if (values["story.paragraph1"]?.trim()) {
          payload.story.paragraph1 = values["story.paragraph1"].trim();
        }
        if (values["story.paragraph2"]?.trim()) {
          payload.story.paragraph2 = values["story.paragraph2"].trim();
        }
        if (values["story.image"]?.trim()) {
          payload.story.image = values["story.image"].trim();
        }
      }

      // Mission
      if (values["mission.title"]?.trim() || values["mission.description"]?.trim()) {
        payload.mission = {};
        if (values["mission.title"]?.trim()) {
          payload.mission.title = values["mission.title"].trim();
        }
        if (values["mission.description"]?.trim()) {
          payload.mission.description = values["mission.description"].trim();
        }
      }

      // Vision
      if (values["vision.title"]?.trim() || values["vision.description"]?.trim()) {
        payload.vision = {};
        if (values["vision.title"]?.trim()) {
          payload.vision.title = values["vision.title"].trim();
        }
        if (values["vision.description"]?.trim()) {
          payload.vision.description = values["vision.description"].trim();
        }
      }

      // Features
      if (values.features !== undefined && Array.isArray(values.features)) {
        payload.features = values.features.filter(
          (f: any) => f && (f.title?.trim() || f.description?.trim() || f.icon?.trim())
        );
      }

      // Team
      const teamData: any = {};
      if (values["team.title"]?.trim() || values["team.description"]?.trim()) {
        if (values["team.title"]?.trim()) {
          teamData.title = values["team.title"].trim();
        }
        if (values["team.description"]?.trim()) {
          teamData.description = values["team.description"].trim();
        }
      }

      // Team Members
      if (values["team.members"] !== undefined && Array.isArray(values["team.members"])) {
        teamData.members = values["team.members"].filter(
          (m: any) => m && (m.name?.trim() || m.position?.trim() || m.email?.trim())
        );
      }

      if (Object.keys(teamData).length > 0) {
        payload.team = teamData;
      }

      if (Object.keys(payload).length === 0) {
        message.warning("Vui lòng nhập ít nhất một trường để cập nhật");
        return;
      }

      await updateAboutInfo(payload);
      message.success("Cập nhật thông tin về chúng tôi thành công");
      loadAboutInfo();
    } catch (error: any) {
      console.error("Error updating about info:", error);
      message.error(error.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Space align="center">
          <InfoCircleOutlined style={{ fontSize: 24, color: "#1890ff" }} />
          <Title level={3} style={{ margin: 0 }}>
            Quản lý thông tin về chúng tôi
          </Title>
        </Space>
      </Card>

      <Form form={form} layout="vertical" onFinish={handleSubmit} loading={loading}>
        <Row gutter={[16, 16]}>
          {/* Hero Section */}
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <PictureOutlined style={{ color: "#1890ff" }} />
                  <span>Hero Section</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Form.Item name="heroTitle" label="Tiêu đề Hero">
                <Input placeholder="Về Chúng Tôi" size="large" />
              </Form.Item>
              <Form.Item name="heroDescription" label="Mô tả Hero">
                <Input
                  placeholder="Khám phá câu chuyện và giá trị của Miko Hotel"
                  size="large"
                />
              </Form.Item>
              <Form.Item name="heroImage" label="URL Ảnh Hero">
                <Input
                  placeholder="https://example.com/image.jpg"
                  size="large"
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Stats */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <StarOutlined style={{ color: "#faad14" }} />
                  <span>Thống kê - Năm kinh nghiệm</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                height: "100%",
              }}
            >
              <Form.Item
                name="stats.yearsExperience.number"
                label="Số lượng"
              >
                <Input placeholder="10+" size="large" />
              </Form.Item>
              <Form.Item name="stats.yearsExperience.label" label="Nhãn">
                <Input placeholder="Năm kinh nghiệm" size="large" />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <StarOutlined style={{ color: "#52c41a" }} />
                  <span>Thống kê - Phòng nghỉ</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                height: "100%",
              }}
            >
              <Form.Item name="stats.rooms.number" label="Số lượng">
                <Input placeholder="50+" size="large" />
              </Form.Item>
              <Form.Item name="stats.rooms.label" label="Nhãn">
                <Input placeholder="Phòng nghỉ" size="large" />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <StarOutlined style={{ color: "#eb2f96" }} />
                  <span>Thống kê - Khách hàng</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                height: "100%",
              }}
            >
              <Form.Item
                name="stats.satisfiedCustomers.number"
                label="Số lượng"
              >
                <Input placeholder="50K+" size="large" />
              </Form.Item>
              <Form.Item
                name="stats.satisfiedCustomers.label"
                label="Nhãn"
              >
                <Input placeholder="Khách hàng hài lòng" size="large" />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <StarOutlined style={{ color: "#722ed1" }} />
                  <span>Thống kê - Đánh giá</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                height: "100%",
              }}
            >
              <Form.Item name="stats.averageRating.number" label="Số lượng">
                <Input placeholder="4.8" size="large" />
              </Form.Item>
              <Form.Item name="stats.averageRating.label" label="Nhãn">
                <Input placeholder="Đánh giá trung bình" size="large" />
              </Form.Item>
            </Card>
          </Col>

          {/* Introduction */}
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: "#13c2c2" }} />
                  <span>Giới thiệu</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Form.Item name="introduction.title" label="Tiêu đề">
                <Input
                  placeholder="Chào mừng đến với Miko Hotel"
                  size="large"
                />
              </Form.Item>
              <Form.Item name="introduction.description" label="Mô tả">
                <TextArea
                  rows={4}
                  placeholder="Mô tả về khách sạn..."
                  size="large"
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Story */}
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: "#fa8c16" }} />
                  <span>Câu chuyện</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Form.Item name="story.title" label="Tiêu đề">
                <Input placeholder="Câu Chuyện Của Chúng Tôi" size="large" />
              </Form.Item>
              <Form.Item name="story.paragraph1" label="Đoạn 1">
                <TextArea rows={3} placeholder="Nội dung đoạn 1..." />
              </Form.Item>
              <Form.Item name="story.paragraph2" label="Đoạn 2">
                <TextArea rows={3} placeholder="Nội dung đoạn 2..." />
              </Form.Item>
              <Form.Item name="story.image" label="URL Ảnh">
                <Input placeholder="https://example.com/image.jpg" size="large" />
              </Form.Item>
            </Card>
          </Col>

          {/* Mission & Vision */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <BulbOutlined style={{ color: "#1890ff" }} />
                  <span>Tầm nhìn</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                height: "100%",
              }}
            >
              <Form.Item name="mission.title" label="Tiêu đề">
                <Input placeholder="Tầm Nhìn" size="large" />
              </Form.Item>
              <Form.Item name="mission.description" label="Mô tả">
                <TextArea rows={4} placeholder="Nội dung tầm nhìn..." />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <BulbOutlined style={{ color: "#52c41a" }} />
                  <span>Sứ mệnh</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                height: "100%",
              }}
            >
              <Form.Item name="vision.title" label="Tiêu đề">
                <Input placeholder="Sứ Mệnh" size="large" />
              </Form.Item>
              <Form.Item name="vision.description" label="Mô tả">
                <TextArea rows={4} placeholder="Nội dung sứ mệnh..." />
              </Form.Item>
            </Card>
          </Col>

          {/* Features */}
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <AppstoreOutlined style={{ color: "#722ed1" }} />
                  <span>Tại sao chọn chúng tôi (Features)</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Form.List name="features">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        style={{
                          marginBottom: 16,
                          border: "1px solid #d9d9d9",
                        }}
                        title={
                          <Space>
                            <span>Feature {name + 1}</span>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                            >
                              Xóa
                            </Button>
                          </Space>
                        }
                      >
                        <Row gutter={16}>
                          <Col xs={24} md={8}>
                            <Form.Item
                              {...restField}
                              name={[name, "icon"]}
                              label="Icon"
                              rules={[{ required: true, message: "Chọn icon" }]}
                            >
                              <Select placeholder="Chọn icon" size="large">
                                <Select.Option value="Building">🏢 Tòa nhà</Select.Option>
                                <Select.Option value="Award">🏆 Giải thưởng</Select.Option>
                                <Select.Option value="Heart">❤️ Trái tim</Select.Option>
                                <Select.Option value="Coffee">☕ Cà phê</Select.Option>
                                <Select.Option value="Wifi">📶 WiFi</Select.Option>
                                <Select.Option value="Car">🚗 Xe hơi</Select.Option>
                                <Select.Option value="UtensilsCrossed">🍴 Đồ dùng ăn uống</Select.Option>
                                <Select.Option value="Waves">🌊 Sóng biển</Select.Option>
                                <Select.Option value="Bed">🛏️ Giường ngủ</Select.Option>
                                <Select.Option value="MapPin">📍 Địa điểm</Select.Option>
                                <Select.Option value="Plane">✈️ Máy bay</Select.Option>
                                <Select.Option value="Umbrella">☂️ Dù/Ô</Select.Option>
                                <Select.Option value="Camera">📷 Máy ảnh</Select.Option>
                                <Select.Option value="Music">🎵 Âm nhạc</Select.Option>
                                <Select.Option value="Dumbbell">💪 Gym/Thể hình</Select.Option>
                                <Select.Option value="Spa">🧖 Spa</Select.Option>
                                <Select.Option value="Pool">🏊 Hồ bơi</Select.Option>
                                <Select.Option value="Restaurant">🍽️ Nhà hàng</Select.Option>
                                <Select.Option value="Bar">🍸 Bar</Select.Option>
                                <Select.Option value="ShoppingBag">🛍️ Mua sắm</Select.Option>
                                <Select.Option value="Parking">🅿️ Bãi đỗ xe</Select.Option>
                                <Select.Option value="ConciergeBell">🔔 Lễ tân</Select.Option>
                                <Select.Option value="Luggage">🧳 Hành lý</Select.Option>
                                <Select.Option value="Calendar">📅 Lịch</Select.Option>
                                <Select.Option value="Clock">🕐 Đồng hồ</Select.Option>
                                <Select.Option value="Phone">📞 Điện thoại</Select.Option>
                                <Select.Option value="Mail">✉️ Email</Select.Option>
                                <Select.Option value="MessageSquare">💬 Tin nhắn</Select.Option>
                                <Select.Option value="CreditCard">💳 Thẻ tín dụng</Select.Option>
                                <Select.Option value="Key">🔑 Chìa khóa</Select.Option>
                                <Select.Option value="Lock">🔒 Khóa</Select.Option>
                                <Select.Option value="Shield">🛡️ Bảo vệ</Select.Option>
                                <Select.Option value="Star">⭐ Sao</Select.Option>
                                <Select.Option value="ThumbsUp">👍 Thích</Select.Option>
                                <Select.Option value="CheckCircle">✅ Hoàn thành</Select.Option>
                                <Select.Option value="Gift">🎁 Quà tặng</Select.Option>
                                <Select.Option value="Sparkles">✨ Lấp lánh</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={16}>
                            <Form.Item
                              {...restField}
                              name={[name, "title"]}
                              label="Tiêu đề"
                              rules={[{ required: true, message: "Nhập tiêu đề" }]}
                            >
                              <Input placeholder="Tiêu đề feature" size="large" />
                            </Form.Item>
                          </Col>
                          <Col xs={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "description"]}
                              label="Mô tả"
                              rules={[{ required: true, message: "Nhập mô tả" }]}
                            >
                              <TextArea
                                rows={2}
                                placeholder="Mô tả feature..."
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        size="large"
                      >
                        Thêm Feature
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>

          {/* Team */}
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <TeamOutlined style={{ color: "#eb2f96" }} />
                  <span>Đội ngũ</span>
                </Space>
              }
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Form.Item name="team.title" label="Tiêu đề">
                <Input placeholder="Đội Ngũ Của Chúng Tôi" size="large" />
              </Form.Item>
              <Form.Item name="team.description" label="Mô tả">
                <TextArea
                  rows={3}
                  placeholder="Mô tả về đội ngũ..."
                  size="large"
                />
              </Form.Item>

              <Form.List name="team.members">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        style={{
                          marginBottom: 16,
                          border: "1px solid #d9d9d9",
                        }}
                        title={
                          <Space>
                            <span>Thành viên {name + 1}</span>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                            >
                              Xóa
                            </Button>
                          </Space>
                        }
                      >
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                              label="Tên"
                              rules={[{ required: true, message: "Nhập tên" }]}
                            >
                              <Input placeholder="Tên thành viên" size="large" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "position"]}
                              label="Chức vụ"
                              rules={[{ required: true, message: "Nhập chức vụ" }]}
                            >
                              <Input placeholder="Chức vụ" size="large" />
                            </Form.Item>
                          </Col>
                          <Col xs={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "image"]}
                              label="URL Ảnh"
                            >
                              <Input placeholder="https://example.com/image.jpg" size="large" />
                            </Form.Item>
                          </Col>
                          <Col xs={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "description"]}
                              label="Mô tả"
                            >
                              <TextArea
                                rows={2}
                                placeholder="Mô tả về thành viên..."
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "email"]}
                              label="Email"
                              rules={[{ type: "email", message: "Email không hợp lệ" }]}
                            >
                              <Input placeholder="email@example.com" size="large" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "linkedin"]}
                              label="LinkedIn"
                            >
                              <Input placeholder="https://linkedin.com/in/..." size="large" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        size="large"
                      >
                        Thêm Thành viên
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Card
          style={{
            marginTop: 24,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Form.Item style={{ marginBottom: 0 }}>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
                style={{ minWidth: 150 }}
              >
                Lưu thay đổi
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  loadAboutInfo();
                }}
                icon={<ReloadOutlined />}
                size="large"
              >
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
}

