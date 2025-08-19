import React, { useState, useRef } from 'react';
import { Card, Button, Space, Upload, message, Popover, Input } from 'antd';
import { 
  SmileOutlined, 
  PictureOutlined, 
  BoldOutlined, 
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  CodeOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { TextArea } = Input;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Emoji表情数据
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
  '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
  '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽'
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = '请输入文章内容...' 
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 插入文本到光标位置
  const insertText = (text: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newValue = value.substring(0, start) + text + value.substring(end);
    onChange(newValue);
    
    // 设置光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // 应用文本格式
  const applyFormat = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'link':
        formattedText = `[${selectedText}](链接地址)`;
        break;
      case 'orderedList':
        formattedText = `1. ${selectedText}`;
        break;
      case 'unorderedList':
        formattedText = `- ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    
    // 设置光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 0);
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

  return (
    <Card title="文章编辑器" size="small">
      {/* 工具栏 */}
      <div style={{ 
        border: '1px solid #d9d9d9', 
        borderBottom: 'none', 
        padding: '8px', 
        backgroundColor: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {/* 格式按钮 */}
        <Button
          type="text"
          icon={<BoldOutlined />}
          title="粗体"
          size="small"
          onClick={() => applyFormat('bold')}
          style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
        />
        <Button
          type="text"
          icon={<ItalicOutlined />}
          title="斜体"
          size="small"
          onClick={() => applyFormat('italic')}
          style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
        />
        <Button
          type="text"
          icon={<UnderlineOutlined />}
          title="下划线"
          size="small"
          onClick={() => applyFormat('underline')}
          style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
        />
        <Button
          type="text"
          icon={<CodeOutlined />}
          title="代码"
          size="small"
          onClick={() => applyFormat('code')}
          style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
        />
        <Button
          type="text"
          icon={<LinkOutlined />}
          title="链接"
          size="small"
          onClick={() => applyFormat('link')}
          style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
        />
        <Button
          type="text"
          icon={<OrderedListOutlined />}
          title="有序列表"
          size="small"
          onClick={() => applyFormat('orderedList')}
          style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
        />
        <Button
          type="text"
          icon={<UnorderedListOutlined />}
          title="无序列表"
          size="small"
          onClick={() => applyFormat('unorderedList')}
          style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
        />
        
        {/* Emoji表情选择器 */}
        <Popover
          content={
            <div style={{ 
              width: '300px', 
              maxHeight: '200px', 
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
          <Button
            type="text"
            icon={<SmileOutlined />}
            title="插入表情"
            size="small"
            style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
          />
        </Popover>

        {/* 图片上传 */}
        <Upload {...uploadProps} showUploadList={false}>
          <Button
            type="text"
            icon={<PictureOutlined />}
            title="插入图片"
            size="small"
            style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
          />
        </Upload>
      </div>

      {/* 编辑器主体 */}
      <TextArea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoSize={{ minRows: 15, maxRows: 20 }}
        style={{
          border: '1px solid #d9d9d9',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.6'
        }}
      />

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
              onClick={() => onChange('')}
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
              __html: value
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/__(.*?)__/g, '<u>$1</u>')
                .replace(/`(.*?)`/g, '<code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">$1</code>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
                .replace(/^(\d+\.\s.*)$/gm, '<ol><li>$1</li></ol>')
                .replace(/^(-\s.*)$/gm, '<ul><li>$1</li></ul>')
                .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
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
        字数：{value?.length} | 字符：{value?.replace(/\s/g, '')?.length}
      </div>
    </Card>
  );
};

export default RichTextEditor;
