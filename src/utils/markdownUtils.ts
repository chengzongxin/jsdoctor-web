/**
 * Markdown工具函数
 * 用于将Markdown格式转换为HTML显示
 */

/**
 * 将Markdown文本转换为HTML
 * @param markdown Markdown格式的文本
 * @returns HTML字符串
 */
export const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  return markdown
    // 粗体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 下划线
    .replace(/__(.*?)__/g, '<u>$1</u>')
    // 行内代码
    .replace(/`(.*?)`/g, '<code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: Monaco, Menlo, Ubuntu Mono, monospace;">$1</code>')
    // 引用块
    .replace(/^>(.*)$/gm, '<blockquote style="border-left: 4px solid #ddd; padding-left: 16px; margin: 16px 0; color: #666; background: #f9f9f9; padding: 12px; border-radius: 4px;">$1</blockquote>')
    // 一级标题
    .replace(/^# (.*)$/gm, '<h1 style="margin: 20px 0 10px 0; font-size: 24px; font-weight: 600; color: #333;">$1</h1>')
    // 二级标题
    .replace(/^## (.*)$/gm, '<h2 style="margin: 18px 0 8px 0; font-size: 20px; font-weight: 600; color: #333;">$1</h2>')
    // 三级标题
    .replace(/^### (.*)$/gm, '<h3 style="margin: 16px 0 6px 0; font-size: 18px; font-weight: 600; color: #333;">$1</h3>')
    // 链接
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #1890ff; text-decoration: none;">$1</a>')
    // 有序列表
    .replace(/^(\d+\.\s.*)$/gm, '<ol style="margin: 16px 0; padding-left: 20px;"><li style="margin: 8px 0;">$1</li></ol>')
    // 无序列表
    .replace(/^(-\s.*)$/gm, '<ul style="margin: 16px 0; padding-left: 20px;"><li style="margin: 8px 0;">$1</li></ul>')
    // 图片
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 16px 0;" />')
    // 换行符
    .replace(/\n/g, '<br>');
};

/**
 * 获取纯文本内容（去除Markdown标记）
 * @param markdown Markdown格式的文本
 * @returns 纯文本
 */
export const getPlainText = (markdown: string): string => {
  if (!markdown) return '';
  
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
    .replace(/__(.*?)__/g, '$1') // 移除下划线标记
    .replace(/`(.*?)`/g, '$1') // 移除代码标记
    .replace(/^>(.*)$/gm, '$1') // 移除引用标记
    .replace(/^#+\s*(.*)$/gm, '$1') // 移除标题标记
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接标记，保留链接文本
    .replace(/^[\d\-]+\.\s*(.*)$/gm, '$1') // 移除列表标记
    .replace(/!\[(.*?)\]\(.*?\)/g, '$1'); // 移除图片标记，保留alt文本
};

/**
 * 计算字数（包含空格）
 * @param text 文本内容
 * @returns 字符数
 */
export const getWordCount = (text: string): number => {
  return text ? text.length : 0;
};

/**
 * 计算字符数（不包含空格）
 * @param text 文本内容
 * @returns 字符数
 */
export const getCharCount = (text: string): number => {
  return text ? text.replace(/\s/g, '').length : 0;
};
