import { Row, Col, Card, Statistic } from "antd";
import { 
  EnvironmentOutlined, 
  StarOutlined, 
  EyeInvisibleOutlined,
  DeleteOutlined,
  TrophyOutlined,
  HeartOutlined
} from "@ant-design/icons";

interface LocationStatisticsProps {
  totalLocations: number;
  activeLocations: number;
  hiddenLocations: number;
  deletedLocations: number;
  averageRating: number;
  topRatedCount: number;
}

export default function LocationStatistics({
  totalLocations,
  activeLocations,
  hiddenLocations,
  deletedLocations,
  averageRating,
  topRatedCount,
}: LocationStatisticsProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Tổng địa điểm"
            value={totalLocations}
            prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Đang hoạt động"
            value={activeLocations}
            prefix={<StarOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Đã ẩn"
            value={hiddenLocations}
            prefix={<EyeInvisibleOutlined style={{ color: '#faad14' }} />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Đã xóa"
            value={deletedLocations}
            prefix={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Đánh giá TB"
            value={averageRating}
            prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
            valueStyle={{ color: '#722ed1' }}
            precision={1}
            suffix="⭐"
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card>
          <Statistic
            title="Xuất sắc (5⭐)"
            value={topRatedCount}
            prefix={<HeartOutlined style={{ color: '#13c2c2' }} />}
            valueStyle={{ color: '#13c2c2' }}
          />
        </Card>
      </Col>
    </Row>
  );
}
