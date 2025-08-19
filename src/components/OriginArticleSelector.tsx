import React, { useState, useEffect } from 'react';
import {
    Modal,
    Table,
    Input,
    Select,
    Space,
    Button,
    Typography,
    Tag,
    Divider,
    Alert,
    Spin
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    RobotOutlined,
    EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { OriginArticle } from '../types/originArticle';
import { getArticlesForSelection, getDepartments } from '../api/originArticle';
import { aiWritingAPI } from '../api/ai';

const { Option } = Select;
const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface OriginArticleSelectorProps {
    visible: boolean;
    onCancel: () => void;
    onSelect: (article: OriginArticle, rewrittenTitle: string) => void;
}

const OriginArticleSelector: React.FC<OriginArticleSelectorProps> = ({
    visible,
    onCancel,
    onSelect
}) => {
    const [articles, setArticles] = useState<OriginArticle[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTitle, setSearchTitle] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedArticle, setSelectedArticle] = useState<OriginArticle | null>(null);
    const [rewrittenTitle, setRewrittenTitle] = useState('');
    const [rewriting, setRewriting] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewArticle, setPreviewArticle] = useState<OriginArticle | null>(null);

    // 获取原文章列表
    const fetchArticles = async () => {
        try {
            setLoading(true);
            const data = await getArticlesForSelection(selectedDepartment, 100);
            let filteredData = data;
            
            // 前端筛选标题
            if (searchTitle.trim()) {
                filteredData = data.filter(article => 
                    article.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
                    article.searchTitle?.toLowerCase().includes(searchTitle.toLowerCase())
                );
            }
            
            setArticles(filteredData);
        } catch (error) {
            console.error('获取原文章列表失败:', error);
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

    // 初始化数据
    useEffect(() => {
        if (visible) {
            fetchArticles();
            fetchDepartments();
        }
    }, [visible, selectedDepartment]);

    // 搜索处理
    const handleSearch = () => {
        fetchArticles();
    };

    // AI改写标题
    const handleRewriteTitle = async (article: OriginArticle) => {
        try {
            setRewriting(true);
            setSelectedArticle(article);
            
            // 调用AI改写API
//             const prompt = `请对以下医学文章标题进行改写，要求：
// 1. 保持原意不变
// 2. 使语言更加通俗易懂
// 3. 符合网络文章标题规范
// 4. 长度控制在15-30字之间

// 原标题：${article.title}`;

            const response = await aiWritingAPI.generateArticle(article.title);

            setRewrittenTitle(response.newTitle);
        } catch (error) {
            console.error('AI改写失败:', error);
            // 如果AI改写失败，使用原标题
            setRewrittenTitle(article.title);
        } finally {
            setRewriting(false);
        }
    };

    // 查看文章详情
    const handlePreview = (article: OriginArticle) => {
        setPreviewArticle(article);
        setPreviewVisible(true);
    };

    // 确认选择
    const handleConfirmSelect = () => {
        if (selectedArticle && rewrittenTitle.trim()) {
            onSelect(selectedArticle, rewrittenTitle.trim());
            // 重置状态
            setSelectedArticle(null);
            setRewrittenTitle('');
        }
    };

    // 取消选择
    const handleCancelSelect = () => {
        setSelectedArticle(null);
        setRewrittenTitle('');
    };

    const columns: ColumnsType<OriginArticle> = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text: string, record: OriginArticle) => (
                <Button type="link" onClick={() => handlePreview(record)}>
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
            render: (text: string) => text ? <Tag color="blue">{text}</Tag> : '-',
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
                        onClick={() => handlePreview(record)}
                    >
                        查看
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        icon={<RobotOutlined />}
                        onClick={() => handleRewriteTitle(record)}
                        loading={rewriting && selectedArticle?.id === record.id}
                    >
                        AI改写
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            {/* 选择原文章弹窗 */}
            <Modal
                title="选择原始文章"
                open={visible}
                onCancel={onCancel}
                width={1000}
                footer={null}
            >
                <Alert
                    message="使用说明"
                    description="选择一篇原始文章，系统将使用AI对原标题进行改写，您可以基于改写后的标题创建新文章。"
                    type="info"
                    style={{ marginBottom: 16 }}
                />

                {/* 搜索筛选区域 */}
                <Space style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="搜索标题"
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 200 }}
                        allowClear
                    />
                    <Select
                        placeholder="选择科室"
                        value={selectedDepartment}
                        onChange={setSelectedDepartment}
                        style={{ width: 150 }}
                        allowClear
                    >
                        {departments.map(dept => (
                            <Option key={dept} value={dept}>{dept}</Option>
                        ))}
                    </Select>
                    <Button icon={<SearchOutlined />} onClick={handleSearch}>
                        搜索
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={fetchArticles}>
                        刷新
                    </Button>
                </Space>

                {/* 文章列表 */}
                <Table
                    columns={columns}
                    dataSource={articles}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        showSizeChanger: false,
                        showQuickJumper: true,
                        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                    }}
                    size="small"
                />

                {/* AI改写结果显示 */}
                {selectedArticle && (
                    <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                        <Text strong>已选择文章：</Text>
                        <Paragraph>{selectedArticle.title}</Paragraph>
                        
                        <Divider style={{ margin: '12px 0' }} />
                        
                        <Text strong>AI改写后标题：</Text>
                        {rewriting ? (
                            <div style={{ marginTop: 8 }}>
                                <Spin /> AI正在改写标题，请稍候...
                            </div>
                        ) : (
                            <div style={{ marginTop: 8 }}>
                                <TextArea
                                    value={rewrittenTitle}
                                    onChange={(e) => setRewrittenTitle(e.target.value)}
                                    rows={2}
                                    placeholder="AI改写的标题将显示在这里，您可以进一步编辑"
                                />
                                <Space style={{ marginTop: 8 }}>
                                    <Button type="primary" onClick={handleConfirmSelect}>
                                        使用此标题
                                    </Button>
                                    <Button onClick={handleCancelSelect}>
                                        重新选择
                                    </Button>
                                </Space>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* 文章详情预览弹窗 */}
            <Modal
                title="文章详情"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewVisible(false)}>
                        关闭
                    </Button>
                ]}
                width={800}
            >
                {previewArticle && (
                    <div>
                        <Typography.Title level={4}>{previewArticle.title}</Typography.Title>
                        {previewArticle.searchTitle && (
                            <div style={{ marginBottom: 16 }}>
                                <Text strong>搜索标题：</Text> {previewArticle.searchTitle}
                            </div>
                        )}
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>医生：</Text> {previewArticle.doctor} 
                            <Text strong style={{ marginLeft: 16 }}>职位：</Text> {previewArticle.position}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>科室：</Text> {previewArticle.department}
                        </div>
                        <Divider />
                        <div>
                            <Text strong>内容：</Text>
                            <div style={{ marginTop: 8, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                                    {previewArticle.content}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default OriginArticleSelector;
