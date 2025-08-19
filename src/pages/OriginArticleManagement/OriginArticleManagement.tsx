import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Upload,
    Modal,
    Form,
    Input,
    Select,
    Space,
    Tag,
    Popconfirm,
    message,
    Typography,
    Divider,
    Alert,
    Progress,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    UploadOutlined,
    SearchOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload';
import type { 
    OriginArticle, 
    OriginArticleImportResult, 
    OriginArticleQueryParams,
    OriginArticleStatus
} from '../../types/originArticle';
import {
    ORIGIN_ARTICLE_STATUS
} from '../../types/originArticle';
import {
    getOriginArticleList,
    importExcelFile,
    deleteOriginArticle,
    deleteOriginArticles,
    updateOriginArticle,
    getDepartments
} from '../../api/originArticle';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const OriginArticleManagement: React.FC = () => {
    // 状态管理
    const [articles, setArticles] = useState<OriginArticle[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    
    // 分页和筛选
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchParams, setSearchParams] = useState<OriginArticleQueryParams>({});
    
    // 弹窗状态
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<OriginArticle | null>(null);
    
    // 导入结果
    const [importResult, setImportResult] = useState<OriginArticleImportResult | null>(null);
    const [importProgress, setImportProgress] = useState(0);
    
    // 表单
    const [searchForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // 初始化数据
    useEffect(() => {
        fetchArticles();
        fetchDepartments();
    }, [currentPage, pageSize, searchParams]);

    // 获取文章列表
    const fetchArticles = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                pageSize,
                ...searchParams
            };
            const response = await getOriginArticleList(params);
            setArticles(response.articles);
            setTotal(response.total);
        } catch (error) {
            message.error('获取文章列表失败: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // 获取科室列表
    const fetchDepartments = async () => {
        try {
            const depts = await getDepartments();
            setDepartments(depts);
        } catch (error) {
            console.error('获取科室列表失败:', error);
        }
    };

    // 搜索处理
    const handleSearch = () => {
        const values = searchForm.getFieldsValue();
        setSearchParams(values);
        setCurrentPage(1);
    };

    // 重置搜索
    const handleReset = () => {
        searchForm.resetFields();
        setSearchParams({});
        setCurrentPage(1);
    };

    // Excel导入处理
    const handleImport = async (file: File) => {
        try {
            setUploading(true);
            setImportProgress(0);

            // 检查文件类型
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                message.error('请选择Excel文件（.xlsx 或 .xls 格式）');
                setUploading(false);
                return false;
            }

            // 模拟进度
            const progressInterval = setInterval(() => {
                setImportProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const result = await importExcelFile(file);
            
            clearInterval(progressInterval);
            setImportProgress(100);

            if (typeof result === 'string') {
                message.success(result);
                setImportResult(null);
            } else {
                setImportResult(result);
            }

            // 刷新列表
            fetchArticles();
            setImportModalVisible(false);
            
        } catch (error) {
            message.error('导入失败: ' + (error as Error).message);
        } finally {
            setUploading(false);
            setTimeout(() => setImportProgress(0), 1000);
        }
        
        return false; // 阻止自动上传
    };

    // 删除文章
    const handleDelete = async (id: number) => {
        try {
            await deleteOriginArticle(id);
            message.success('删除成功');
            fetchArticles();
        } catch (error) {
            message.error('删除失败: ' + (error as Error).message);
        }
    };

    // 批量删除
    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选择要删除的文章');
            return;
        }

        try {
            await deleteOriginArticles(selectedRowKeys as number[]);
            message.success('批量删除成功');
            setSelectedRowKeys([]);
            fetchArticles();
        } catch (error) {
            message.error('批量删除失败: ' + (error as Error).message);
        }
    };

    // 编辑文章
    const handleEdit = (article: OriginArticle) => {
        setCurrentArticle(article);
        editForm.setFieldsValue(article);
        setEditModalVisible(true);
    };

    // 查看详情
    const handleViewDetail = (article: OriginArticle) => {
        setCurrentArticle(article);
        setDetailModalVisible(true);
    };

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields();
            if (currentArticle) {
                await updateOriginArticle(currentArticle.id, values);
                message.success('更新成功');
                setEditModalVisible(false);
                fetchArticles();
            }
        } catch (error) {
            message.error('更新失败: ' + (error as Error).message);
        }
    };

    // 状态标签渲染
    const renderStatusTag = (status: OriginArticleStatus) => {
        if (status === ORIGIN_ARTICLE_STATUS.ENABLED) {
            return <Tag color="green">可用</Tag>;
        } else {
            return <Tag color="red">禁用</Tag>;
        }
    };

    // 表格列定义
    const columns: ColumnsType<OriginArticle> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            width: 200,
            render: (text: string, record: OriginArticle) => (
                <Button type="link" onClick={() => handleViewDetail(record)}>
                    {text}
                </Button>
            ),
        },
        {
            title: '医生',
            dataIndex: 'doctor',
            key: 'doctor',
            width: 120,
        },
        {
            title: '职位',
            dataIndex: 'position',
            key: 'position',
            width: 120,
        },
        {
            title: '科室',
            dataIndex: 'department',
            key: 'department',
            width: 120,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: renderStatusTag,
        },
        {
            title: '导入人',
            dataIndex: 'importedByUsername',
            key: 'importedByUsername',
            width: 120,
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (text: string) => new Date(text).toLocaleString(),
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record: OriginArticle) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                    >
                        查看
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这篇文章吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
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

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>原始文章管理</Title>
            <Paragraph type="secondary">
                管理从Excel导入的原始文章数据，支持导入、编辑、删除等操作。
            </Paragraph>

            {/* 统计信息 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic title="总文章数" value={total} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="可用文章" value={articles.filter(a => a.status === ORIGIN_ARTICLE_STATUS.ENABLED).length} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="科室数量" value={departments.length} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="已选择" value={selectedRowKeys.length} />
                    </Card>
                </Col>
            </Row>

            {/* 搜索和操作区域 */}
            <Card style={{ marginBottom: 24 }}>
                <Form form={searchForm} layout="inline" onFinish={handleSearch}>
                    <Form.Item name="title" label="标题">
                        <Input placeholder="搜索标题" allowClear style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item name="department" label="科室">
                        <Select placeholder="选择科室" allowClear style={{ width: 150 }}>
                            {departments.map(dept => (
                                <Option key={dept} value={dept}>{dept}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                        <Select placeholder="选择状态" allowClear style={{ width: 120 }}>
                            <Option value={ORIGIN_ARTICLE_STATUS.ENABLED}>可用</Option>
                            <Option value={ORIGIN_ARTICLE_STATUS.DISABLED}>禁用</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                搜索
                            </Button>
                            <Button onClick={handleReset} icon={<ReloadOutlined />}>
                                重置
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>

                <Divider />

                <Space>
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => setImportModalVisible(true)}
                    >
                        导入Excel
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleBatchDelete}
                        disabled={selectedRowKeys.length === 0}
                    >
                        批量删除 ({selectedRowKeys.length})
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={fetchArticles}>
                        刷新
                    </Button>
                </Space>
            </Card>

            {/* 表格 */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={articles}
                    rowKey="id"
                    loading={loading}
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
                        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size || 20);
                        },
                    }}
                />
            </Card>

            {/* Excel导入弹窗 */}
            <Modal
                title="导入Excel文件"
                open={importModalVisible}
                onCancel={() => setImportModalVisible(false)}
                footer={null}
                width={600}
            >
                <Alert
                    message="Excel格式要求"
                    description={
                        <div>
                            <p>请确保Excel文件包含以下列（按顺序）：</p>
                            <ol>
                                <li>search_title (搜索标题)</li>
                                <li>title (标题)</li>
                                <li>doctor (医生)</li>
                                <li>position (职位)</li>
                                <li>department (科室)</li>
                                <li>content (内容)</li>
                            </ol>
                            <p>仅支持 .xlsx 格式文件</p>
                        </div>
                    }
                    type="info"
                    style={{ marginBottom: 16 }}
                />

                {importProgress > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <Text>导入进度：</Text>
                        <Progress percent={importProgress} />
                    </div>
                )}

                <Upload
                    accept=".xlsx,.xls"
                    beforeUpload={handleImport}
                    showUploadList={false}
                    disabled={uploading}
                >
                    <Button icon={<UploadOutlined />} loading={uploading} block>
                        {uploading ? '导入中...' : '选择Excel文件'}
                    </Button>
                </Upload>

                {importResult && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            message="导入结果"
                            description={
                                <div>
                                    <p>总记录数: {importResult.totalCount}</p>
                                    <p>成功: {importResult.successCount}</p>
                                    <p>失败: {importResult.failureCount}</p>
                                    {importResult.failureReasons.length > 0 && (
                                        <div>
                                            <p>失败原因:</p>
                                            <ul>
                                                {importResult.failureReasons.map((reason, index) => (
                                                    <li key={index}>{reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            }
                            type={importResult.failureCount > 0 ? 'warning' : 'success'}
                        />
                    </div>
                )}
            </Modal>

            {/* 编辑弹窗 */}
            <Modal
                title="编辑文章"
                open={editModalVisible}
                onOk={handleSaveEdit}
                onCancel={() => setEditModalVisible(false)}
                width={800}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item name="searchTitle" label="搜索标题">
                        <Input />
                    </Form.Item>
                    <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="doctor" label="医生">
                        <Input />
                    </Form.Item>
                    <Form.Item name="position" label="职位">
                        <Input />
                    </Form.Item>
                    <Form.Item name="department" label="科室">
                        <Input />
                    </Form.Item>
                    <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
                        <Select>
                            <Option value={ORIGIN_ARTICLE_STATUS.ENABLED}>可用</Option>
                            <Option value={ORIGIN_ARTICLE_STATUS.DISABLED}>禁用</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
                        <TextArea rows={6} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 详情弹窗 */}
            <Modal
                title="文章详情"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        关闭
                    </Button>
                ]}
                width={800}
            >
                {currentArticle && (
                    <div>
                        <Title level={4}>{currentArticle.title}</Title>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>搜索标题：</Text> {currentArticle.searchTitle}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>医生：</Text> {currentArticle.doctor} 
                            <Text strong style={{ marginLeft: 16 }}>职位：</Text> {currentArticle.position}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>科室：</Text> {currentArticle.department}
                            <Text strong style={{ marginLeft: 16 }}>状态：</Text> {renderStatusTag(currentArticle.status as OriginArticleStatus)}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>导入人：</Text> {currentArticle.importedByUsername}
                            <Text strong style={{ marginLeft: 16 }}>创建时间：</Text> {new Date(currentArticle.createdAt).toLocaleString()}
                        </div>
                        <Divider />
                        <div>
                            <Text strong>内容：</Text>
                            <div style={{ marginTop: 8, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                                    {currentArticle.content}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OriginArticleManagement;
