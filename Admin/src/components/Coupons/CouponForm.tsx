import { Modal, Form, Input, Select, DatePicker, InputNumber, message } from "antd";
import { useEffect } from "react";
import type { Coupon } from "../../services/coupons.service";
import dayjs from "dayjs";

const { TextArea } = Input;

interface CouponFormProps {
  open: boolean;
  coupon: Coupon | null;
  onCancel: () => void;
  onSave: (values: Partial<Coupon>) => Promise<void>;
  loading?: boolean;
}

export default function CouponForm({
  open,
  coupon,
  onCancel,
  onSave,
  loading = false,
}: CouponFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (coupon) {
      form.setFieldsValue({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        startDate: dayjs(coupon.startDate),
        endDate: dayjs(coupon.endDate),
        usageLimit: coupon.usageLimit,
        status: coupon.status,
        applicableTo: coupon.applicableTo,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        discountType: "percentage",
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        status: "active",
        applicableTo: "all",
      });
    }
  }, [coupon, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
      };
      await onSave(payload);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const discountType = Form.useWatch("discountType", form);

  return (
    <Modal
      open={open}
      title={coupon ? "Sửa coupon" : "Tạo coupon mới"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="code"
          label="Mã coupon"
          rules={[
            { required: true, message: "Vui lòng nhập mã coupon" },
            {
              pattern: /^[A-Z0-9]+$/,
              message: "Mã coupon chỉ được chứa chữ cái và số",
            },
          ]}
        >
          <Input
            placeholder="Ví dụ: SUMMER2024"
            disabled={!!coupon} // Không cho sửa mã khi edit
            style={{ textTransform: "uppercase" }}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên coupon"
          rules={[{ required: true, message: "Vui lòng nhập tên coupon" }]}
        >
          <Input placeholder="Ví dụ: Giảm giá mùa hè" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <TextArea rows={3} placeholder="Mô tả về coupon..." />
        </Form.Item>

        <Form.Item
          name="discountType"
          label="Loại giảm giá"
          rules={[{ required: true, message: "Vui lòng chọn loại giảm giá" }]}
        >
          <Select>
            <Select.Option value="percentage">Phần trăm (%)</Select.Option>
            <Select.Option value="fixed">Số tiền cố định (VNĐ)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="discountValue"
          label={
            discountType === "percentage"
              ? "Phần trăm giảm giá (%)"
              : "Số tiền giảm giá (VNĐ)"
          }
          rules={[
            { required: true, message: "Vui lòng nhập giá trị giảm giá" },
            {
              validator: (_, value) => {
                if (discountType === "percentage" && value > 100) {
                  return Promise.reject(
                    new Error("Phần trăm không được vượt quá 100%")
                  );
                }
                if (value < 0) {
                  return Promise.reject(
                    new Error("Giá trị giảm giá phải lớn hơn 0")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            max={discountType === "percentage" ? 100 : undefined}
            placeholder={
              discountType === "percentage" ? "Ví dụ: 10" : "Ví dụ: 100000"
            }
          />
        </Form.Item>

        {discountType === "percentage" && (
          <Form.Item
            name="maxDiscountAmount"
            label="Số tiền giảm tối đa (VNĐ)"
            tooltip="Giới hạn số tiền giảm tối đa khi áp dụng phần trăm. Đặt 0 để không giới hạn."
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              placeholder="0 = không giới hạn"
            />
          </Form.Item>
        )}

        <Form.Item
          name="minOrderAmount"
          label="Giá trị đơn hàng tối thiểu (VNĐ)"
          tooltip="Giá trị đơn hàng tối thiểu để có thể sử dụng coupon này. Đặt 0 để không giới hạn."
        >
          <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
        </Form.Item>

        <Form.Item
          name="applicableTo"
          label="Áp dụng cho"
          rules={[{ required: true, message: "Vui lòng chọn loại áp dụng" }]}
        >
          <Select>
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="room">Chỉ phòng</Select.Option>
            <Select.Option value="service">Chỉ dịch vụ</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Ngày bắt đầu"
          rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            showTime
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="Ngày kết thúc"
          rules={[
            { required: true, message: "Vui lòng chọn ngày kết thúc" },
            {
              validator: (_, value) => {
                const startDate = form.getFieldValue("startDate");
                if (startDate && value && value.isBefore(startDate)) {
                  return Promise.reject(
                    new Error("Ngày kết thúc phải sau ngày bắt đầu")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            showTime
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>

        <Form.Item
          name="usageLimit"
          label="Số lần sử dụng tối đa"
          tooltip="Số lần coupon có thể được sử dụng. Đặt 0 để không giới hạn."
        >
          <InputNumber style={{ width: "100%" }} min={0} placeholder="0 = không giới hạn" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select>
            <Select.Option value="active">Đang hoạt động</Select.Option>
            <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
            <Select.Option value="expired">Hết hạn</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

