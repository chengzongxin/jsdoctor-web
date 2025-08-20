import React, { useState, useEffect } from 'react';
import { 
    Form, 
    Input, 
    Button, 
    Upload, 
    message, 
    Space, 
    Card, 
    Row, 
    Col,
    Image,
    Popconfirm,
    Typography,
    Select,
    Switch,
    Alert,
    Steps,
    Progress,
    Modal,
    Divider
} from 'antd';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;
import { 
    PlusOutlined, 
    DeleteOutlined, 
    SaveOutlined,
    SendOutlined,
    ArrowLeftOutlined,
    RobotOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    ReloadOutlined,
    CheckOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { articleAPI } from '../../api/article';
import { fileAPI } from '../../api/files';
import { aiWritingAPI } from '../../api/ai';
import { claimNextArticle, getDepartments } from '../../api/originArticle';
import { ARTICLE_STATUS } from '../../types/article';
import ImprovedRichTextEditor from '../../components/ImprovedRichTextEditor';
import AIWritingPanel from '../../components/AIWritingPanel';
import OriginArticleSelector from '../../components/OriginArticleSelector';
import type { Article, ArticleSubmitRequest, ArticleImage } from '../../types/article';
import type { FileRecord } from '../../types/file';
import type { OriginArticle } from '../../types/originArticle';

interface ArticleEditorProps {
    mode: 'create' | 'edit';
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ mode }) => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<ArticleImage[]>([]);
    const [article, setArticle] = useState<Article | null>(null);
    
    // 原文章选择相关状态
    const [originSelectorVisible, setOriginSelectorVisible] = useState(false);
    const [selectedOriginArticle, setSelectedOriginArticle] = useState<OriginArticle | null>(null);
    
    // 工作流相关状态
    const [departments, setDepartments] = useState<string[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [isRewriting, setIsRewriting] = useState(false);
    
    // 统计数据
    const [statistics, setStatistics] = useState({
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0,
        currentSession: 0,
    });

    // 处理原文章选择
    const handleOriginArticleSelect = (originArticle: OriginArticle, rewrittenTitle: string) => {
        setSelectedOriginArticle(originArticle);
        setOriginSelectorVisible(false);
        
        // 将改写后的标题填入表单
        form.setFieldsValue({
            title: rewrittenTitle
        });
        
        message.success(`已选择原文章"${originArticle.title}"，标题已AI改写`);
    };

    // 移除原文章选择
    const handleRemoveOriginArticle = () => {
        setSelectedOriginArticle(null);
        message.info('已移除原文章关联');
    };

    // 获取科室列表
    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('获取科室列表失败:', error);
        }
    };

    // 加载统计数据
    const loadStatistics = () => {
        const saved = localStorage.getItem('article_workflow_stats');
        if (saved) {
            setStatistics(JSON.parse(saved));
        }
    };

    // 保存统计数据
    const saveStatistics = (newStats: typeof statistics) => {
        setStatistics(newStats);
        localStorage.setItem('article_workflow_stats', JSON.stringify(newStats));
    };



    // 领取下一个源文章
    const claimNextArticleForDepartment = async () => {
        try {
            const article = await claimNextArticle(selectedDepartment);
            setSelectedOriginArticle(article);
            
            // 自动填充源文章标题到标题输入框，清空内容
            form.setFieldsValue({
                title: article.title,
                content: ''
            });
            setImages([]);
            
            message.success(`已领取源文章："${article.title}"，标题已自动填入，可以开始AI改写`);
        } catch (error) {
            message.error('领取源文章失败: ' + (error as Error).message);
            
            // 如果没有更多文章，询问是否继续
            Modal.confirm({
                title: '没有更多文章',
                content: `${selectedDepartment} 科室暂无更多可用的源文章。`,
                okText: '知道了',
                cancelText: '切换科室',
                onOk: () => {
                    setSelectedOriginArticle(null);
                },
                onCancel: () => {
                    setSelectedDepartment('');
                }
            });
        }
    };

    // 执行AI改写
    const performAIRewrite = async (article: OriginArticle) => {
        setIsRewriting(true);

        try {
            // 模拟AI改写过程
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 这里应该调用真实的AI改写API
            // 现在先用简单的文本处理模拟
            const rewrittenTitleText = `🩺${article.title}👨‍⚕️（超实用版）`;
            const rewrittenContentText = `🩺${article.title}👨‍⚕️（超实用版）\n\n${article.content}\n\n#健康关注# #专业建议# #医疗知识#`;
            
            // 填充表单
            form.setFieldsValue({
                title: rewrittenTitleText,
                content: rewrittenContentText,
            });
            
            message.success('AI改写完成，请检查内容后提交');
        } catch (error) {
            message.error('AI改写失败: ' + (error as Error).message);
        } finally {
            setIsRewriting(false);
        }
    };

    // 智能提交（提交后自动领取下一个）
    const handleSmartSubmit = async () => {
        try {
            await handleSubmit();
            
            // 更新统计
            const newStats = {
                ...statistics,
                totalProcessed: statistics.totalProcessed + 1,
                successCount: statistics.successCount + 1,
                currentSession: statistics.currentSession + 1,
            };
            saveStatistics(newStats);
            
            // 清理当前状态
            setSelectedOriginArticle(null);
            
            // 如果选择了科室，自动领取下一个
            if (selectedDepartment) {
                setTimeout(() => {
                    claimNextArticleForDepartment();
                }, 1000);
            }
            
        } catch (error) {
            // 更新失败统计
            const newStats = {
                ...statistics,
                totalProcessed: statistics.totalProcessed + 1,
                failureCount: statistics.failureCount + 1,
            };
            saveStatistics(newStats);
            throw error; // 重新抛出错误，让handleSubmit处理错误显示
        }
    };

    // 手动重新改写
    const handleManualRewrite = async () => {
        if (selectedOriginArticle) {
            await performAIRewrite(selectedOriginArticle);
        }
    };

    // 如果是编辑模式，获取文章信息
    useEffect(() => {
        if (mode === 'edit' && id) {
            fetchArticle();
        }
        // 初始化科室列表和统计数据
        fetchDepartments();
        loadStatistics();
    }, [mode, id]);

    // 监听表单内容变化，确保富文本编辑器内容同步
    useEffect(() => {
        const content = form.getFieldValue('content');
        if (content !== undefined) {
            // 这里可以添加额外的内容处理逻辑
        }
    }, [form.getFieldValue('content')]);

    // 获取文章详情
    const fetchArticle = async () => {
        try {
            const data = await articleAPI.getDetail(Number(id));
            setArticle(data);
            form.setFieldsValue({
                title: data.title,
                content: data.content,
            });
            setImages(data.images || []);
        } catch (error) {
            message.error('获取文章失败');
            navigate('/articles');
        }
    };

    // 图片上传处理
    const handleImageUpload = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) { // 10MB限制
            message.error('图片大小不能超过10MB');
            return false;
        }

        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('只能上传图片文件');
            return false;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fileAPI.uploadFile(formData);
            
            // 添加到图片列表
            const newImage: ArticleImage = {
                id: Date.now() + Math.random(), // 生成唯一的临时ID
                articleId: 0, // 临时值
                imageId: response.id, // 文件ID
                sortOrder: images.length,
                createdAt: new Date().toISOString(),
                originalName: response.original_name,
                downloadUrl: response.download_url,
                fileSize: response.file_size,
                fileType: response.file_type,
            };
            
            setImages(prev => [...prev, newImage]);
            message.success('图片上传成功');
        } catch (error) {
            message.error('图片上传失败');
        } finally {
            setUploading(false);
        }

        return false; // 阻止默认上传行为
    };



    // 删除图片
    const handleRemoveImage = (imageId: number) => {
        setImages(prev => prev.filter(img => img.id !== imageId));
    };

    // 调整图片顺序
    const moveImage = (fromIndex: number, toIndex: number) => {
        const newImages = [...images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        
        // 更新排序
        newImages.forEach((img, index) => {
            img.sortOrder = index;
        });
        
        setImages(newImages);
    };

    // 保存草稿（这里可以实现本地存储）
    const handleSaveDraft = () => {
        const values = form.getFieldsValue();
        const draftData = {
            ...values,
            images: images,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('article_draft', JSON.stringify(draftData));
        message.success('草稿已保存到本地');
    };

    // 提交文章
    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = form.getFieldsValue();

            if (!values.title || !values.content) {
                message.error('请填写标题和内容');
                return;
            }

            console.log("=== 提交文章时的图片数据 ===");
            console.log("前端图片数组:", images);
            console.log("图片数量:", images.length);
            
            const articleData: ArticleSubmitRequest = {
                title: values.title,
                content: values.content,
                originArticleId: selectedOriginArticle?.id || null,
                images: images.map(img => ({
                    id: img.imageId,
                    sortOrder: img.sortOrder
                }))
            };
            
            console.log("提交给后端的数据:", articleData);
            console.log("提交的图片数量:", articleData.images.length);

            if (mode === 'create') {
                await articleAPI.submit(articleData);
                message.success('文章提交成功');
            } else {
                await articleAPI.update(Number(id), articleData);
                message.success('文章更新成功');
            }

            // 清除本地草稿
            localStorage.removeItem('article_draft');
            
            // 在创建模式且有选择科室时不跳转页面（智能工作流）
            if (!(mode === 'create' && selectedDepartment)) {
                navigate('/articles');
            }
        } catch (error) {
            message.error(mode === 'create' ? '提交失败' : '更新失败');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // 工作流步骤定义
    const steps = [
        { title: '选择科室', description: '选择要处理的科室', icon: <PlayCircleOutlined /> },
        { title: '领取文章', description: '自动领取下一个源文章', icon: <ReloadOutlined /> },
        { title: '加载内容', description: '源文章已加载，等待改写', icon: <CheckOutlined /> },
        { title: 'AI改写', description: '手动进行AI改写', icon: <RobotOutlined /> },
        { title: '预览确认', description: '检查改写结果', icon: <CheckOutlined /> },
        { title: '提交文章', description: '手动提交到系统', icon: <SendOutlined /> },
        { title: '完成', description: '提交完成，自动领取下一个', icon: <CheckOutlined /> },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card 
                title={mode === 'create' ? '智能写作' : '编辑文章'}
                extra={
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/articles')}
                    >
                        返回
                    </Button>
                }
            >
                {/* 简化的科室选择面板 */}
                {mode === 'create' && (
                    <div style={{ marginBottom: 24 }}>
                        <Card size="small">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                                <Text strong>选择科室：</Text>
                                <Select
                                    placeholder="请选择科室领取源文章"
                                    value={selectedDepartment}
                                    onChange={(value) => {
                                        setSelectedDepartment(value);
                                        if (value && !selectedOriginArticle) {
                                            claimNextArticleForDepartment();
                                        }
                                    }}
                                    style={{ width: 200 }}
                                >
                                    {departments.map(dept => (
                                        <Option key={dept} value={dept}>{dept}</Option>
                                    ))}
                                </Select>
                                
                                {selectedDepartment && (
                                    <Button 
                                        icon={<ReloadOutlined />}
                                        onClick={claimNextArticleForDepartment}
                                        loading={false}
                                    >
                                        领取下一个
                                    </Button>
                                )}
                            </div>
                            
                            {/* 统计信息 - 简化版 */}
                            <div style={{ fontSize: 12, color: '#666' }}>
                                本次会话已处理：{statistics.currentSession} 篇 | 
                                总成功：{statistics.successCount} 篇 | 
                                总失败：{statistics.failureCount} 篇
                            </div>
                        </Card>
                    </div>
                )}
                <Form 
                    form={form} 
                    layout="vertical" 
                    style={{ maxWidth: 1000, margin: '0 auto' }}
                >
                    {/* 当前源文章信息 */}
                    {mode === 'create' && selectedOriginArticle && (
                        <Form.Item label="当前源文章">
                            <div style={{ 
                                padding: 16, 
                                backgroundColor: '#f0f9ff', 
                                border: '1px solid #d1ecf1',
                                borderRadius: 8,
                                marginBottom: 16
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <Text strong style={{ color: '#0969da' }}>源文章信息</Text>
                                            <Button 
                                                size="small"
                                                icon={<RobotOutlined />} 
                                                onClick={handleManualRewrite}
                                                loading={isRewriting}
                                                type="primary"
                                            >
                                                {isRewriting ? 'AI改写中...' : 'AI改写'}
                                            </Button>
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <Text strong>科室：</Text>
                                            <Text>{selectedOriginArticle.department}</Text>
                                            <Divider type="vertical" />
                                            <Text strong>医生：</Text>
                                            <Text>{selectedOriginArticle.doctor}</Text>
                                        </div>
                                        <div>
                                            <Text strong>原内容：</Text>
                                            <Paragraph 
                                                copyable 
                                                ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
                                                style={{ marginBottom: 0 }}
                                            >
                                                {selectedOriginArticle.content}
                                            </Paragraph>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form.Item>
                    )}

                    <Form.Item
                        name="title"
                        label="文章标题"
                        rules={[{ required: true, message: '请输入标题' }]}
                    >
                        <Input 
                            placeholder={selectedOriginArticle ? "标题已由AI改写生成" : "请输入文章标题"} 
                            size="large"
                            style={{ fontSize: 18 }}
                        />
                    </Form.Item>
                    
                    {/* AI写作功能 */}
                    <AIWritingPanel
                        title={Form.useWatch('title', form) || ''}
                        onContentGenerated={(content, newTitle) => {
                            form.setFieldsValue({
                                title: newTitle,
                                content: content
                            });
                        }}
                        onTitleChange={(newTitle) => {
                            form.setFieldsValue({ title: newTitle });
                        }}
                    />

                    <Form.Item
                        name="content"
                        label="文章内容"
                        rules={[{ required: true, message: '请输入内容' }]}
                    >
                        <ImprovedRichTextEditor
                            value={form.getFieldValue('content') || ''}
                            onChange={(value: string) => form.setFieldsValue({ content: value })}
                            placeholder="请输入文章内容..."
                        />
                    </Form.Item>

                    <Form.Item label="文章图片">
                        <div style={{ marginBottom: 16 }}>
                            <Upload
                                listType="picture-card"
                                fileList={images.map((img, index) => ({
                                    uid: img.id.toString(),
                                    name: img.originalName,
                                    status: 'done',
                                    url: img.downloadUrl
                                }))}
                                beforeUpload={handleImageUpload}
                                onRemove={({ uid }) => handleRemoveImage(Number(uid))}
                                customRequest={() => {}} // 自定义上传逻辑
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>上传图片</div>
                                </div>
                            </Upload>
                            {uploading && <span style={{ marginLeft: 8 }}>上传中...</span>}
                        </div>
                        
                        {/* 图片排序 */}
                        {images.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <h4>图片排序（拖拽调整顺序）</h4>
                                <Row gutter={[16, 16]}>
                                    {images.map((img, index) => (
                                        <Col key={img.id} span={6}>
                                            <div style={{ 
                                                border: '1px solid #d9d9d9', 
                                                borderRadius: 8, 
                                                padding: 8,
                                                position: 'relative'
                                            }}>
                                                <Image
                                                    src={img.downloadUrl}
                                                    alt={img.originalName}
                                                    style={{ 
                                                        width: '100%', 
                                                        height: 120, 
                                                        objectFit: 'cover',
                                                        borderRadius: 4
                                                    }}
                                                />
                                                <div style={{ 
                                                    marginTop: 8, 
                                                    fontSize: 12, 
                                                    color: '#666',
                                                    textAlign: 'center'
                                                }}>
                                                    {img.originalName}
                                                </div>
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: 4, 
                                                    right: 4,
                                                    display: 'flex',
                                                    gap: 4
                                                }}>
                                                    {index > 0 && (
                                                        <Button
                                                            size="small"
                                                            onClick={() => moveImage(index, index - 1)}
                                                        >
                                                            ↑
                                                        </Button>
                                                    )}
                                                    {index < images.length - 1 && (
                                                        <Button
                                                            size="small"
                                                            onClick={() => moveImage(index, index + 1)}
                                                        >
                                                            ↓
                                                        </Button>
                                                    )}
                                                    <Popconfirm
                                                        title="确定要删除这张图片吗？"
                                                        onConfirm={() => handleRemoveImage(img.id)}
                                                        okText="确定"
                                                        cancelText="取消"
                                                    >
                                                        <Button
                                                            size="small"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                        />
                                                    </Popconfirm>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        )}
                        
                        <div style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                            支持JPG、PNG、GIF格式，单个文件不超过10MB
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Space size="large">
                            <Button 
                                onClick={handleSaveDraft}
                                disabled={uploading}
                                icon={<SaveOutlined />}
                            >
                                保存草稿
                            </Button>
                            <Button 
                                type="primary" 
                                onClick={mode === 'create' && selectedDepartment ? handleSmartSubmit : handleSubmit}
                                loading={loading}
                                disabled={uploading}
                                icon={mode === 'create' ? <SendOutlined /> : <SaveOutlined />}
                            >
                                {mode === 'create' && selectedDepartment 
                                    ? '提交并继续下一个' 
                                    : (mode === 'create' ? '提交审核' : '保存更新')
                                }
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            {/* 原文章选择器 */}
            <OriginArticleSelector
                visible={originSelectorVisible}
                onCancel={() => setOriginSelectorVisible(false)}
                onSelect={handleOriginArticleSelect}
            />
        </div>
    );
};

export default ArticleEditor;
