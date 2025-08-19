import { useState, useEffect, useMemo } from 'react';
import type { MenuItem, MenuConfig, UserRole } from '../types/menu';
import { userAPI } from '../api/article';

// 菜单配置
export const menuConfig: MenuConfig = {
  home: {
    key: 'home',
    label: '首页',
    icon: '🏠',
    path: '/',
    roles: ['ADMIN', 'STUDENT', 'REVIEWER']
  },
  articles: {
    key: 'articles',
    label: '文章管理',
    icon: '📝',
    path: '/articles',
    roles: ['ADMIN', 'REVIEWER', 'STUDENT']
  },
  articleCreate: {
    key: 'articleCreate',
    label: '新建文章',
    icon: '✏️',
    path: '/articles/new',
    roles: ['ADMIN', 'REVIEWER', 'STUDENT']
  },
  review: {
    key: 'review',
    label: '文章审核',
    icon: '✅',
    path: '/review',
    roles: ['ADMIN', 'REVIEWER']
  },
  users: {
    key: 'users',
    label: '用户管理',
    icon: '👥',
    path: '/users',
    roles: ['ADMIN']
  },
  myPosts: {
    key: 'myPosts',
    label: '我的发布',
    icon: '📋',
    path: '/my-posts',
    roles: ['ADMIN', 'STUDENT']
  },
  originArticles: {
    key: 'originArticles',
    label: '原始文章管理',
    icon: '📚',
    path: '/origin-articles',
    roles: ['ADMIN']
  }
};

// 菜单权限管理Hook
export const useMenuPermissions = () => {
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取用户角色
  useEffect(() => {
    console.log('useEffect 触发 - 开始获取用户角色');
    
    const fetchUserRoles = async () => {
      try {
        console.log('开始获取用户角色...');
        setLoading(true);
        const roles = await userAPI.getMyRoles();
        console.log('获取到的角色数据:', roles);
        
        // 提取角色代码
        const roleCodes = roles.map((role: any) => role.roleCode);
        console.log('提取的角色代码:', roleCodes);
        
        setUserRoles(roleCodes);
        console.log('setUserRoles 调用完成');
      } catch (error) {
        console.error('获取用户角色失败:', error);
        setUserRoles([]);
      } finally {
        setLoading(false);
        console.log('角色获取完成，loading状态:', false);
      }
    };

    fetchUserRoles();
  }, []);

  // 根据用户角色过滤菜单
  const filteredMenus = useMemo(() => {
    console.log('菜单过滤 - loading:', loading, 'userRoles:', userRoles);
    console.log('menuConfig:', menuConfig);
    
    if (loading) {
      console.log('仍在加载中，返回空菜单');
      return [];
    }
    
    // 临时调试：如果用户没有角色，显示所有菜单
    if (userRoles.length === 0) {
      console.log('用户没有角色，临时显示所有菜单用于调试');
      return Object.values(menuConfig);
    }

    const filtered = Object.values(menuConfig).filter(menu => {
      // 如果用户有ADMIN角色，显示所有菜单
      if (userRoles.includes('ADMIN')) {
        console.log(`用户有ADMIN角色，显示菜单: ${menu.key}`);
        return true;
      }
      // 否则只显示用户角色允许的菜单
      const hasPermission = menu.roles.some(role => userRoles.includes(role));
      console.log(`菜单 ${menu.key} 权限检查:`, menu.roles, 'vs', userRoles, '结果:', hasPermission);
      return hasPermission;
    });
    
    console.log('最终过滤后的菜单:', filtered);
    console.log('菜单数量:', filtered.length);
    return filtered;
  }, [userRoles, loading]);

  // 检查用户是否有某个菜单的访问权限
  const hasMenuPermission = (menuKey: string): boolean => {
    if (userRoles.includes('ADMIN')) {
      return true;
    }
    
    const menu = menuConfig[menuKey];
    if (!menu) {
      return false;
    }
    
    return menu.roles.some(role => userRoles.includes(role));
  };

  // 检查用户是否有某个路径的访问权限
  const hasPathPermission = (path: string): boolean => {
    const menu = Object.values(menuConfig).find(m => m.path === path);
    if (!menu) {
      return false;
    }
    
    return hasMenuPermission(menu.key);
  };

  return {
    userRoles,
    filteredMenus,
    hasMenuPermission,
    hasPathPermission,
    loading
  };
};
