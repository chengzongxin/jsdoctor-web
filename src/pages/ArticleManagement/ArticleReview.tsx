import React, { useState, useEffect } from 'react';
import { 
    Table, 
    Button, 
    Space, 
    Tag, 
    Card, 
    message, 
    Modal, 
    Form, 
    Input, 
    Image,
    Tooltip,
    Row,
    Col
} from 'antd';
import { 
    EyeOutlined, 
    CheckOutlined, 
    CloseOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { articleAPI } from '../../api/article';
import { ARTICLE_STATUS, ARTICLE_STATUS_TEXT } from '../../types/article';
import type { Article, ReviewRequest } from '../../types/article';

const { TextArea } = Input;

const ArticleReview: React.FC = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [reviewForm] = Form.useForm();
    const [reviewing, setReviewing] = useState(false);

    // 获取待审核文章列表
    const fetchPendingArticles = async () => {
        try {
            setLoading(true);
            const data = await articleAPI.getPendingReview();
            setArticles(data);
        } catch (error) {
            message.error('获取待审核文章失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingArticles();
    }, []);

    // 打开审核模态框
    const openReviewModal = (article: Article) => {
        setCurrentArticle(article);
        setReviewModalVisible(true);
        reviewForm.resetFields();
    };

    // 关闭审核模态框
    const closeReviewModal = () => {
        setReviewModalVisible(false);
        setCurrentArticle(null);
        reviewForm.resetFields();
    };

    // 提交审核结果
    const handleReview = async (values: ReviewRequest) => {
        if (!currentArticle) return;

        try {
            setReviewing(true);
            await articleAPI.review(currentArticle.id, values);
            message.success('审核完成');
            closeReviewModal();
            fetchPendingArticles();
        } catch (error) {
            message.error('审核失败');
        } finally {
            setReviewing(false);
        }
    };

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
                            {record.images.slice(0, 3).map((img) => (
                                <Image
                                    key={img.id}
                                    src={img.downloadUrl}
                                    alt={img.originalName}
                                    width={40}
                                    height={40}
                                    style={{ objectFit: 'cover', borderRadius: 4 }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: '作者',
            dataIndex: 'authorName',
            key: 'authorName',
            width: 120,
        },
        {
            title: '提交时间',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            width: 180,
            render: (text: string) => new Date(text).toLocaleString(),
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
                        查看详情
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => openReviewModal(record)}
                    >
                        审核
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card 
                title="待审核文章" 
                extra={
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={fetchPendingArticles}
                    >
                        刷新
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={articles}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* 审核模态框 */}
            <Modal
                title="文章审核"
                open={reviewModalVisible}
                onCancel={closeReviewModal}
                footer={null}
                width={800}
                destroyOnClose
            >
                {currentArticle && (
                    <div>
                        <div style={{ marginBottom: 24 }}>
                            <h3>{currentArticle.title}</h3>
                            <div style={{ color: '#666', marginBottom: 16 }}>
                                <p>作者：{currentArticle.authorName}</p>
                                <p>提交时间：{new Date(currentArticle.submittedAt).toLocaleString()}</p>
                            </div>
                            
                            <div style={{ 
                                backgroundColor: '#f5f5f5', 
                                padding: 16, 
                                borderRadius: 6,
                                marginBottom: 16,
                                maxHeight: 200,
                                overflowY: 'auto'
                            }}>
                                <h4>文章内容：</h4>
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {currentArticle.content}
                                </div>
                            </div>
                        </div>

                        <Form
                            form={reviewForm}
                            layout="vertical"
                            onFinish={handleReview}
                        >
                            <Form.Item
                                name="status"
                                label="审核结果"
                                rules={[{ required: true, message: '请选择审核结果' }]}
                            >
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <Button
                                        type="primary"
                                        ghost
                                        size="large"
                                        icon={<CheckOutlined />}
                                        onClick={() => reviewForm.setFieldsValue({ status: ARTICLE_STATUS.APPROVED })}
                                    >
                                        通过
                                    </Button>
                                    <Button
                                        danger
                                        ghost
                                        size="large"
                                        icon={<CloseOutlined />}
                                        onClick={() => reviewForm.setFieldsValue({ status: ARTICLE_STATUS.REJECTED })}
                                    >
                                        拒绝
                                    </Button>
                                </div>
                            </Form.Item>

                            <Form.Item
                                name="reviewComment"
                                label="审核意见"
                                rules={[{ required: true, message: '请填写审核意见' }]}
                            >
                                <TextArea 
                                    rows={4} 
                                    placeholder="请填写审核意见..."
                                    maxLength={500}
                                    showCount
                                />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button onClick={closeReviewModal}>
                                        取消
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit"
                                        loading={reviewing}
                                    >
                                        提交审核
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ArticleReview;
