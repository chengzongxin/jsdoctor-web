import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Button, 
    Space, 
    Modal, 
    Form, 
    Input, 
    Select, 
    message, 
    Table,
    Tag,
    Popconfirm
} from 'antd';
import { 
    PlusOutlined, 
    UserAddOutlined,
    DeleteOutlined,
    EditOutlined
} from '@ant-design/icons';
import { userAPI } from '../../api/article';
import type { UserRole, UserRoleRelation, UserCreateRequest, User } from '../../types/article';

const { Option } = Select;

const UserManagement: React.FC = () => {
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [userRoles, setUserRoles] = useState<Map<number, UserRoleRelation[]>>(new Map());
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userType, setUserType] = useState<'student' | 'reviewer'>('student');

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

    // 获取所有角色
    const fetchRoles = async () => {
        try {
            const data = await userAPI.getAllRoles();
            setRoles(data);
        } catch (error) {
            message.error('获取角色列表失败');
        }
    };

    // 获取所有用户
    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const data = await userAPI.getAllUsers();
            setUsers(data);
            
            // 获取每个用户的角色信息
            const rolesMap = new Map<number, UserRoleRelation[]>();
            for (const user of data) {
                try {
                    const userDetail = await userAPI.getUserDetail(user.id);
                    rolesMap.set(user.id, userDetail.roles);
                } catch (error) {
                    console.error(`获取用户 ${user.id} 角色失败:`, error);
                    rolesMap.set(user.id, []);
                }
            }
            setUserRoles(rolesMap);
        } catch (error) {
            message.error('获取用户列表失败');
        } finally {
            setUsersLoading(false);
        }
    };

    // 打开创建用户模态框
    const openCreateModal = (type: 'student' | 'reviewer') => {
        setUserType(type);
        setCreateModalVisible(true);
        createForm.resetFields();
    };

    // 关闭创建用户模态框
    const closeCreateModal = () => {
        setCreateModalVisible(false);
        createForm.resetFields();
    };

    // 创建用户
    const handleCreateUser = async (values: UserCreateRequest) => {
        try {
            setLoading(true);
            
            if (userType === 'student') {
                await userAPI.createStudent(values);
                message.success('学生账号创建成功');
            } else {
                await userAPI.createReviewer(values);
                message.success('审核员账号创建成功');
            }
            
            closeCreateModal();
            // 刷新用户列表
            fetchUsers();
        } catch (error) {
            message.error('创建用户失败');
        } finally {
            setLoading(false);
        }
    };

    // 用户列表表格列定义
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            width: 120,
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            width: 200,
        },
        {
            title: '状态',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 100,
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? '激活' : '禁用'}
                </Tag>
            ),
        },
        {
            title: '管理员',
            dataIndex: 'is_admin',
            key: 'is_admin',
            width: 100,
            render: (isAdmin: boolean) => (
                <Tag color={isAdmin ? 'blue' : 'default'}>
                    {isAdmin ? '是' : '否'}
                </Tag>
                ),
        },
        {
            title: '角色',
            key: 'roles',
            width: 200,
            render: (_: any, record: User) => {
                const roles = userRoles.get(record.id) || [];
                return (
                    <Space wrap>
                        {roles.map((role) => (
                            <Tag key={role.id} color="purple">
                                {role.roleName}
                            </Tag>
                        ))}
                        {roles.length === 0 && (
                            <span style={{ color: '#999' }}>无角色</span>
                        )}
                    </Space>
                );
            },
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: User) => (
                <Space size="small">
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditUser(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这个用户吗？"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 编辑用户
    const handleEditUser = (user: User) => {
        message.info('编辑用户功能待实现');
    };

    // 删除用户
    const handleDeleteUser = async (userId: number) => {
        message.info('删除用户功能待实现');
    };

    return (
        <div style={{ padding: 24 }}>
            <Card title="用户管理" extra={
                <Space>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => openCreateModal('student')}
                    >
                        创建学生账号
                    </Button>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => openCreateModal('reviewer')}
                    >
                        创建审核员账号
                    </Button>
                </Space>
            }>
                {/* 用户列表表格 */}
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={usersLoading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* 创建用户模态框 */}
            <Modal
                title={`创建${userType === 'student' ? '学生' : '审核员'}账号`}
                open={createModalVisible}
                onCancel={closeCreateModal}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateUser}
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[
                            { required: true, message: '请输入用户名' },
                            { min: 3, message: '用户名至少3个字符' }
                        ]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入正确的邮箱格式' }
                        ]}
                    >
                        <Input placeholder="请输入邮箱" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[
                            { required: true, message: '请输入密码' },
                            { min: 6, message: '密码至少6个字符' }
                        ]}
                    >
                        <Input.Password placeholder="请输入密码" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: '请确认密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="请确认密码" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button onClick={closeCreateModal}>
                                取消
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit"
                                loading={loading}
                            >
                                创建账号
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
