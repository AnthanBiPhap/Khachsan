import { useEffect, useState } from "react";
import { Checkbox, InputNumber, Space, Typography, message, Card, Badge, Tooltip, Button } from "antd";
import { ClockCircleOutlined, StarOutlined, InfoCircleOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  workingHours?: {
    startTime: string;
    endTime: string;
  };
  slots: string[];
  images: string[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🛎️</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Dịch vụ bổ sung</h3>
            <p className="text-sm text-gray-500">Chọn các dịch vụ bạn muốn sử dụng</p>
          </div>
        </div>
        <Badge 
          count={selected.length} 
          style={{ 
            backgroundColor: '#3b82f6',
            fontSize: '12px',
            fontWeight: 'bold'
          }} 
        />
      </div>
      
      {/* Services List */}
      <div className="space-y-3">
        {services && services.length > 0 ? (
          services.map((service) => {
            const sel = selected.find((s) => s.serviceId === service._id);
            return (
              <div
                key={service._id}
                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  sel 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg shadow-blue-100' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
                onClick={() => handleSelect(service, !sel)}
              >
                {/* Selection indicator */}
                {sel && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-500">
                    <div className="absolute -top-4 -right-1 text-white text-xs">
                      ✓
                    </div>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Checkbox
                        checked={!!sel}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelect(service, e.target.checked);
                        }}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-bold text-gray-800 text-base">
                            {service.name}
                          </h4>
                          {service.workingHours && (
                            <Tooltip title={`Giờ hoạt động: ${service.workingHours.startTime} - ${service.workingHours.endTime}`}>
                              <div className="flex items-center space-x-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                                <ClockCircleOutlined className="text-xs" />
                                <span>{service.workingHours.startTime} - {service.workingHours.endTime}</span>
                              </div>
                            </Tooltip>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 ml-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {service.basePrice.toLocaleString()} VNĐ
                        </div>
                        <div className="text-xs text-gray-500">mỗi dịch vụ</div>
                      </div>
                      
                      {sel && (
                        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
                          <Button
                            type="text"
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (sel.quantity > 1) {
                                handleQuantity(service._id, sel.quantity - 1);
                              }
                            }}
                            className="w-6 h-6 flex items-center justify-center"
                          />
                          <span className="text-sm font-semibold text-gray-700 min-w-[20px] text-center">
                            {sel.quantity}
                          </span>
                          <Button
                            type="text"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (sel.quantity < 10) {
                                handleQuantity(service._id, sel.quantity + 1);
                              }
                            }}
                            className="w-6 h-6 flex items-center justify-center"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">🛎️</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">Không có dịch vụ nào</h4>
            <p className="text-sm text-gray-500">Hiện tại chưa có dịch vụ bổ sung nào khả dụng</p>
          </div>
        )}
      </div>
      
      {/* Summary */}
      {selected.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Tổng cộng {selected.length} dịch vụ đã chọn
            </span>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {selected.reduce((total, item) => {
                  const service = services.find(s => s._id === item.serviceId);
                  return total + (service ? service.basePrice * item.quantity : 0);
                }, 0).toLocaleString()} VNĐ
              </div>
              <div className="text-xs text-gray-500">tạm tính</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
//TEST