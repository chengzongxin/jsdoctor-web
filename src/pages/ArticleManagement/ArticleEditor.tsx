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
    Popconfirm
} from 'antd';
import { 
    PlusOutlined, 
    DeleteOutlined, 
    SaveOutlined,
    SendOutlined,
    ArrowLeftOutlined,
    RobotOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { articleAPI } from '../../api/article';
import { fileAPI } from '../../api/files';
import { aiWritingAPI } from '../../api/ai';
import { ARTICLE_STATUS } from '../../types/article';
import ImprovedRichTextEditor from '../../components/ImprovedRichTextEditor';
import AIWritingPanel from '../../components/AIWritingPanel';
import type { Article, ArticleSubmitRequest, ArticleImage } from '../../types/article';
import type { FileRecord } from '../../types/file';

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

    // 如果是编辑模式，获取文章信息
    useEffect(() => {
        if (mode === 'edit' && id) {
            fetchArticle();
        }
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
            
            // 跳转到文章列表
            navigate('/articles');
        } catch (error) {
            message.error(mode === 'create' ? '提交失败' : '更新失败');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Card 
                title={mode === 'create' ? '新建文章' : '编辑文章'}
                extra={
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/articles')}
                    >
                        返回
                    </Button>
                }
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    style={{ maxWidth: 1000, margin: '0 auto' }}
                >
                    <Form.Item
                        name="title"
                        label="文章标题"
                        rules={[{ required: true, message: '请输入标题' }]}
                    >
                        <Input 
                            placeholder="请输入文章标题" 
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
                                onClick={handleSubmit}
                                loading={loading}
                                disabled={uploading}
                                icon={mode === 'create' ? <SendOutlined /> : <SaveOutlined />}
                            >
                                {mode === 'create' ? '提交审核' : '保存更新'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ArticleEditor;
