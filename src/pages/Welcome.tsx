import React from 'react';
import { Card, Row, Col, Statistic, Tag, Space, Typography } from 'antd';
import { UserOutlined, BookOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useMenuPermissions } from '../hooks/useMenuPermissions';

const { Title, Text } = Typography;

const Welcome: React.FC = () => {
  const { user } = useAuth();
  const { userRoles, filteredMenus, loading } = useMenuPermissions();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={2}>欢迎使用内容发布管理平台</Title>
        <Text>加载中...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>欢迎使用内容发布管理平台</Title>
      
      {/* 用户信息卡片 */}
      <Card title="用户信息" style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="用户名"
              value={user?.username || '未知'}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="邮箱"
              value={user?.email || '未知'}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="用户角色"
              value={userRoles.length}
              prefix={<TeamOutlined />}
              suffix={
                <Space direction="vertical" size="small">
                  {userRoles.map(role => (
                    <Tag key={role} color="blue">
                      {role === 'ADMIN' ? '管理员' : 
                       role === 'REVIEWER' ? '审核员' : 
                       role === 'STUDENT' ? '学生' : role}
                    </Tag>
                  ))}
                </Space>
              }
            />
          </Col>
        </Row>
      </Card>

      {/* 权限信息卡片 */}
      <Card title="可用功能" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          {filteredMenus.map(menu => (
            <Col span={6} key={menu.key}>
              <Card size="small" hoverable>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {menu.icon}
                  </div>
                  <Text strong>{menu.label}</Text>
                  <br />
                  <Text type="secondary">路径: {menu.path}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 系统说明卡片 */}
      <Card title="系统说明">
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" title="学生权限">
              <ul>
                <li>提交文章</li>
                <li>查看自己的文章</li>
                <li>编辑草稿状态的文章</li>
              </ul>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="审核员权限">
              <ul>
                <li>查看所有文章</li>
                <li>审核文章</li>
                <li>批准或拒绝文章</li>
              </ul>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="管理员权限">
              <ul>
                <li>所有功能</li>
                <li>用户管理</li>
                <li>角色分配</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Welcome;
