import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Input,
    Select,
    Modal,
    Form,
    message,
    Popconfirm,
    Tag,
    Card,
    Row,
    Col,
    InputNumber,
    Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import type {
    Doctor,
    DoctorCreateRequest,
    DoctorUpdateRequest,
    DoctorQueryParams,
    DoctorStatus
} from '../../types/doctor';
import {
    DOCTOR_STATUS,
    DOCTOR_STATUS_TEXT,
    TITLE_OPTIONS,
    LEVEL_OPTIONS,
    DEPARTMENT_OPTIONS
} from '../../types/doctor';
import {
    getDoctorList,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    batchDeleteDoctors,
    getDoctorDepartments,
    getDoctorHospitals,
    checkBaijiahaoIdExists
} from '../../api/doctor';

const { Option } = Select;
const { Title } = Typography;

const DoctorManagement: React.FC = () => {
    // 状态管理
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    
    // 搜索参数
    const [searchParams, setSearchParams] = useState<DoctorQueryParams>({});
    
    // 模态框状态
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    
    // 下拉选项数据
    const [departments, setDepartments] = useState<string[]>([]);
    const [hospitals, setHospitals] = useState<string[]>([]);
    
    // 表单
    const [form] = Form.useForm();

    // 初始化
    useEffect(() => {
        fetchDoctors();
        fetchDepartments();
        fetchHospitals();
    }, [currentPage, pageSize]);

    // 获取医生列表
    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const params = {
                ...searchParams,
                page: currentPage,
                pageSize
            };
            const response = await getDoctorList(params);
            setDoctors(response.doctors);
            setTotal(response.total);
        } catch (error) {
            message.error('获取医生列表失败: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // 获取科室列表
    const fetchDepartments = async () => {
        try {
            const data = await getDoctorDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('获取科室列表失败:', error);
        }
    };

    // 获取医院列表
    const fetchHospitals = async () => {
        try {
            const data = await getDoctorHospitals();
            setHospitals(data);
        } catch (error) {
            console.error('获取医院列表失败:', error);
        }
    };

    // 搜索
    const handleSearch = () => {
        setCurrentPage(1);
        fetchDoctors();
    };

    // 重置搜索
    const handleReset = () => {
        setSearchParams({});
        setCurrentPage(1);
        // 清空搜索表单
        const searchForm = document.querySelectorAll('.search-form input, .search-form .ant-select-selection-search-input');
        searchForm.forEach((input: any) => {
            input.value = '';
        });
        fetchDoctors();
    };

    // 新增医生
    const handleAdd = () => {
        setEditingDoctor(null);
        setModalVisible(true);
        form.resetFields();
        form.setFieldsValue({
            status: DOCTOR_STATUS.ENABLED,
            dailyPublishLimit: 3
        });
    };

    // 编辑医生
    const handleEdit = (doctor: Doctor) => {
        setEditingDoctor(doctor);
        setModalVisible(true);
        form.setFieldsValue({
            baijiahaoId: doctor.baijiahaoId,
            baijiahaoAccount: doctor.baijiahaoAccount,
            name: doctor.name,
            hospital: doctor.hospital,
            title: doctor.title,
            department: doctor.department,
            level: doctor.level,
            dailyPublishLimit: doctor.dailyPublishLimit,
            status: doctor.status
        });
    };

    // 删除医生
    const handleDelete = async (id: number) => {
        try {
            await deleteDoctor(id);
            message.success('删除成功');
            fetchDoctors();
        } catch (error) {
            message.error('删除失败: ' + (error as Error).message);
        }
    };

    // 批量删除
    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选择要删除的医生');
            return;
        }

        try {
            await batchDeleteDoctors(selectedRowKeys as number[]);
            message.success('批量删除成功');
            setSelectedRowKeys([]);
            fetchDoctors();
        } catch (error) {
            message.error('批量删除失败: ' + (error as Error).message);
        }
    };

    // 提交表单
    const handleSubmit = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();

            setModalLoading(true);

            if (editingDoctor) {
                // 编辑模式
                const updateData: DoctorUpdateRequest = {
                    baijiahaoAccount: values.baijiahaoAccount,
                    name: values.name,
                    hospital: values.hospital,
                    title: values.title,
                    department: values.department,
                    level: values.level,
                    dailyPublishLimit: values.dailyPublishLimit,
                    status: values.status
                };
                await updateDoctor(editingDoctor.id, updateData);
                message.success('更新医生信息成功');
            } else {
                // 新增模式
                const createData: DoctorCreateRequest = {
                    baijiahaoId: values.baijiahaoId,
                    baijiahaoAccount: values.baijiahaoAccount,
                    name: values.name,
                    hospital: values.hospital,
                    title: values.title,
                    department: values.department,
                    level: values.level,
                    dailyPublishLimit: values.dailyPublishLimit
                };
                await createDoctor(createData);
                message.success('创建医生成功');
            }

            setModalVisible(false);
            form.resetFields();
            fetchDoctors();
        } catch (error) {
            message.error('操作失败: ' + (error as Error).message);
        } finally {
            setModalLoading(false);
        }
    };

    // 检查百家号ID是否已存在
    const checkBaijiahaoId = async (baijiahaoId: string) => {
        if (!baijiahaoId || (editingDoctor && baijiahaoId === editingDoctor.baijiahaoId)) {
            return;
        }

        try {
            const exists = await checkBaijiahaoIdExists(baijiahaoId);
            if (exists) {
                return Promise.reject(new Error('百家号ID已存在'));
            }
        } catch (error) {
            return Promise.reject(new Error('检查百家号ID失败'));
        }
    };

    // 表格列定义
    const columns: ColumnsType<Doctor> = [
        {
            title: '医生姓名',
            dataIndex: 'name',
            key: 'name',
            width: 100,
        },
        {
            title: '百家号ID',
            dataIndex: 'baijiahaoId',
            key: 'baijiahaoId',
            width: 120,
        },
        {
            title: '百家号账号',
            dataIndex: 'baijiahaoAccount',
            key: 'baijiahaoAccount',
            width: 150,
        },
        {
            title: '医院',
            dataIndex: 'hospital',
            key: 'hospital',
            width: 150,
        },
        {
            title: '科室',
            dataIndex: 'department',
            key: 'department',
            width: 100,
        },
        {
            title: '职称',
            dataIndex: 'title',
            key: 'title',
            width: 100,
        },
        {
            title: '职级',
            dataIndex: 'level',
            key: 'level',
            width: 80,
        },
        {
            title: '发布上限',
            dataIndex: 'dailyPublishLimit',
            key: 'dailyPublishLimit',
            width: 100,
            render: (limit: number) => `${limit}篇/天`
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (status: DoctorStatus) => (
                <Tag color={status === DOCTOR_STATUS.ENABLED ? 'green' : 'red'}>
                    {DOCTOR_STATUS_TEXT[status]}
                </Tag>
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (time: string) => new Date(time).toLocaleString()
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这个医生吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>医生管理</Title>
            
            {/* 搜索区域 */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} className="search-form">
                    <Col span={6}>
                        <Input
                            placeholder="医生姓名"
                            value={searchParams.name}
                            onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                            allowClear
                        />
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="选择医院"
                            value={searchParams.hospital}
                            onChange={(value) => setSearchParams({ ...searchParams, hospital: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {hospitals.map(hospital => (
                                <Option key={hospital} value={hospital}>{hospital}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="选择科室"
                            value={searchParams.department}
                            onChange={(value) => setSearchParams({ ...searchParams, department: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {departments.map(dept => (
                                <Option key={dept} value={dept}>{dept}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="选择状态"
                            value={searchParams.status}
                            onChange={(value) => setSearchParams({ ...searchParams, status: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Option value={DOCTOR_STATUS.ENABLED}>启用</Option>
                            <Option value={DOCTOR_STATUS.DISABLED}>禁用</Option>
                        </Select>
                    </Col>
                </Row>
                <Row style={{ marginTop: 16 }}>
                    <Col>
                        <Space>
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleSearch}
                            >
                                搜索
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleReset}
                            >
                                重置
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* 操作按钮 */}
            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        新增医生
                    </Button>
                    <Popconfirm
                        title="确定要批量删除选中的医生吗？"
                        onConfirm={handleBatchDelete}
                        disabled={selectedRowKeys.length === 0}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            disabled={selectedRowKeys.length === 0}
                        >
                            批量删除 ({selectedRowKeys.length})
                        </Button>
                    </Popconfirm>
                </Space>
            </div>

            {/* 医生列表表格 */}
            <Table
                columns={columns}
                dataSource={doctors}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1200 }}
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size || 20);
                    },
                }}
            />

            {/* 新增/编辑医生模态框 */}
            <Modal
                title={editingDoctor ? '编辑医生' : '新增医生'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                confirmLoading={modalLoading}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: DOCTOR_STATUS.ENABLED,
                        dailyPublishLimit: 3
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="baijiahaoId"
                                label="百家号ID"
                                rules={[
                                    { required: true, message: '请输入百家号ID' },
                                    { validator: (_, value) => checkBaijiahaoId(value) }
                                ]}
                            >
                                <Input
                                    placeholder="请输入百家号ID"
                                    disabled={!!editingDoctor}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="baijiahaoAccount"
                                label="百家号账号"
                                rules={[{ required: true, message: '请输入百家号账号' }]}
                            >
                                <Input placeholder="请输入百家号账号" />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="医生姓名"
                                rules={[{ required: true, message: '请输入医生姓名' }]}
                            >
                                <Input placeholder="请输入医生姓名" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="hospital"
                                label="医院"
                                rules={[{ required: true, message: '请输入医院' }]}
                            >
                                <Input placeholder="请输入医院名称" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="title"
                                label="职称"
                                rules={[{ required: true, message: '请选择职称' }]}
                            >
                                <Select placeholder="请选择职称">
                                    {TITLE_OPTIONS.map(title => (
                                        <Option key={title} value={title}>{title}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="department"
                                label="科室"
                                rules={[{ required: true, message: '请选择科室' }]}
                            >
                                <Select placeholder="请选择科室">
                                    {DEPARTMENT_OPTIONS.map(dept => (
                                        <Option key={dept} value={dept}>{dept}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="level"
                                label="职级"
                                rules={[{ required: true, message: '请选择职级' }]}
                            >
                                <Select placeholder="请选择职级">
                                    {LEVEL_OPTIONS.map(level => (
                                        <Option key={level} value={level}>{level}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="dailyPublishLimit"
                                label="每日发布上限"
                                rules={[
                                    { required: true, message: '请输入每日发布上限' },
                                    { type: 'number', min: 1, max: 100, message: '请输入1-100之间的数字' }
                                ]}
                            >
                                <InputNumber
                                    placeholder="请输入每日发布上限"
                                    min={1}
                                    max={100}
                                    style={{ width: '100%' }}
                                    addonAfter="篇/天"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="状态"
                                rules={[{ required: true, message: '请选择状态' }]}
                            >
                                <Select placeholder="请选择状态">
                                    <Option value={DOCTOR_STATUS.ENABLED}>启用</Option>
                                    <Option value={DOCTOR_STATUS.DISABLED}>禁用</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default DoctorManagement;
