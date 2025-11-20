import React, { useState } from 'react';
import { LockOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, message, Card, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { env } from '../constanst/getEnvs';
import { useAuthStore } from '../stores/authStore';

const { Title, Text } = Typography;

type TFormData = {
  email: string;
  password: string;
  remember: boolean;
}

const LoginPage: React.FC = () => {
   const {setTokens, setUser, isAdminOrStaff} = useAuthStore();
   const [messageApi, contextHolder] = message.useMessage();
   const [isLoading, setIsLoading] = useState(false);
   const navigate = useNavigate();

  const onFinish = async(values: TFormData) => {
    console.log('Received values of form: ', values);
    try {
      setIsLoading(true);
      const responseLogin = await axios.post(
        `${env.API_URL}/api/v1/auth/login`,
        { email: values.email, password: values.password },
      );
      
      if(responseLogin.status === 200){
         // 1. luu tokens
         setTokens(responseLogin.data.data);
        
        // Kiểm tra xem tokens đã được lưu chưa
        const storedTokens = useAuthStore.getState().tokens;
        console.log('Stored tokens:', storedTokens);

        // 2. Lấy thông tin Profile của user vừa login thành công
        const responseProfile = await axios.get(
          `${env.API_URL}/api/v1/auth/get-profile`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${responseLogin.data.data.accessToken}`,
            },
          });
         
        // 3. Lưu thông tin profile vào local Storage
        if (responseProfile.status === 200) {
          setUser(responseProfile.data.data);
          
          // 4. Kiểm tra role admin hoặc staff
          if (isAdminOrStaff()) {
            // Chuyển hướng đến trang dashboard
            navigate('/');
          } else {
            // Xóa tokens và user nếu không có quyền
            setTokens({ accessToken: '', refreshToken: '' });
            setUser(null);
            messageApi.open({
              type: 'error',
              content: 'Bạn không có quyền truy cập vào trang admin. Chỉ admin và staff mới được phép đăng nhập.',
            });
          }
        } else {
          messageApi.open({
            type: 'error',
            content: 'Failed to get user profile',
          });
        }
      } else {
        messageApi.open({
          type: 'error',
          content: 'Username or password invalid',
        });
      }
    } catch (error) {
      console.log('Login error:', error);
      messageApi.open({
        type: 'error',
        content: 'Login failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {contextHolder}
      
      {/* Decorative circles */}
      <div 
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-100px',
          left: '-100px',
        }}
      />
      <div 
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          bottom: '-50px',
          right: '-50px',
        }}
      />

      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: 'none',
          position: 'relative',
          zIndex: 1,
        }}
        bodyStyle={{
          padding: '40px',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }} align="center">
          {/* Logo and Title */}
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <HomeOutlined 
              style={{ 
                fontSize: '48px', 
                color: '#667eea',
                marginBottom: '16px',
                display: 'block'
              }} 
            />
            <Title level={2} style={{ margin: 0, color: '#1a1a1a', fontWeight: 600 }}>
              Miko Hotel
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Hệ thống quản trị
            </Text>
          </div>

          {/* Login Form */}
          <Form
            name="login"
            initialValues={{ 
              remember: true,
              email: 'admin@gmail.com',
              password: '123456'
            }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
            style={{ width: '100%' }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
              style={{ marginBottom: '20px' }}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#667eea' }} />} 
                placeholder="Email đăng nhập"
                style={{ 
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '15px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              style={{ marginBottom: '20px' }}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#667eea' }} />} 
                placeholder="Mật khẩu"
                style={{ 
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '15px'
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '24px' }}>
              <Flex justify="space-between" align="center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ fontSize: '14px' }}>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <a 
                  href="#" 
                  style={{ 
                    color: '#667eea',
                    fontSize: '14px',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Quên mật khẩu?
                </a>
              </Flex>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                disabled={isLoading} 
                loading={isLoading} 
                block 
                type="primary" 
                htmlType="submit"
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;