import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có quyền truy cập vào trang admin này."
      extra={
        <Button type="primary" onClick={handleBackToLogin}>
          Quay lại trang đăng nhập
        </Button>
      }
    />
  );
};

export default AccessDenied;
