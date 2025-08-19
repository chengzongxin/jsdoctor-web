import React, { useState } from 'react';
import { 
    Card, 
    Input, 
    Button, 
    Space, 
    message, 
    Typography, 
    Divider,
    Spin,
    Alert
} from 'antd';
import { RobotOutlined, ReloadOutlined } from '@ant-design/icons';
// 直接调用后端测试接口，不依赖ai.ts

const { TextArea } = Input;
const { Text } = Typography;

const AITestPage: React.FC = () => {
    const [title, setTitle] = useState('胎儿在肚子里怕颠簸吗？');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ content: string; newTitle: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAIWriting = async () => {
        if (!title || title.trim() === '') {
            message.error('请输入标题');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setResult(null);
            
            message.loading('AI正在创作中，请稍候...', 0);
            
            // 直接调用后端测试接口
            const response = await fetch('/api/ai-test/writing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: title.trim() })
            });

            if (!response.ok) {
                throw new Error(`请求失败: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.code === 1 && data.data) {
                setResult({
                    content: data.data.content,
                    newTitle: data.data.newTitle
                });
                message.destroy();
                message.success('AI写作完成！');
            } else {
                throw new Error(data.msg || 'AI写作失败');
            }
            
        } catch (error) {
            message.destroy();
            const errorMsg = error instanceof Error ? error.message : 'AI写作失败，请重试';
            setError(errorMsg);
            message.error(errorMsg);
            console.error('AI写作错误:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setTitle('');
        setResult(null);
        setError(null);
    };

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Card title="AI写作功能测试" style={{ marginBottom: 24 }}>
                <Alert
                    message="百度文心一言API集成测试"
                    description="此页面用于测试AI写作功能的API集成，确保百度文心一言API能够正常工作。"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {/* 标题输入 */}
                    <div>
                        <Text strong>文章标题：</Text>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="请输入文章标题"
                            size="large"
                            style={{ marginTop: 8 }}
                        />
                    </div>

                    {/* 操作按钮 */}
                    <Space>
                        <Button
                            type="primary"
                            icon={<RobotOutlined />}
                            onClick={handleAIWriting}
                            loading={loading}
                            disabled={!title || title.trim() === ''}
                            size="large"
                        >
                            {loading ? 'AI创作中...' : '开始AI写作'}
                        </Button>
                        
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleClear}
                            size="large"
                        >
                            清空
                        </Button>
                    </Space>

                    {/* 加载状态 */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <Spin size="large" />
                            <div style={{ marginTop: 16 }}>
                                <Text>AI正在创作中，请稍候...</Text>
                            </div>
                        </div>
                    )}

                    {/* 错误信息 */}
                    {error && (
                        <Alert
                            message="AI写作失败"
                            description={error}
                            type="error"
                            showIcon
                            action={
                                <Button size="small" danger onClick={handleAIWriting}>
                                    重试
                                </Button>
                            }
                        />
                    )}

                    {/* 结果展示 */}
                    {result && (
                        <>
                            <Divider>AI写作结果</Divider>
                            
                            {/* 新标题 */}
                            <div>
                                <Text strong>AI生成的新标题：</Text>
                                <div style={{ 
                                    marginTop: 8, 
                                    padding: 12, 
                                    backgroundColor: '#f6f8fa', 
                                    borderRadius: 6,
                                    border: '1px solid #e1e4e8'
                                }}>
                                    <Text style={{ fontSize: 16, color: '#1890ff' }}>
                                        {result.newTitle}
                                    </Text>
                                </div>
                            </div>

                            {/* 文章内容 */}
                            <div>
                                <Text strong>AI生成的文章内容：</Text>
                                <div style={{ 
                                    marginTop: 8, 
                                    padding: 16, 
                                    backgroundColor: '#f6f8fa', 
                                    borderRadius: 6,
                                    border: '1px solid #e1e4e8',
                                    maxHeight: 400,
                                    overflowY: 'auto'
                                }}>
                                    <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                        {result.content}
                                    </Text>
                                </div>
                            </div>

                            {/* 统计信息 */}
                            <div style={{ 
                                display: 'flex', 
                                gap: 24, 
                                color: '#666', 
                                fontSize: 12 
                            }}>
                                <span>字数：{result.content.length}</span>
                                <span>段落数：{result.content.split('\n\n').filter(p => p.trim()).length}</span>
                                <span>表情包数量：{(result.content.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}]/gu) || []).length}</span>
                                <span>关键词数量：{(result.content.match(/#[^#]+#/g) || []).length}</span>
                            </div>
                        </>
                    )}
                </Space>
            </Card>
        </div>
    );
};

export default AITestPage;
