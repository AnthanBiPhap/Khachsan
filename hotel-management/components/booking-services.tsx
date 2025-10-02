import { useEffect, useState } from "react";
import { Checkbox, InputNumber, Space, Typography, message } from "antd";

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  slots: string[];
}

export default function BookingServices({
  onChange,
  services,
}: {
  services: Service[];
  onChange: (selected: { serviceId: string; quantity: number }[]) => void;
}) {
  const [selected, setSelected] = useState<
    { serviceId: string; quantity: number }[]
  >([]);

  const handleSelect = (service: Service, checked: boolean) => {
    let updated = [...selected];
    if (checked) {
      updated.push({ serviceId: service._id, quantity: 1 });
    } else {
      updated = updated.filter((s) => s.serviceId !== service._id);
    }
    setSelected(updated);
    onChange(updated);
  };

  const handleQuantity = (serviceId: string, qty: number) => {
    const updated = selected.map((s) =>
      s.serviceId === serviceId ? { ...s, quantity: qty } : s
    );
    setSelected(updated);
    onChange(updated);
  };

  return (
    <div>
      <Typography.Title level={5}>Chọn dịch vụ</Typography.Title>
      <Space direction="vertical">
        {services &&
          services?.map((service) => {
            const sel = selected.find((s) => s.serviceId === service._id);
            return (
              <Space key={service._id} align="center">
                <Checkbox
                  checked={!!sel}
                  onChange={(e) => handleSelect(service, e.target.checked)}
                >
                  {service.name} ({service.basePrice.toLocaleString()} VNĐ)
                </Checkbox>
                {sel && (
                  <InputNumber
                    min={1}
                    value={sel.quantity}
                    onChange={(val) => handleQuantity(service._id, val || 1)}
                  />
                )}
              </Space>
            );
          })}
      </Space>
    </div>
  );
}
