import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Button, 
    Space, 
    Tag, 
    message, 
    Image, 
    Row, 
    Col,
    Descriptions,
    Divider,
    Typography,
    Modal,
    Form,
    Input
} from 'antd';
import { 
    ArrowLeftOutlined, 
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { articleAPI, userAPI } from '../../api/article';
import { ARTICLE_STATUS, ARTICLE_STATUS_TEXT } from '../../types/article';
import { markdownToHtml } from '../../utils/markdownUtils';
import type { Article, ReviewRequest } from '../../types/article';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ArticleDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(false);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewForm] = Form.useForm();
    const [reviewing, setReviewing] = useState(false);

    useEffect(() => {
        if (id) {
            fetchArticle();
            fetchUserRoles();
        }
    }, [id]);

    // 获取用户角色
    const fetchUserRoles = async () => {
        try {
            const roles = await userAPI.getMyRoles();
            // 提取角色代码
            const roleCodes = roles.map(role => role.roleCode);
            setUserRoles(roleCodes);
        } catch (error) {
            console.error('获取用户角色失败:', error);
            // 如果获取失败，设置为空数组
            setUserRoles([]);
        }
    };

    // 检查用户是否有特定角色
    const hasRole = (roleCode: string) => {
        return userRoles.includes(roleCode);
    };

    // 检查是否为审核员
    const isReviewer = () => hasRole('REVIEWER');
    
    // 检查是否为学生
    const isStudent = () => hasRole('STUDENT');

    // 获取文章详情
    const fetchArticle = async () => {
        try {
            setLoading(true);
            const data = await articleAPI.getDetail(Number(id));
            setArticle(data);
        } catch (error) {
            message.error('获取文章详情失败');
            navigate('/articles');
        } finally {
            setLoading(false);
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

    // 删除文章
    const handleDelete = async () => {
        if (!article) return;
        
        try {
            await articleAPI.delete(article.id);
            message.success('删除成功');
            navigate('/articles');
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 打开审核模态框
    const openReviewModal = () => {
        setReviewModalVisible(true);
        reviewForm.resetFields();
    };

    // 关闭审核模态框
    const closeReviewModal = () => {
        setReviewModalVisible(false);
        reviewForm.resetFields();
    };

    // 提交审核结果
    const handleReview = async (values: ReviewRequest) => {
        if (!article) return;

        try {
            setReviewing(true);
            await articleAPI.review(article.id, values);
            message.success('审核完成');
            closeReviewModal();
            fetchArticle(); // 刷新文章信息
        } catch (error) {
            message.error('审核失败');
        } finally {
            setReviewing(false);
        }
    };

    if (!article) {
        return <div>加载中...</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <Card 
                title="文章详情"
                extra={
                    <Space>
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate('/articles')}
                        >
                            返回列表
                        </Button>
                        {/* 审核员可以审核待审核的文章 */}
                        {isReviewer() && article.status === ARTICLE_STATUS.SUBMITTED && (
                            <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                onClick={openReviewModal}
                            >
                                审核文章
                            </Button>
                        )}
                        {/* 学生可以编辑自己的文章（待审核或被拒绝状态） */}
                        {isStudent() && (article.status === ARTICLE_STATUS.SUBMITTED || article.status === ARTICLE_STATUS.REJECTED) && (
                            <>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/articles/${article.id}/edit`)}
                                >
                                    {article.status === ARTICLE_STATUS.REJECTED ? '重新编辑' : '编辑文章'}
                                </Button>
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={handleDelete}
                                >
                                    删除文章
                                </Button>
                            </>
                        )}
                    </Space>
                }
                loading={loading}
            >
                {/* 文章基本信息 */}
                <Descriptions title="基本信息" bordered style={{ marginBottom: 24 }}>
                    <Descriptions.Item label="文章标题" span={3}>
                        <Title level={3} style={{ margin: 0 }}>
                            {article.title}
                        </Title>
                    </Descriptions.Item>
                    <Descriptions.Item label="作者">
                        {article.authorName}
                    </Descriptions.Item>
                    <Descriptions.Item label="文章状态">
                        <Tag color={getStatusColor(article.status)}>
                            {ARTICLE_STATUS_TEXT[article.status]}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="提交时间">
                        {new Date(article.submittedAt).toLocaleString()}
                    </Descriptions.Item>
                    {article.reviewedAt && (
                        <Descriptions.Item label="审核时间">
                            {new Date(article.reviewedAt).toLocaleString()}
                        </Descriptions.Item>
                    )}
                    {article.reviewerName && (
                        <Descriptions.Item label="审核员">
                            {article.reviewerName}
                        </Descriptions.Item>
                    )}
                    {article.reviewComment && (
                        <Descriptions.Item label="审核意见" span={3}>
                            <Paragraph style={{ margin: 0, color: '#666' }}>
                                {article.reviewComment}
                            </Paragraph>
                        </Descriptions.Item>
                    )}
                </Descriptions>

                {/* 文章内容 */}
                <Card title="文章内容" style={{ marginBottom: 24 }}>
                    <div 
                        style={{ 
                            fontSize: 16, 
                            lineHeight: 1.8,
                            padding: '16px',
                            border: '1px solid #f0f0f0',
                            borderRadius: '6px',
                            backgroundColor: '#fafafa'
                        }}
                        dangerouslySetInnerHTML={{
                            __html: markdownToHtml(article.content)
                        }}
                    />
                </Card>

                {/* 文章图片 */}
                {article.images && article.images.length > 0 && (
                    <Card title="文章图片" style={{ marginBottom: 24 }}>
                        <Row gutter={[16, 16]}>
                            {article.images.map((img, index) => (
                                <Col key={img.id} xs={24} sm={12} md={8} lg={6}>
                                    <div style={{ 
                                        border: '1px solid #f0f0f0', 
                                        borderRadius: 8, 
                                        padding: 8,
                                        textAlign: 'center'
                                    }}>
                                        <Image
                                            src={img.downloadUrl}
                                            alt={img.originalName}
                                            style={{ 
                                                width: '100%', 
                                                height: 200, 
                                                objectFit: 'cover',
                                                borderRadius: 4
                                            }}
                                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                        />
                                        <div style={{ 
                                            marginTop: 8, 
                                            fontSize: 12, 
                                            color: '#666',
                                            wordBreak: 'break-all'
                                        }}>
                                            {img.originalName}
                                        </div>
                                        <div style={{ 
                                            fontSize: 11, 
                                            color: '#999',
                                            marginTop: 4
                                        }}>
                                            {img.fileSize} bytes
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                )}

                {/* 操作按钮 */}
                <Divider />
                <div style={{ textAlign: 'center' }}>
                    <Space size="large">
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate('/articles')}
                        >
                            返回列表
                        </Button>
                        {/* 审核员可以审核待审核的文章 */}
                        {isReviewer() && article.status === ARTICLE_STATUS.SUBMITTED && (
                            <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                onClick={openReviewModal}
                            >
                                审核文章
                            </Button>
                        )}
                        {/* 学生可以编辑自己的文章（待审核或被拒绝状态） */}
                        {isStudent() && (article.status === ARTICLE_STATUS.SUBMITTED || article.status === ARTICLE_STATUS.REJECTED) && (
                            <>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/articles/${article.id}/edit`)}
                                >
                                    {article.status === ARTICLE_STATUS.REJECTED ? '重新编辑' : '编辑文章'}
                                </Button>
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={handleDelete}
                                >
                                    删除文章
                                </Button>
                            </>
                        )}
                    </Space>
                </div>
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
                {article && (
                    <div>
                        <div style={{ marginBottom: 24 }}>
                            <h3>{article.title}</h3>
                            <div style={{ color: '#666', marginBottom: 16 }}>
                                <p>作者：{article.authorName}</p>
                                <p>提交时间：{new Date(article.submittedAt).toLocaleString()}</p>
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
                                    {article.content}
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

export default ArticleDetail;
