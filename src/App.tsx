import { Layout, Menu, Button, Space, Dropdown } from 'antd';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';
import {
  SettingOutlined,
  TableOutlined,
  SearchOutlined,
  PictureOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
  BugOutlined,
  FileOutlined,
  BookOutlined,
  TeamOutlined
} from '@ant-design/icons';
import './App.css';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import ConfigPage from './pages/ConfigPage';
import ProductPage from './pages/ProductPage';
import GalleryPage from './pages/GalleryPage';
import UnpublishedRecordsPage from './pages/UnpublishedRecordsPage';
import FileManager from './pages/FileManager';
import SimpleFileTest from './pages/components/SimpleFileTest';
import Login from './pages/Login';
import TestPage from './pages/TestPage';
import AITestPage from './pages/AITestPage';
// 导入文章管理模块
import ArticleList from './pages/ArticleManagement/ArticleList';
import ArticleEditor from './pages/ArticleManagement/ArticleEditor';
import ArticleDetail from './pages/ArticleManagement/ArticleDetail';
import ArticleReview from './pages/ArticleManagement/ArticleReview';
import MyPosts from './pages/ArticleManagement/MyPosts';
import UserManagement from './pages/UserManagement/UserManagement';
import Welcome from './pages/Welcome';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import { ProductListProvider } from './pages/ProductListContext';
import { GlobalNotificationProvider } from './pages/GlobalNotification';
import { UnpublishedRecordsProvider } from './contexts/UnpublishedRecordsContext';
import { ProductSearchProvider } from './pages/ProductSearchContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useMenuPermissions } from './hooks/useMenuPermissions';
// 导入 stagewise 工具栏组件
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import ReactPlugin from '@stagewise-plugins/react';
import '@ant-design/v5-patch-for-react-19';

const { Header, Sider, Content } = Layout;

// 菜单配置
const createMenuItems = (filteredMenus: any[]) => {
  console.log('createMenuItems - 输入:', filteredMenus);
  
  const items = filteredMenus.map(menu => {
    const item = {
      key: menu.key,
      icon: getMenuIcon(menu.key),
      label: <Link to={menu.path}>{menu.label}</Link>
    };
    console.log('创建菜单项:', item);
    return item;
  });
  
  console.log('createMenuItems - 输出:', items);
  return items;
};

// 获取菜单图标
const getMenuIcon = (key: string) => {
  switch (key) {
    case 'home':
      return <BookOutlined />;
    case 'articles':
      return <BookOutlined />;
    case 'articleCreate':
      return <BookOutlined />;
    case 'review':
      return <TeamOutlined />;
    case 'users':
      return <UserOutlined />;
    case 'myPosts':
      return <BookOutlined />;
    default:
      return <BookOutlined />;
  }
};

// 用户菜单组件
const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { userRoles, loading } = useMenuPermissions();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: `用户：${user?.username}`,
    },
    {
      key: 'roles',
      icon: <TeamOutlined />,
      label: `角色：${loading ? '加载中...' : userRoles.join(', ') || '无角色'}`,
      disabled: true,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
      <Button type="text" icon={<UserOutlined />} style={{ color: '#1890ff' }}>
        {user?.username}
      </Button>
    </Dropdown>
  );
};

function AppLayout() {
  const location = useLocation();
  const { filteredMenus, loading, userRoles } = useMenuPermissions();
  
  console.log('AppLayout - filteredMenus:', filteredMenus, 'loading:', loading, 'userRoles:', userRoles);
  
  // 根据当前路径确定选中的菜单项
  const selectedKey = filteredMenus.find(menu => location.pathname.startsWith(menu.path))?.key || '';
  
  // 创建动态菜单项
  const menuItems = createMenuItems(filteredMenus);
  
  console.log('AppLayout - selectedKey:', selectedKey, 'menuItems:', menuItems);
  
  return (
    <Layout style={{ minHeight: '100vh', width: '100vw' }}>
      <Sider width={200} style={{ background: '#fff', overflow: 'hidden' }}>
        <div style={{ height: 32, margin: 16, color: '#1890ff', fontWeight: 'bold', fontSize: 18 }}>菜单栏</div>
        {loading ? (
          <div style={{ padding: 16, textAlign: 'center' }}>加载中...</div>
        ) : (
          <div>
            <div style={{ padding: 8, fontSize: 12, color: '#666' }}>
              调试信息: 菜单项数量 = {menuItems.length}
            </div>
            <Menu 
              mode="inline" 
              selectedKeys={[selectedKey]} 
              style={{ height: '100%', borderRight: 0 }} 
              items={menuItems}
            />
          </div>
        )}
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ fontSize: 20, fontWeight: 'bold' }}>
            内容发布管理平台
          </div>
          <UserMenu />
        </Header>
        <Content style={{
          margin: '0',
          background: '#fff',
          padding: 24,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          flex: 1,
        }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            } />
            <Route path="/test" element={<TestPage />} />
            <Route path="/ai-test" element={<AITestPage />} />
            <Route path="/config" element={
              <ProtectedRoute>
                <ConfigPage />
              </ProtectedRoute>
            } />
            <Route path="/compliance" element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            } />
            <Route path="/compliance/new" element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            } />
            <Route path="/compliance/:spu_id" element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            } />
            <Route path="/product" element={
              <ProtectedRoute>
                <ProductPage />
              </ProtectedRoute>
            } />
            <Route path="/gallery" element={
              <ProtectedRoute>
                <GalleryPage />
              </ProtectedRoute>
            } />
            <Route path="/files" element={
              <ProtectedRoute>
                <FileManager />
              </ProtectedRoute>
            } />
            {/* 文章管理模块路由 */}
            <Route path="/articles" element={
              <ProtectedRoute>
                <RoleProtectedRoute path="/articles" requiredRoles={['ADMIN', 'REVIEWER']}>
                  <ArticleList />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/articles/new" element={
              <ProtectedRoute>
                <RoleProtectedRoute path="/articles/new" requiredRoles={['ADMIN', 'REVIEWER']}>
                  <ArticleEditor mode="create" />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/articles/:id" element={
              <ProtectedRoute>
                <RoleProtectedRoute path="/articles" requiredRoles={['ADMIN', 'REVIEWER']}>
                  <ArticleDetail />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/articles/:id/edit" element={
              <ProtectedRoute>
                <RoleProtectedRoute path="/articles" requiredRoles={['ADMIN', 'REVIEWER']}>
                  <ArticleEditor mode="edit" />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/my-posts" element={
              <ProtectedRoute>
                <RoleProtectedRoute path="/my-posts" requiredRoles={['ADMIN', 'STUDENT']}>
                  <MyPosts />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/review" element={
              <ProtectedRoute>
                <RoleProtectedRoute path="/review" requiredRoles={['ADMIN', 'REVIEWER']}>
                  <ArticleReview />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <RoleProtectedRoute path="/users" requiredRoles={['ADMIN']}>
                  <UserManagement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/unpublished" element={
              <ProtectedRoute>
                <UnpublishedRecordsPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            } />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalNotificationProvider>
          <ProductListProvider>
            <UnpublishedRecordsProvider>
              <ProductSearchProvider>
                <AppLayout />
                {/* 添加 stagewise 工具栏 - 仅在开发模式下显示 */}
                <StagewiseToolbar 
                  config={{
                    plugins: [ReactPlugin]
                  }}
                  enabled={false}
                />
              </ProductSearchProvider>
            </UnpublishedRecordsProvider>
          </ProductListProvider>
        </GlobalNotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
