import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Space,
  Divider,
  Upload,
  Row,
  Col,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import { 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  PictureOutlined, 
  UploadOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  QrcodeOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getContactInfo,
  updateContactInfo,
  uploadFile,
  type ContactInfo,
} from "../../services/contactInfo.service";

const { TextArea } = Input;
const { Title } = Typography;

export default function ContactInfoPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  const loadContactInfo = async () => {
    try {
      setLoading(true);
      const info = await getContactInfo();
      setContactInfo(info);
      form.setFieldsValue({
        phone: info.phone,
        email: info.email,
        address: info.address,
        "workingHours.reception": info.workingHours?.reception,
        "workingHours.onlineSupport": info.workingHours?.onlineSupport,
        "socialMedia.facebook": info.socialMedia?.facebook,
        "socialMedia.zalo": info.socialMedia?.zalo,
        "socialMedia.instagram": info.socialMedia?.instagram,
        zaloQR: info.zaloQR || '/zalo-qr.jpg',
        mapEmbedUrl: info.mapEmbedUrl,
      });

      // Set image URL để hiển thị
      if (info.zaloQR && info.zaloQR.startsWith('/uploads')) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        setImageUrl(`${apiUrl}${info.zaloQR}`);
      } else {
        setImageUrl('/zalo-qr.jpg');
      }

    } catch (error: any) {
      console.error("Error loading contact info:", error);
      message.error("Không thể tải thông tin liên hệ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContactInfo();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Chỉ gửi những trường có giá trị (không undefined, null, hoặc rỗng)
      const payload: any = {};
      
      if (values.phone && values.phone.trim()) {
        payload.phone = values.phone.trim();
      }
      if (values.email && values.email.trim()) {
        payload.email = values.email.trim();
      }
      if (values.address && values.address.trim()) {
        payload.address = values.address.trim();
      }
      // Xử lý workingHours - chỉ gửi nếu có ít nhất 1 trường
      const workingHours: any = {};
      if (values["workingHours.reception"] && values["workingHours.reception"].trim()) {
        workingHours.reception = values["workingHours.reception"].trim();
      }
      if (values["workingHours.onlineSupport"] && values["workingHours.onlineSupport"].trim()) {
        workingHours.onlineSupport = values["workingHours.onlineSupport"].trim();
      }
      if (Object.keys(workingHours).length > 0) {
        payload.workingHours = workingHours;
      }
      
      // Xử lý socialMedia - chỉ gửi nếu có ít nhất 1 trường
      const socialMedia: any = {};
      if (values["socialMedia.facebook"] && values["socialMedia.facebook"].trim()) {
        socialMedia.facebook = values["socialMedia.facebook"].trim();
      }
      if (values["socialMedia.zalo"] && values["socialMedia.zalo"].trim()) {
        socialMedia.zalo = values["socialMedia.zalo"].trim();
      }
      if (values["socialMedia.instagram"] && values["socialMedia.instagram"].trim()) {
        socialMedia.instagram = values["socialMedia.instagram"].trim();
      }
      if (Object.keys(socialMedia).length > 0) {
        payload.socialMedia = socialMedia;
      }
      
      if (values.zaloQR && values.zaloQR.trim()) {
        payload.zaloQR = values.zaloQR.trim();
      }
      if (values.mapEmbedUrl && values.mapEmbedUrl.trim()) {
        let mapUrl = values.mapEmbedUrl.trim();
        // Nếu là iframe tag, extract URL từ src attribute
        if (mapUrl.includes('<iframe')) {
          const match = mapUrl.match(/src=["']([^"']+)["']/);
          if (match && match[1]) {
            mapUrl = match[1];
          }
        }
        payload.mapEmbedUrl = mapUrl;
      }

      // Kiểm tra xem có trường nào được cập nhật không
      if (Object.keys(payload).length === 0) {
        message.warning("Vui lòng nhập ít nhất một trường để cập nhật");
        return;
      }

      await updateContactInfo(payload);
      message.success("Cập nhật thông tin liên hệ thành công");
      loadContactInfo();
    } catch (error: any) {
      console.error("Error updating contact info:", error);
      message.error(error.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card 
        style={{ 
          marginBottom: 24,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Space align="center">
          <PhoneOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0 }}>
            Quản lý thông tin liên hệ
          </Title>
        </Space>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        loading={loading}
      >
        <Row gutter={[16, 16]}>
          {/* Thông tin cơ bản */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <PhoneOutlined style={{ color: '#1890ff' }} />
                  <span>Thông tin cơ bản</span>
                </Space>
              }
              style={{ 
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                height: '100%'
              }}
            >
              <Form.Item
                name="phone"
                label={
                  <Space>
                    <PhoneOutlined />
                    <span>Số điện thoại</span>
                  </Space>
                }
                rules={[{ type: "string" }]}
              >
                <Input 
                  prefix={<PhoneOutlined style={{ color: '#1890ff' }} />} 
                  placeholder="0704627402"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={
                  <Space>
                    <MailOutlined />
                    <span>Email</span>
                  </Space>
                }
                rules={[
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: '#1890ff' }} />} 
                  placeholder="info@mikohotel.com"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="address"
                label={
                  <Space>
                    <EnvironmentOutlined />
                    <span>Địa chỉ</span>
                  </Space>
                }
              >
                <Input
                  prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                  placeholder="Thanh khê, Hùng Vương, Đà Nẵng"
                  size="large"
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Giờ làm việc */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#52c41a' }} />
                  <span>Giờ làm việc</span>
                </Space>
              }
              style={{ 
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                height: '100%'
              }}
            >
              <Form.Item
                name="workingHours.reception"
                label="Lễ tân"
              >
                <Input 
                  placeholder="Lễ tân 24/7"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="workingHours.onlineSupport"
                label="Hỗ trợ online"
              >
                <Input 
                  placeholder="Hỗ trợ online: 8:00 - 22:00 hàng ngày"
                  size="large"
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Social Media */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <GlobalOutlined style={{ color: '#722ed1' }} />
                  <span>Mạng xã hội</span>
                </Space>
              }
              style={{ 
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                height: '100%'
              }}
            >
              <Form.Item
                name="socialMedia.facebook"
                label={
                  <Space>
                    <Tag color="blue">Facebook</Tag>
                  </Space>
                }
              >
                <Input 
                  placeholder="https://facebook.com/mikohotel"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="socialMedia.zalo"
                label={
                  <Space>
                    <Tag color="cyan">Zalo</Tag>
                  </Space>
                }
              >
                <Input 
                  placeholder="https://zalo.me/84912345678"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="socialMedia.instagram"
                label={
                  <Space>
                    <Tag color="magenta">Instagram</Tag>
                  </Space>
                }
              >
                <Input 
                  placeholder="https://instagram.com/mikohotel"
                  size="large"
                />
              </Form.Item>
            </Card>
          </Col>

          {/* QR Code Zalo */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <QrcodeOutlined style={{ color: '#fa8c16' }} />
                  <span>QR Code Zalo</span>
                </Space>
              }
              style={{ 
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                height: '100%'
              }}
            >

              <Form.Item
                name="zaloQR"
                label="Ảnh QR Code Zalo"
                help="Upload ảnh QR Code Zalo (JPEG, PNG, GIF, WEBP - tối đa 5MB)"
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Upload
                    name="file"
                    listType="picture-card"
                    maxCount={1}
                    fileList={imageUrl && imageUrl !== '/zalo-qr.jpg' ? [{
                      uid: '-1',
                      name: 'zalo-qr.jpg',
                      status: 'done',
                      url: imageUrl,
                    }] : []}
                    beforeUpload={async (file) => {
                      const isImage = file.type.startsWith('image/');
                      if (!isImage) {
                        message.error('Chỉ cho phép upload file ảnh!');
                        return Upload.LIST_IGNORE;
                      }
                      const isLt5M = file.size / 1024 / 1024 < 5;
                      if (!isLt5M) {
                        message.error('Ảnh phải nhỏ hơn 5MB!');
                        return Upload.LIST_IGNORE;
                      }
                      
                      try {
                        setLoading(true);
                        const filePath = await uploadFile(file);
                        form.setFieldsValue({ zaloQR: filePath });
                        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                        setImageUrl(`${apiUrl}${filePath}`);
                        message.success('Upload thành công!');
                      } catch (error: any) {
                        message.error(error.message || 'Upload thất bại');
                      } finally {
                        setLoading(false);
                      }
                      
                      return Upload.LIST_IGNORE;
                    }}
                    onRemove={() => {
                      form.setFieldsValue({ zaloQR: '/zalo-qr.jpg' });
                      setImageUrl('/zalo-qr.jpg');
                      return true;
                    }}
                  >
                    {(!imageUrl || imageUrl === '/zalo-qr.jpg') && (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                  <Input 
                    placeholder="/zalo-qr.jpg" 
                    value={form.getFieldValue('zaloQR') || '/zalo-qr.jpg'}
                    onChange={(e) => form.setFieldsValue({ zaloQR: e.target.value })}
                    size="large"
                  />
                </Space>
              </Form.Item>
            </Card>
          </Col>

          {/* Google Maps */}
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <EnvironmentOutlined style={{ color: '#eb2f96' }} />
                  <span>Google Maps</span>
                </Space>
              }
              style={{ 
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Form.Item
                name="mapEmbedUrl"
                label="URL Embed Google Maps"
                help="Dán URL hoặc cả thẻ iframe, hệ thống sẽ tự động lấy URL"
              >
                <TextArea
                  rows={4}
                  placeholder="Dán URL: https://www.google.com/maps/embed?pb=...&#10;Hoặc dán cả iframe: &lt;iframe src=&quot;...&quot;&gt;&lt;/iframe&gt;"
                  onPaste={(e) => {
                    // Đợi paste xong rồi xử lý
                    setTimeout(() => {
                      const value = form.getFieldValue('mapEmbedUrl');
                      if (value && value.includes('<iframe')) {
                        // Extract URL từ iframe tag
                        const match = value.match(/src=["']([^"']+)["']/);
                        if (match && match[1]) {
                          form.setFieldsValue({ mapEmbedUrl: match[1] });
                          message.success('Đã tự động lấy URL từ iframe');
                        }
                      }
                    }, 100);
                  }}
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Card
          style={{ 
            marginTop: 24,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                  loadContactInfo();
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

