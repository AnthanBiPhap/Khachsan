import { Form, Input, InputNumber, Modal, Select, message, Row, Col, Typography, Tag } from "antd";
const { TextArea } = Input;
import { useEffect, useState } from "react";
import axios from "axios";
import type { InvoiceItemEntry, SimpleInvoice, InvoiceItemsFormProps } from "../../types/invoiceItem";
import { formatCurrency, parseCurrency } from "../../utils/formatters";

const { Option } = Select;
const { Title, Text } = Typography;

export default function InvoiceItemsForm({ open, item, onCancel, onSave, loading }: InvoiceItemsFormProps) {
  const [form] = Form.useForm();
  const [invoices, setInvoices] = useState<SimpleInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoadingInvoices(true);
        const res = await axios.get("http://localhost:8080/api/v1/invoices");
        setInvoices(res.data?.data?.invoices || []);
      } catch {
        message.error("Không tải được danh sách hóa đơn");
      } finally {
        setLoadingInvoices(false);
      }
    };
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        invoiceId: item.invoiceId?._id,
        itemType: item.itemType,
        description: item.description,
        amount: item.amount,
      });
    } else {
      form.resetFields();
    }
  }, [item, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await onSave({
      invoiceId: values.invoiceId,
      itemType: values.itemType,
      description: values.description,
      amount: values.amount,
    } as Partial<InvoiceItemEntry>);
  };


  const getInvoiceOptionLabel = (inv: SimpleInvoice) => {
    const statusColors: Record<string, string> = {
      'pending': 'orange',
      'paid': 'green',
      'failed': 'red',
      'refunded': 'blue',
      'cancelled': 'gray'
    };
    
    const status = inv.status ? (
      <Tag 
        color={statusColors[inv.status] || 'default'}
        style={{ 
          marginLeft: 8,
          textTransform: 'capitalize',
          fontWeight: 500
        }}
      >
        {inv.status.replace('_', ' ')}
      </Tag>
    ) : null;
    
    const amount = inv.totalAmount !== undefined ? (
      <Text strong style={{ color: '#52c41a', marginLeft: 8 }}>
        {formatCurrency(inv.totalAmount)}
      </Text>
    ) : null;
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '4px 0'
      }}>
        <Text strong>#{inv._id?.slice(0, 8)}</Text>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {amount}
          {status}
        </div>
      </div>
    );
  };
  
  const getInvoiceSearchText = (inv: SimpleInvoice) => {
    const statusText = inv.status ? inv.status.replace('_', ' ') : '';
    const amountText = inv.totalAmount ? formatCurrency(inv.totalAmount) : '';
    return `#${inv._id} ${statusText} ${amountText}`.toLowerCase();
  };

  return (
    <Modal
      open={open}
      title={item ? "Chỉnh sửa mục hóa đơn" : "Thêm mục hóa đơn mới"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      style={{ top: 20 }}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {/* Thông tin hóa đơn */}
        <div style={{ 
          background: '#f9f9f9', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          border: '1px solid #f0f0f0'
        }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
            Thông tin hóa đơn
          </Title>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="invoiceId" 
                label={
                  <Text strong>
                    Chọn hóa đơn <Text type="danger">*</Text>
                  </Text>
                }
                rules={[{ required: true, message: "Vui lòng chọn hóa đơn" }]}
              >
                <Select
                  showSearch
                  placeholder="Tìm kiếm hóa đơn..."
                  loading={loadingInvoices}
                  filterOption={(input, option) => {
                    const invoice = invoices.find(inv => inv._id === option?.value);
                    if (!invoice) return false;
                    return getInvoiceSearchText(invoice).includes(input.toLowerCase());
                  }}
                  optionLabelProp="label"
                  dropdownStyle={{ maxHeight: 300 }}
                >
                  {invoices.map(inv => (
                    <Option 
                      key={inv._id} 
                      value={inv._id}
                      label={`#${inv._id?.slice(0, 8)}`}
                    >
                      {getInvoiceOptionLabel(inv)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Chi tiết mục hóa đơn */}
        <div style={{ 
          background: '#f9f9f9', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #f0f0f0'
        }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
            Chi tiết mục hóa đơn
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                name="itemType" 
                label={
                  <Text strong>
                    Loại mục <Text type="danger">*</Text>
                  </Text>
                }
                rules={[{ required: true, message: "Vui lòng chọn loại mục" }]}
              >
                <Select 
                  placeholder="Chọn loại mục"
                  style={{ width: '100%' }}
                >
                  <Option value="room">
                    <Tag color="blue" style={{ marginRight: 0 }}>Phòng</Tag>
                  </Option>
                  <Option value="service">
                    <Tag color="green" style={{ marginRight: 0 }}>Dịch vụ</Tag>
                  </Option>
                  <Option value="late_fee">
                    <Tag color="orange" style={{ marginRight: 0 }}>Phí trễ</Tag>
                  </Option>
                  <Option value="other">
                    <Tag style={{ marginRight: 0 }}>Khác</Tag>
                  </Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item 
                name="amount" 
                label={
                  <Text strong>
                    Số tiền <Text type="danger">*</Text>
                  </Text>
                }
                rules={[{ 
                  required: true, 
                  message: "Vui lòng nhập số tiền" 
                }]}
              >
                <InputNumber 
                  min={0}
                  style={{ width: '100%' }} 
                  formatter={(value) => formatCurrency(Number(value || 0)) as unknown as string}
                  parser={(value: string | undefined) => value ? parseCurrency(value) : 0}
                  placeholder="0"
                  step={1000}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                name="description" 
                label={
                  <Text strong>
                    Mô tả chi tiết <Text type="danger">*</Text>
                  </Text>
                }
                rules={[ 
                  { required: true, message: "Vui lòng nhập mô tả" },
                  { max: 500, message: "Mô tả không được vượt quá 500 ký tự" }
                ]}
              >
                <TextArea 
                  rows={4} 
                  showCount 
                  maxLength={500} 
                  placeholder="Nhập mô tả chi tiết về mục hóa đơn"
                  style={{ resize: 'vertical' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
        
        {/* Hướng dẫn */}
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <Text type="danger">*</Text> Là các trường bắt buộc
          </Text>
        </div>
      </Form>
    </Modal>
  );
}
