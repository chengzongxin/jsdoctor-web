import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Space, Upload, message, Popover, Input, Tooltip, Divider } from 'antd';
import { markdownToHtml, getWordCount, getCharCount } from '../utils/markdownUtils';
import { 
  SmileOutlined, 
  PictureOutlined, 
  BoldOutlined, 
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  CodeOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MutedOutlined,
  TableOutlined,
  ClearOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { TextArea } = Input;

interface ImprovedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

// 扩展的Emoji表情数据
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
  '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '��', '👻', '💀',
  '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽'
];

const ImprovedRichTextEditor: React.FC<ImprovedRichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = '请输入文章内容...',
  height = 400
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 安全的设置光标位置函数
  const safeSetSelectionRange = (start: number, end: number) => {
    if (textareaRef.current && typeof textareaRef.current.setSelectionRange === 'function') {
      try {
        const textarea = textareaRef.current;
        textarea.focus();
        textarea.setSelectionRange(start, end);
        return true;
      } catch (error) {
        console.error('设置光标位置失败:', error);
        return false;
      }
    } else {
      console.warn('textarea 引用无效或 setSelectionRange 方法不存在');
      return false;
    }
  };
  
  // 确保 textarea 在组件挂载后获得焦点
  useEffect(() => {
    if (textareaRef.current) {
      // 延迟一下，确保 DOM 完全渲染
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  }, []);

  // 插入文本到光标位置
  const insertText = (text: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    
    // 确保 textarea 获得焦点
    textarea.focus();
    
    // 获取光标位置，如果无效则使用默认值
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    
    // 如果光标位置无效，则使用文本末尾
    if (start === null || end === null || start === undefined || end === undefined || start < 0 || end < 0) {
      start = value.length;
      end = value.length;
      console.log('insertText - 光标位置无效，使用文本末尾:', { start, end });
    }
    
    const newValue = value.substring(0, start) + text + value.substring(end);
    
    // 防止内容重复：检查新值是否与当前值相同
    if (newValue !== value) {
      console.log('insertText - 更新内容:', { text, newValue });
      onChange(newValue);
      
      // 设置光标位置
      setTimeout(() => {
        safeSetSelectionRange(start + text.length, start + text.length);
      }, 0);
    } else {
      console.log('insertText - 内容未变化，跳过更新');
    }
  };

  // 应用文本格式
  const applyFormat = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    
    // 确保 textarea 获得焦点
    textarea.focus();
    
    // 获取光标位置，如果无效则使用默认值
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    
    // 如果光标位置无效，则使用文本末尾
    if (start === null || end === null || start === undefined || end === undefined || start < 0 || end < 0) {
      start = value.length;
      end = value.length;
      console.log('光标位置无效，使用文本末尾:', { start, end });
    }
    
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    let newCursorStart = start;
    let newCursorEnd = start;
    
    switch (format) {
      case 'bold':
        if (selectedText) {
          formattedText = `**${selectedText}**`;
          newCursorStart = start;
          newCursorEnd = start + formattedText.length;
        } else {
          formattedText = `**粗体文字**`;
          newCursorStart = start + 2; // 光标放在"粗体文字"中间
          newCursorEnd = start + 6;
        }
        break;
      case 'italic':
        if (selectedText) {
          formattedText = `*${selectedText}*`;
          newCursorStart = start;
          newCursorEnd = start + formattedText.length;
        } else {
          formattedText = `*斜体文字*`;
          newCursorStart = start + 1; // 光标放在"斜体文字"中间
          newCursorEnd = start + 5;
        }
        break;
      case 'underline':
        if (selectedText) {
          formattedText = `__${selectedText}__`;
          newCursorStart = start;
          newCursorEnd = start + formattedText.length;
        } else {
          formattedText = `__下划线文字__`;
          newCursorStart = start + 2; // 光标放在"下划线文字"中间
          newCursorEnd = start + 6;
        }
        break;
      case 'code':
        if (selectedText) {
          formattedText = `\`${selectedText}\``;
          newCursorStart = start;
          newCursorEnd = start + formattedText.length;
        } else {
          formattedText = `\`代码\``;
          newCursorStart = start + 1; // 光标放在"代码"中间
          newCursorEnd = start + 3;
        }
        break;
      case 'quote':
        if (selectedText) {
          formattedText = `> ${selectedText}`;
          newCursorStart = start;
          newCursorEnd = start + formattedText.length;
        } else {
          formattedText = `> 引用文字`;
          newCursorStart = start + 2; // 光标放在"引用文字"中间
          newCursorEnd = start + 6;
        }
        break;
      case 'orderedList':
        if (selectedText) {
          formattedText = `1. ${selectedText}`;
          newCursorStart = start;
          newCursorEnd = start + formattedText.length;
        } else {
          formattedText = `1. 列表项`;
          newCursorStart = start + 3; // 光标放在"列表项"中间
          newCursorEnd = start + 7;
        }
        break;
      case 'unorderedList':
        if (selectedText) {
          formattedText = `- ${selectedText}`;
          newCursorStart = start;
          newCursorEnd = start + formattedText.length;
        } else {
          formattedText = `- 列表项`;
          newCursorStart = start + 2; // 光标放在"列表项"中间
          newCursorEnd = start + 6;
        }
        break;
      case 'h1':
        if (selectedText) {
          formattedText = `# ${selectedText}`;
          newCursorStart = start;
          newCursorEnd = start + formattedText.length;
        } else {
          formattedText = `# 一级标题`;
          newCursorStart = start + 2; // 光标放在"一级标题"中间
          newCursorEnd = start + 8;
        }
        break;
      case 'h2':
        if (selectedText) {
          formattedText = `## ${selectedText}`;
          newCursorStart = start;
          newCursorEnd = start + formattedText.length;
        } else {
          formattedText = `## 二级标题`;
          newCursorStart = start + 3; // 光标放在"二级标题"中间
          newCursorEnd = start + 9;
        }
        break;
      case 'h3':
        if (selectedText) {
          formattedText = `### ${selectedText}`;
          newCursorStart = start;
          newCursorEnd = start + formattedText.length;
        } else {
          formattedText = `### 三级标题`;
          newCursorStart = start + 4; // 光标放在"三级标题"中间
          newCursorEnd = start + 10;
        }
        break;
      default:
        formattedText = selectedText;
        newCursorStart = start;
        newCursorEnd = start + selectedText.length;
    }
    
    // 构建新的内容，只在光标位置插入格式化的文本
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    
    // 防止内容重复：检查新值是否与当前值相同
    if (newValue !== value) {
      console.log('applyFormat - 更新内容:', { format, selectedText, newValue });
      // 更新内容
      onChange(newValue);
      
      // 设置光标位置
      setTimeout(() => {
        safeSetSelectionRange(newCursorStart, newCursorEnd);
      }, 0);
    } else {
      console.log('applyFormat - 内容未变化，跳过更新');
    }
  };

  // 插入链接
  const insertLink = () => {
    if (linkText && linkUrl) {
      insertText(`[${linkText}](${linkUrl})`);
      setLinkText('');
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  // 插入表格
  const insertTable = () => {
    const tableMarkdown = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |
`;
    insertText(tableMarkdown);
  };

  // 图片上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/files/upload',
    headers: {
      token: localStorage.getItem('token') || '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        const imageUrl = info.file.response?.data?.download_url;
        if (imageUrl) {
          insertText(`![图片](${imageUrl})`);
          message.success('图片插入成功');
        }
      } else if (info.file.status === 'error') {
        message.error('图片上传失败');
      }
    },
  };

  // 清空内容
  const clearContent = () => {
    onChange('');
    message.success('内容已清空');
  };

  return (
    <Card size="small" style={{ border: '1px solid #d9d9d9' }}>
      {/* 工具栏 */}
      <div style={{ 
        border: '1px solid #d9d9d9', 
        borderBottom: 'none', 
        padding: '12px', 
        backgroundColor: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        borderRadius: '6px 6px 0 0'
      }}>
        {/* 文本格式 */}
        <Space size="small">
          <Tooltip title="粗体">
            <Button
              type="text"
              icon={<BoldOutlined />}
              size="small"
              onClick={() => applyFormat('bold')}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Tooltip>
          <Tooltip title="斜体">
            <Button
              type="text"
              icon={<ItalicOutlined />}
              size="small"
              onClick={() => applyFormat('italic')}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Tooltip>
          <Tooltip title="下划线">
            <Button
              type="text"
              icon={<UnderlineOutlined />}
              size="small"
              onClick={() => applyFormat('underline')}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Tooltip>
          <Tooltip title="代码">
            <Button
              type="text"
              icon={<CodeOutlined />}
              size="small"
              onClick={() => applyFormat('code')}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Tooltip>
        </Space>

        <Divider type="vertical" style={{ margin: '0 8px' }} />

        {/* 标题格式 */}
        <Space size="small">
          <Tooltip title="一级标题">
            <Button
              type="text"
              size="small"
              onClick={() => applyFormat('h1')}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px', fontWeight: 'bold' }}
            >
              H1
            </Button>
          </Tooltip>
          <Tooltip title="二级标题">
            <Button
              type="text"
              size="small"
              onClick={() => applyFormat('h2')}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px', fontWeight: 'bold' }}
            >
              H2
            </Button>
          </Tooltip>
          <Tooltip title="三级标题">
            <Button
              type="text"
              size="small"
              onClick={() => applyFormat('h3')}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px', fontWeight: 'bold' }}
            >
              H3
            </Button>
          </Tooltip>
        </Space>

        <Divider type="vertical" style={{ margin: '0 8px' }} />

        {/* 列表和引用 */}
        <Space size="small">
          <Tooltip title="有序列表">
            <Button
              type="text"
              icon={<OrderedListOutlined />}
              size="small"
              onClick={() => applyFormat('orderedList')}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Tooltip>
          <Tooltip title="无序列表">
            <Button
              type="text"
              icon={<UnorderedListOutlined />}
              size="small"
              onClick={() => applyFormat('unorderedList')}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Tooltip>
          <Tooltip title="引用">
            <Button
              type="text"
              icon={<MutedOutlined />}
              size="small"
              onClick={() => applyFormat('quote')}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Tooltip>
        </Space>

        <Divider type="vertical" style={{ margin: '0 8px' }} />

        {/* 链接和表格 */}
        <Space size="small">
          <Tooltip title="插入链接">
            <Button
              type="text"
              icon={<LinkOutlined />}
              size="small"
              onClick={() => setShowLinkDialog(true)}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Tooltip>
          <Tooltip title="插入表格">
            <Button
              type="text"
              icon={<TableOutlined />}
              size="small"
              onClick={insertTable}
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Tooltip>
        </Space>

        <Divider type="vertical" style={{ margin: '0 8px' }} />

        {/* Emoji表情选择器 */}
        <Popover
          content={
            <div style={{ 
              width: '320px', 
              maxHeight: '240px', 
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: '4px'
            }}>
              {emojis.map((emoji, index) => (
                <Button
                  key={index}
                  type="text"
                  size="small"
                  onClick={() => {
                    insertText(emoji);
                    setShowEmojiPicker(false);
                  }}
                  style={{ 
                    fontSize: '16px', 
                    padding: '4px',
                    minWidth: 'auto',
                    height: 'auto'
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          }
          title="选择表情"
          trigger="click"
          open={showEmojiPicker}
          onOpenChange={setShowEmojiPicker}
        >
          <Tooltip title="插入表情">
            <Button
              type="text"
              icon={<SmileOutlined />}
              size="small"
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Tooltip>
        </Popover>

        {/* 图片上传 */}
        <Upload {...uploadProps} showUploadList={false}>
          <Tooltip title="插入图片">
            <Button
              type="text"
              icon={<PictureOutlined />}
              size="small"
              style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
            />
          </Tooltip>
        </Upload>

        <Divider type="vertical" style={{ margin: '0 8px' }} />

        {/* 清空按钮 */}
        <Tooltip title="清空内容">
          <Button
            type="text"
            icon={<ClearOutlined />}
            size="small"
            onClick={clearContent}
            style={{ border: '1px solid #d9d9d9', borderRadius: '4px', color: '#ff4d4f' }}
          />
        </Tooltip>
      </div>

      {/* 编辑器主体 */}
      <TextArea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoSize={{ minRows: Math.floor(height / 24), maxRows: Math.floor(height / 16) }}
        style={{
          border: '1px solid #d9d9d9',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.6',
          resize: 'vertical'
        }}
      />

      {/* 链接对话框 */}
      {showLinkDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Card title="插入链接" style={{ width: 400 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="链接文本"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
              <Input
                placeholder="链接地址"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <Space>
                <Button onClick={() => setShowLinkDialog(false)}>取消</Button>
                <Button type="primary" onClick={insertLink}>插入</Button>
              </Space>
            </Space>
          </Card>
        </div>
      )}

      {/* 预览区域 */}
      {value && (
        <Card 
          title="预览效果" 
          size="small" 
          style={{ marginTop: '16px' }}
          extra={
            <Button 
              type="link" 
              size="small"
              onClick={clearContent}
            >
              清空内容
            </Button>
          }
        >
          <div 
            style={{
              padding: '16px',
              border: '1px solid #f0f0f0',
              borderRadius: '4px',
              backgroundColor: '#fafafa',
              minHeight: '100px',
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit'
            }}
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(value)
            }}
          />
        </Card>
      )}

      {/* 字数统计 */}
      <div style={{ 
        marginTop: '8px', 
        textAlign: 'right', 
        color: '#666', 
        fontSize: '12px' 
      }}>
        字数：{getWordCount(value)} | 字符：{getCharCount(value)}
      </div>
    </Card>
  );
};

export default ImprovedRichTextEditor;