import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Card, message } from 'antd';

interface TinyMCEEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  value,
  onChange,
  placeholder = '请输入文章内容...',
  height = 500
}) => {
  // TinyMCE配置
  const init = {
    height: height,
    menubar: false, // 隐藏顶部菜单栏，让界面更简洁
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
      'emoticons', 'codesample', 'hr', 'pagebreak', 'nonbreaking',
      'directionality', 'template', 'paste', 'textpattern', 'imagetools'
    ],
    toolbar: [
      'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify',
      'bullist numlist outdent indent | link image media table | forecolor backcolor | emoticons codesample',
      'removeformat | help | code fullscreen'
    ],
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
        font-size: 14px; 
        line-height: 1.6; 
        color: #333;
      }
      .mce-content-body { 
        padding: 20px; 
      }
      h1, h2, h3, h4, h5, h6 { 
        margin-top: 20px; 
        margin-bottom: 10px; 
        font-weight: 600; 
      }
      p { 
        margin-bottom: 16px; 
      }
      blockquote { 
        border-left: 4px solid #ddd; 
        padding-left: 16px; 
        margin: 16px 0; 
        color: #666; 
      }
      code { 
        background: #f5f5f5; 
        padding: 2px 4px; 
        border-radius: 3px; 
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
      }
      pre { 
        background: #f5f5f5; 
        padding: 16px; 
        border-radius: 6px; 
        overflow-x: auto; 
      }
      table { 
        border-collapse: collapse; 
        width: 100%; 
        margin: 16px 0; 
      }
      th, td { 
        border: 1px solid #ddd; 
        padding: 8px 12px; 
        text-align: left; 
      }
      th { 
        background: #f9f9f9; 
        font-weight: 600; 
      }
      img { 
        max-width: 100%; 
        height: auto; 
        border-radius: 4px; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
      }
    `,
    language: 'zh_CN', // 中文界面
    language_url: 'https://cdn.jsdelivr.net/npm/tinymce-langs@1.0.0/langs/zh_CN.js',
    branding: false, // 隐藏TinyMCE品牌标识
    elementpath: false, // 隐藏底部元素路径
    statusbar: true, // 显示状态栏（字数统计等）
    resize: true, // 允许调整大小
    paste_data_images: true, // 支持粘贴图片
    automatic_uploads: true, // 自动上传
    file_picker_types: 'image', // 文件选择器类型
    images_upload_url: '/api/files/upload', // 图片上传接口
    images_upload_handler: (blobInfo: any, progress: any) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());
        
        // 添加token到请求头
        const token = localStorage.getItem('token');
        
        fetch('/api/files/upload', {
          method: 'POST',
          headers: {
            'token': token || '',
          },
          body: formData
        })
        .then(response => response.json())
        .then(result => {
          if (result.code === 1) {
            resolve(result.data.download_url);
            message.success('图片上传成功');
          } else {
            reject(result.msg || '图片上传失败');
            message.error(result.msg || '图片上传失败');
          }
        })
        .catch(error => {
          reject('图片上传失败');
          message.error('图片上传失败');
        });
      });
    },
    // 自定义按钮和功能
    setup: (editor: any) => {
      // 添加自定义表情按钮
      editor.ui.registry.addButton('emoticons', {
        text: '😊',
        tooltip: '插入表情',
        onAction: () => {
          const emoticons = [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
            '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
            '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
            '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
            '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
          ];
          
          editor.windowManager.open({
            title: '选择表情',
            body: {
              type: 'panel',
              items: [{
                type: 'collection',
                name: 'emoticon',
                label: '表情',
                items: emoticons.map(emoji => ({
                  type: 'card',
                  label: emoji,
                  value: emoji
                }))
              }]
            },
            buttons: [
              {
                type: 'cancel',
                text: '取消'
              },
              {
                type: 'submit',
                text: '插入',
                primary: true
              }
            ],
            onSubmit: (api: any) => {
              const data = api.getData();
              editor.insertContent(data.emoticon);
              api.close();
            }
          });
        }
      });

      // 添加字数统计显示
      editor.on('KeyUp', () => {
        const content = editor.getContent({ format: 'text' });
        const wordCount = content.length;
        const charCount = content.replace(/\s/g, '').length;
        
        // 更新状态栏显示
        editor.theme.panel && editor.theme.panel.find('#statusbar').text(
          `字数：${wordCount} | 字符：${charCount}`
        );
      });
    }
  };

  return (
    <Card size="small" style={{ border: '1px solid #d9d9d9' }}>
      <Editor
        apiKey="your-api-key-here" // 可以申请免费API key
        init={init}
        value={value}
        onEditorChange={(content: string) => onChange(content)}
        // placeholder={placeholder}
      />
    </Card>
  );
};

export default TinyMCEEditor;
