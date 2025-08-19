import React, { useState, useEffect } from 'react';
import { 
    Table, 
    Button, 
    Space, 
    Tag, 
    Input, 
    Select, 
    Card, 
    message, 
    Popconfirm,
    Image,
    Tooltip,
    Empty
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    ReloadOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { articleAPI } from '../../api/article';
import { ARTICLE_STATUS, ARTICLE_STATUS_TEXT } from '../../types/article';
import type { Article } from '../../types/article';

const { Search } = Input;
const { Option } = Select;

const MyPosts: React.FC = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: undefined as number | undefined,
        search: '',
    });

    // 获取我的文章列表
    const fetchMyArticles = async () => {
        try {
            setLoading(true);
            const data = await articleAPI.getMyArticles();
            setArticles(data);
        } catch (error) {
            message.error('获取我的文章失败');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyArticles();
    }, []);

    // 处理搜索
    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }));
    };

    // 处理状态筛选
    const handleStatusFilter = (value: number | undefined) => {
        setFilters(prev => ({ ...prev, status: value }));
    };

    // 删除文章
    const handleDelete = async (id: number) => {
        try {
            await articleAPI.delete(id);
            message.success('删除成功');
            fetchMyArticles();
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 获取状态标签颜色
    const getStatusColor = (status: number) => {
        switch (status) {
            case ARTICLE_STATUS.APPROVED:
                return 'green';
            case ARTICLE_STATUS.REJECTED:
                return 'red';
            case ARTICLE_STATUS.REVIEWING:
                return 'blue';
            default:
                return 'default';
        }
    };

    // 过滤文章
    const filteredArticles = articles.filter(article => {
        const matchesStatus = !filters.status || article.status === filters.status;
        const matchesSearch = !filters.search || 
            article.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            article.content.toLowerCase().includes(filters.search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // 表格列定义
    const columns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 300,
            render: (text: string, record: Article) => (
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        {text}
                    </div>
                    {record.images && record.images.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {record.images.slice(0, 3).map((img, index) => (
                                <Image
                                    key={img.id}
                                    src={img.downloadUrl}
                                    alt={img.originalName}
                                    width={40}
                                    height={40}
                                    style={{ objectFit: 'cover', borderRadius: 4 }}
                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                />
                            ))}
                            {record.images.length > 3 && (
                                <Tooltip title={`还有 ${record.images.length - 3} 张图片`}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor: '#f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 4,
                                        fontSize: 12,
                                        color: '#666'
                                    }}>
                                        +{record.images.length - 3}
                                    </div>
                                </Tooltip>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: number) => (
                <Tag color={getStatusColor(status)}>
                    {ARTICLE_STATUS_TEXT[status]}
                </Tag>
            ),
        },
        {
            title: '提交时间',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            width: 180,
            render: (text: string) => new Date(text).toLocaleString(),
        },
        {
            title: '审核时间',
            dataIndex: 'reviewedAt',
            key: 'reviewedAt',
            width: 180,
            render: (text: string | null) => text ? new Date(text).toLocaleString() : '-',
        },
        {
            title: '审核员',
            dataIndex: 'reviewerName',
            key: 'reviewerName',
            width: 120,
            render: (text: string | null) => text || '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_: any, record: Article) => (
                <Space size="small">
                    <Button 
                        type="link" 
                        icon={<EyeOutlined />} 
                        onClick={() => navigate(`/articles/${record.id}`)}
                    >
                        查看
                    </Button>
                    {(record.status === ARTICLE_STATUS.SUBMITTED || record.status === ARTICLE_STATUS.REJECTED) && (
                        <>
                            <Button 
                                type="link" 
                                icon={<EditOutlined />} 
                                onClick={() => navigate(`/articles/${record.id}/edit`)}
                            >
                                {record.status === ARTICLE_STATUS.REJECTED ? '重新编辑' : '编辑'}
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
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card 
                title={
                    <Space>
                        <FileTextOutlined />
                        <span>我的发布</span>
                    </Space>
                }
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => navigate('/articles/new')}
                    >
                        新建文章
                    </Button>
                }
            >
                {/* 搜索和筛选 */}
                <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Search
                        placeholder="搜索文章标题或内容"
                        style={{ width: 300 }}
                        onSearch={handleSearch}
                        enterButton
                    />
                    <Select
                        placeholder="选择状态"
                        style={{ width: 150 }}
                        allowClear
                        value={filters.status}
                        onChange={handleStatusFilter}
                    >
                        <Option value={ARTICLE_STATUS.SUBMITTED}>已提交</Option>
                        <Option value={ARTICLE_STATUS.REVIEWING}>审核中</Option>
                        <Option value={ARTICLE_STATUS.APPROVED}>已通过</Option>
                        <Option value={ARTICLE_STATUS.REJECTED}>已拒绝</Option>
                    </Select>
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={fetchMyArticles}
                    >
                        刷新
                    </Button>
                </div>

                {/* 文章列表表格 */}
                {filteredArticles.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={filteredArticles}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => 
                                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                        }}
                        scroll={{ x: 1200 }}
                    />
                ) : (
                    <Empty
                        description="暂无发布的文章"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ margin: '40px 0' }}
                    >
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/articles/new')}
                        >
                            立即发布第一篇文章
                        </Button>
                    </Empty>
                )}
            </Card>
        </div>
    );
};

export default MyPosts;
