import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMenuPermissions } from '../hooks/useMenuPermissions';
import { Spin } from 'antd';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  path: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [], 
  path 
}) => {
  const { hasPathPermission, loading, userRoles } = useMenuPermissions();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 检查用户是否有访问该路径的权限
  if (!hasPathPermission(path)) {
    return (
      <div style={{ 
        padding: 24, 
        textAlign: 'center' 
      }}>
        <h2>访问被拒绝</h2>
        <p>您没有权限访问此页面</p>
        <p>您的角色: {userRoles.join(', ') || '无角色'}</p>
        <p>需要角色: {requiredRoles.join(', ') || '无限制'}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
