// 菜单项类型定义
export interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[]; // 允许访问的角色
}

// 菜单配置类型
export interface MenuConfig {
  [key: string]: MenuItem;
}

// 角色类型
export type UserRole = 'ADMIN' | 'STUDENT' | 'REVIEWER';
