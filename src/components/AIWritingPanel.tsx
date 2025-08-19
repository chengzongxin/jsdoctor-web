import React, { useState, useEffect } from 'react';
import { 
    Button, 
    Card, 
    Space, 
    Select, 
    Input, 
    Switch, 
    Divider,
    message,
    Spin,
    Typography
} from 'antd';
import { 
    RobotOutlined, 
    SettingOutlined, 
    MailOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { aiWritingAPI } from '../api/ai';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

interface AIWritingPanelProps {
    title: string;
    onContentGenerated: (content: string, newTitle: string) => void;
    disabled?: boolean;
    onTitleChange?: (title: string) => void;
}

interface WritingStyle {
    tone: string;
    length: string;
    structure: string;
    includeEmojis: boolean;
    includeKeywords: boolean;
}

const AIWritingPanel: React.FC<AIWritingPanelProps> = ({ 
    title, 
    onContentGenerated, 
    disabled = false,
    onTitleChange
}) => {
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [localTitle, setLocalTitle] = useState(title);
    const [writingStyle, setWritingStyle] = useState<WritingStyle>({
        tone: 'professional',
        length: 'medium',
        structure: 'points',
        includeEmojis: true,
        includeKeywords: true
    });

    // 当外部title变化时，更新本地状态
    useEffect(() => {
        setLocalTitle(title);
    }, [title]);

    // 写作风格选项
    const toneOptions = [
        { value: 'professional', label: '专业严谨' },
        { value: 'friendly', label: '亲切友好' },
        { value: 'casual', label: '轻松随意' },
        { value: 'authoritative', label: '权威可信' }
    ];

    const lengthOptions = [
        { value: 'short', label: '简短精炼 (200-300字)' },
        { value: 'medium', label: '适中详细 (350-450字)' },
        { value: 'long', label: '详细全面 (500-700字)' }
    ];

    const structureOptions = [
        { value: 'points', label: '分点说明' },
        { value: 'narrative', label: '叙述性' },
        { value: 'qa', label: '问答式' },
        { value: 'comparison', label: '对比分析' }
    ];

    // 生成提示词
    const generatePrompt = (title: string, style: WritingStyle): string => {
        let prompt = `从医生的角度回答：${title}\n`;
        
        // 字数控制
        switch (style.length) {
            case 'short':
                prompt += '字数控制在200-300字，';
                break;
            case 'medium':
                prompt += '字数控制在350-450字，';
                break;
            case 'long':
                prompt += '字数控制在500-700字，';
                break;
        }
        
        // 结构要求
        switch (style.structure) {
            case 'points':
                prompt += '要分点说明。';
                break;
            case 'narrative':
                prompt += '采用叙述性表达。';
                break;
            case 'qa':
                prompt += '采用问答式结构。';
                break;
            case 'comparison':
                prompt += '进行对比分析。';
                break;
        }
        
        // 语气要求
        switch (style.tone) {
            case 'professional':
                prompt += '语气专业严谨。';
                break;
            case 'friendly':
                prompt += '语气亲切友好。';
                break;
            case 'casual':
                prompt += '语气轻松随意。';
                break;
            case 'authoritative':
                prompt += '语气权威可信。';
                break;
        }
        
        prompt += '\n文中不要出现"作为医生""从医生的角度来说"等字眼。';
        prompt += '语气表达适当口语化。';
        
        if (style.includeKeywords) {
            prompt += '\n文章最后一段添加文章关键词，需要3-5个词，每个词分别用#关键词#标识。';
        }
        
        prompt += '\n标题保留原有语句后新增新媒体的补充表达，标题总字数控制在20字以内。';
        
        if (style.includeEmojis) {
            prompt += '\n文中适当加入3-5个表情包。';
        }
        
        prompt += '\n\n请完成这个功能';
        
        return prompt;
    };

    // AI写作
    const handleAIWriting = async () => {
        if (!localTitle || localTitle.trim() === '') {
            message.error('请先输入文章标题');
            return;
        }

        try {
            setLoading(true);
            message.loading('AI正在创作中，请稍候...', 0);
            
            const prompt = generatePrompt(localTitle.trim(), writingStyle);
            const result = await aiWritingAPI.generateArticleWithPrompt(prompt);
            
            // 调用父组件的回调函数
            onContentGenerated(result.content, result.newTitle);
            
            message.destroy();
            message.success('AI写作完成！');
            
        } catch (error) {
            message.destroy();
            message.error('AI写作失败，请重试');
            console.error('AI写作错误:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card 
            size="small" 
            title={
                <Space>
                    <RobotOutlined style={{ color: '#1890ff' }} />
                    <span>AI智能写作</span>
                </Space>
            }
            extra={
                <Button
                    type="text"
                    icon={<SettingOutlined />}
                    size="small"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    {showAdvanced ? '收起' : '高级'}
                </Button>
            }
            style={{ marginBottom: 16, border: '1px dashed #d9d9d9' }}
        >
            {/* 基础功能 */}
            <div style={{ marginBottom: 16 }}>
                {/* 调试信息 */}
                <div style={{ marginBottom: 8, fontSize: 12, color: '#999' }}>
                    当前标题: "{localTitle || '无标题'}" (长度: {localTitle ? localTitle.length : 0})
                </div>
                
                {/* 备用标题输入框 */}
                {!localTitle && (
                    <div style={{ marginBottom: 12 }}>
                        <Input
                            placeholder="如果上方标题未显示，请在此输入标题"
                            size="small"
                            value={localTitle}
                            onChange={(e) => setLocalTitle(e.target.value)}
                        />
                    </div>
                )}
                
                <Button
                    type="primary"
                    icon={<MailOutlined />}
                    onClick={handleAIWriting}
                    loading={loading}
                    disabled={disabled || !localTitle || localTitle.trim() === ''}
                    block
                >
                    {loading ? 'AI创作中...' : '开始AI写作'}
                </Button>
                
                <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                    💡 输入标题后点击此按钮，AI将根据您的设置自动生成文章内容
                </div>
            </div>

            {/* 高级设置 */}
            {showAdvanced && (
                <>
                    <Divider style={{ margin: '16px 0' }} />
                    
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>写作风格设置</Text>
                    </div>
                    
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        {/* 语气选择 */}
                        <div>
                            <Text>语气风格：</Text>
                            <Select
                                value={writingStyle.tone}
                                onChange={(value) => setWritingStyle(prev => ({ ...prev, tone: value }))}
                                style={{ width: 150, marginLeft: 8 }}
                                size="small"
                            >
                                {toneOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* 字数控制 */}
                        <div>
                            <Text>文章长度：</Text>
                            <Select
                                value={writingStyle.length}
                                onChange={(value) => setWritingStyle(prev => ({ ...prev, length: value }))}
                                style={{ width: 200, marginLeft: 8 }}
                                size="small"
                            >
                                {lengthOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* 结构要求 */}
                        <div>
                            <Text>文章结构：</Text>
                            <Select
                                value={writingStyle.structure}
                                onChange={(value) => setWritingStyle(prev => ({ ...prev, structure: value }))}
                                style={{ width: 150, marginLeft: 8 }}
                                size="small"
                            >
                                {structureOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* 功能开关 */}
                        <div>
                            <Space>
                                <Switch
                                    checked={writingStyle.includeEmojis}
                                    onChange={(checked) => setWritingStyle(prev => ({ ...prev, includeEmojis: checked }))}
                                    size="small"
                                />
                                <Text>包含表情包</Text>
                            </Space>
                            
                            <Space style={{ marginLeft: 24 }}>
                                <Switch
                                    checked={writingStyle.includeKeywords}
                                    onChange={(checked) => setWritingStyle(prev => ({ ...prev, includeKeywords: checked }))}
                                    size="small"
                                />
                                <Text>包含关键词标签</Text>
                            </Space>
                        </div>
                    </Space>
                </>
            )}
        </Card>
    );
};

export default AIWritingPanel;
