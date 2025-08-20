import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Input,
    Select,
    Modal,
    message,
    Card,
    Row,
    Col,
    Tag,
    Tooltip,
    DatePicker,
    Statistic,
    Popconfirm,
    Drawer,
    Descriptions,
    Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    SearchOutlined,
    ReloadOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
    EyeOutlined,
    FilterOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type {
    ContentManagementItem,
    ContentManagementQuery,
    ContentManagementStats,
    DoctorAssignmentRequest,
    ArticleStatus
} from '../../types/contentManagement';
import {
    ARTICLE_STATUS,
    ARTICLE_STATUS_TEXT,
    ARTICLE_STATUS_COLOR,
    SORT_FIELD_OPTIONS,
    ASSIGNMENT_STATUS_OPTIONS
} from '../../types/contentManagement';
import type { Doctor } from '../../types/doctor';
import {
    getContentList,
    getContentItem,
    batchAssignDoctor,
    unassignDoctor,
    getContentStats
} from '../../api/contentManagement';
import { getEnabledDoctors } from '../../api/doctor';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const ContentManagement: React.FC = () => {
    // 状态管理
    const [items, setItems] = useState<ContentManagementItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    
    // 搜索参数
    const [searchParams, setSearchParams] = useState<ContentManagementQuery>({});
    
    // 统计信息
    const [stats, setStats] = useState<ContentManagementStats | null>(null);
    const [statsVisible, setStatsVisible] = useState(false);
    
    // 医生分派相关
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
    
    // 详情查看
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<ContentManagementItem | null>(null);
    
    // 高级筛选
    const [filterVisible, setFilterVisible] = useState(false);

    // 初始化
    useEffect(() => {
        fetchContentList();
        fetchDoctors();
        fetchStats();
    }, [currentPage, pageSize]);

    // 获取内容列表
    const fetchContentList = async () => {
        try {
            setLoading(true);
            const params = {
                ...searchParams,
                page: currentPage,
                pageSize
            };
            const response = await getContentList(params);
            setItems(response.items);
            setTotal(response.total);
            if (response.stats) {
                setStats(response.stats);
            }
        } catch (error) {
            message.error('获取内容列表失败: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // 获取医生列表
    const fetchDoctors = async () => {
        try {
            const data = await getEnabledDoctors();
            setDoctors(data);
        } catch (error) {
            console.error('获取医生列表失败:', error);
        }
    };

    // 获取统计信息
    const fetchStats = async () => {
        try {
            const data = await getContentStats();
            setStats(data);
        } catch (error) {
            console.error('获取统计信息失败:', error);
        }
    };

    // 搜索
    const handleSearch = () => {
        setCurrentPage(1);
        fetchContentList();
    };

    // 重置搜索
    const handleReset = () => {
        setSearchParams({});
        setCurrentPage(1);
        fetchContentList();
    };

    // 查看详情
    const handleViewDetail = async (articleId: number) => {
        try {
            const item = await getContentItem(articleId);
            setCurrentItem(item);
            setDetailVisible(true);
        } catch (error) {
            message.error('获取详情失败: ' + (error as Error).message);
        }
    };

    // 打开分派医生对话框
    const handleAssignDoctor = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选择要分派的文章');
            return;
        }
        setSelectedDoctorId(null);
        setAssignModalVisible(true);
    };

    // 确认分派医生
    const handleConfirmAssign = async () => {
        try {
            setAssignLoading(true);
            
            // 获取选中行对应的articleId
            const selectedArticleIds = items
                .filter(item => selectedRowKeys.includes(item.originArticleId) && item.articleId)
                .map(item => item.articleId!);
                
            if (selectedArticleIds.length === 0) {
                message.warning('选中的原始文章中没有已创建的文章');
                return;
            }
            
            const request: DoctorAssignmentRequest = {
                articleIds: selectedArticleIds,
                doctorId: selectedDoctorId
            };
            await batchAssignDoctor(request);
            message.success('分派医生成功');
            setAssignModalVisible(false);
            setSelectedRowKeys([]);
            fetchContentList();
            fetchStats();
        } catch (error) {
            message.error('分派医生失败: ' + (error as Error).message);
        } finally {
            setAssignLoading(false);
        }
    };

    // 取消分派
    const handleUnassign = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选择要取消分派的文章');
            return;
        }

        try {
            // 获取选中行对应的articleId
            const selectedArticleIds = items
                .filter(item => selectedRowKeys.includes(item.originArticleId) && item.articleId)
                .map(item => item.articleId!);
                
            if (selectedArticleIds.length === 0) {
                message.warning('选中的原始文章中没有已创建的文章');
                return;
            }

            await unassignDoctor(selectedArticleIds);
            message.success('取消分派成功');
            setSelectedRowKeys([]);
            fetchContentList();
            fetchStats();
        } catch (error) {
            message.error('取消分派失败: ' + (error as Error).message);
        }
    };

    // 表格列定义 - 按用户要求的顺序：原始表创建时间、原标题、文章标题、学生、分派医生、医生科室、审核状态、审核时间、审核人、发布状态
    const columns: ColumnsType<ContentManagementItem> = [
        {
            title: '原文创建时间',
            dataIndex: 'originArticleCreatedAt',
            key: 'originArticleCreatedAt',
            width: 150,
            render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm')
        },
        {
            title: '原文标题',
            dataIndex: 'originArticleTitle',
            key: 'originArticleTitle',
            width: 200,
            ellipsis: {
                showTitle: false,
            },
            render: (title: string, record) => (
                <Tooltip title={title}>
                    <Text ellipsis style={{ maxWidth: 180, display: 'block' }}>
                        {title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.originArticleDepartment || '无科室'}
                    </Text>
                </Tooltip>
            )
        },
        {
            title: '文章标题',
            dataIndex: 'articleTitle',
            key: 'articleTitle',
            width: 200,
            ellipsis: {
                showTitle: false,
            },
            render: (title: string | null, record) => (
                title ? (
                    <Tooltip title={title}>
                        <Button
                            type="link"
                            onClick={() => record.articleId && handleViewDetail(record.articleId)}
                            style={{ padding: 0, textAlign: 'left' }}
                        >
                            {title}
                        </Button>
                    </Tooltip>
                ) : (
                    <Text type="secondary">未创建文章</Text>
                )
            )
        },
        {
            title: '学生(作者)',
            dataIndex: 'authorName',
            key: 'authorName',
            width: 100,
            render: (name: string | null) => name || <Text type="secondary">-</Text>
        },
        {
            title: '分派医生',
            key: 'assignedDoctor',
            width: 150,
            render: (_, record) => (
                <div>
                    {record.isAssigned ? (
                        <div>
                            <Text strong>{record.assignedDoctorName}</Text>
                        </div>
                    ) : (
                        <Tag color="default">未分派</Tag>
                    )}
                </div>
            )
        },
        {
            title: '医生科室',
            key: 'doctorDepartment',
            width: 120,
            render: (_, record) => (
                record.assignedDoctorDepartment ? (
                    <Text>{record.assignedDoctorDepartment}</Text>
                ) : (
                    <Text type="secondary">-</Text>
                )
            )
        },
        {
            title: '审核状态',
            dataIndex: 'articleStatus',
            key: 'articleStatus',
            width: 100,
            render: (status: ArticleStatus | null, record) => (
                status !== null ? (
                    <Tag color={ARTICLE_STATUS_COLOR[status]}>
                        {ARTICLE_STATUS_TEXT[status]}
                    </Tag>
                ) : (
                    <Tag color="default">未创建文章</Tag>
                )
            )
        },
        {
            title: '审核时间',
            dataIndex: 'articleReviewedAt',
            key: 'articleReviewedAt',
            width: 150,
            render: (time: string | null) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
        },
        {
            title: '审核人',
            dataIndex: 'reviewerName',
            key: 'reviewerName',
            width: 100,
            render: (name: string | null) => name || <Text type="secondary">-</Text>
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
                        icon={<EyeOutlined />}
                        onClick={() => record.articleId && handleViewDetail(record.articleId)}
                    >
                        详情
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>内容管理</Title>

            {/* 统计卡片 */}
            {stats && (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic title="总文章数" value={stats.totalArticles} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="已通过" value={stats.approvedArticles} valueStyle={{ color: '#3f8600' }} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="已分派" value={stats.assignedArticles} valueStyle={{ color: '#1890ff' }} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="未分派" value={stats.unassignedArticles} valueStyle={{ color: '#cf1322' }} />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* 搜索区域 */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Input
                            placeholder="文章标题"
                            value={searchParams.articleTitle}
                            onChange={(e) => setSearchParams({ ...searchParams, articleTitle: e.target.value })}
                            allowClear
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="审核状态"
                            value={searchParams.articleStatus}
                            onChange={(value) => setSearchParams({ ...searchParams, articleStatus: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Option value={ARTICLE_STATUS.SUBMITTED}>已提交</Option>
                            <Option value={ARTICLE_STATUS.REVIEWING}>审核中</Option>
                            <Option value={ARTICLE_STATUS.APPROVED}>已通过</Option>
                            <Option value={ARTICLE_STATUS.REJECTED}>已拒绝</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="分派状态"
                            value={searchParams.isAssigned}
                            onChange={(value) => setSearchParams({ ...searchParams, isAssigned: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {ASSIGNMENT_STATUS_OPTIONS.map(option => (
                                <Option key={String(option.value)} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Input
                            placeholder="医生姓名"
                            value={searchParams.assignedDoctorName}
                            onChange={(e) => setSearchParams({ ...searchParams, assignedDoctorName: e.target.value })}
                            allowClear
                        />
                    </Col>
                    <Col span={4}>
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
                        icon={<UserAddOutlined />}
                        onClick={handleAssignDoctor}
                        disabled={selectedRowKeys.length === 0}
                    >
                        分派医生 ({selectedRowKeys.length})
                    </Button>
                    <Popconfirm
                        title="确定要取消选中文章的医生分派吗？"
                        onConfirm={handleUnassign}
                        disabled={selectedRowKeys.length === 0}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            icon={<UserDeleteOutlined />}
                            disabled={selectedRowKeys.length === 0}
                        >
                            取消分派 ({selectedRowKeys.length})
                        </Button>
                    </Popconfirm>
                    <Button
                        icon={<BarChartOutlined />}
                        onClick={() => setStatsVisible(true)}
                    >
                        统计信息
                    </Button>
                </Space>
            </div>

            {/* 内容列表表格 */}
            <Table
                columns={columns}
                dataSource={items}
                rowKey="originArticleId"
                loading={loading}
                scroll={{ x: 1400 }}
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                    getCheckboxProps: (record) => ({
                        disabled: !record.articleId, // 没有文章的原始文章不能选择
                    }),
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

            {/* 医生分派模态框 */}
            <Modal
                title="分派医生"
                open={assignModalVisible}
                onOk={handleConfirmAssign}
                onCancel={() => setAssignModalVisible(false)}
                confirmLoading={assignLoading}
            >
                <p>选择要分派的医生：</p>
                <Select
                    placeholder="请选择医生"
                    value={selectedDoctorId}
                    onChange={setSelectedDoctorId}
                    style={{ width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                >
                    {doctors.map(doctor => (
                        <Option key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.department} - {doctor.hospital}
                        </Option>
                    ))}
                </Select>
                <p style={{ marginTop: 16, color: '#666' }}>
                    选中 {selectedRowKeys.length} 个原始文章，其中 {
                        items.filter(item => selectedRowKeys.includes(item.originArticleId) && item.articleId).length
                    } 个已有对应文章可分派医生
                </p>
            </Modal>

            {/* 详情抽屉 */}
            <Drawer
                title="内容详情"
                width={800}
                open={detailVisible}
                onClose={() => setDetailVisible(false)}
            >
                {currentItem && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="文章标题">
                            {currentItem.articleTitle}
                        </Descriptions.Item>
                        <Descriptions.Item label="审核状态">
                            <Tag color={currentItem.articleStatus ? ARTICLE_STATUS_COLOR[currentItem.articleStatus] : 'default'}>
                                {currentItem.articleStatusText}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="作者">
                            {currentItem.authorName}
                        </Descriptions.Item>
                        {currentItem.originArticleTitle && (
                            <>
                                <Descriptions.Item label="原始文章标题">
                                    {currentItem.originArticleTitle}
                                </Descriptions.Item>
                                <Descriptions.Item label="原始文章科室">
                                    {currentItem.originArticleDepartment}
                                </Descriptions.Item>
                                <Descriptions.Item label="原始文章医生">
                                    {currentItem.originArticleDoctor}
                                </Descriptions.Item>
                            </>
                        )}
                        <Descriptions.Item label="分派医生">
                            {currentItem.isAssigned ? (
                                <div>
                                    <div><strong>{currentItem.assignedDoctorName}</strong></div>
                                    <div>{currentItem.assignedDoctorDepartment} | {currentItem.assignedDoctorHospital}</div>
                                    <div>百家号：{currentItem.assignedDoctorBaijiahaoAccount}</div>
                                </div>
                            ) : (
                                <Tag color="default">未分派</Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="提交时间">
                            {currentItem.articleSubmittedAt ? dayjs(currentItem.articleSubmittedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="审核时间">
                            {currentItem.articleReviewedAt ? dayjs(currentItem.articleReviewedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                        </Descriptions.Item>
                        {currentItem.reviewComment && (
                            <Descriptions.Item label="审核意见">
                                {currentItem.reviewComment}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Drawer>

            {/* 统计信息模态框 */}
            <Modal
                title="内容统计信息"
                open={statsVisible}
                onCancel={() => setStatsVisible(false)}
                footer={null}
                width={600}
            >
                {stats && (
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Card>
                                <Statistic title="总文章数" value={stats.totalArticles} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card>
                                <Statistic title="已提交" value={stats.submittedArticles} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card>
                                <Statistic title="审核中" value={stats.reviewingArticles} valueStyle={{ color: '#fa8c16' }} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card>
                                <Statistic title="已通过" value={stats.approvedArticles} valueStyle={{ color: '#3f8600' }} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card>
                                <Statistic title="已拒绝" value={stats.rejectedArticles} valueStyle={{ color: '#cf1322' }} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card>
                                <Statistic title="已分派" value={stats.assignedArticles} valueStyle={{ color: '#1890ff' }} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card>
                                <Statistic title="未分派" value={stats.unassignedArticles} valueStyle={{ color: '#cf1322' }} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card>
                                <Statistic title="总原始文章" value={stats.totalOriginArticles} />
                            </Card>
                        </Col>
                    </Row>
                )}
            </Modal>
        </div>
    );
};

export default ContentManagement;
