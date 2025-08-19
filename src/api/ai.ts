// 前端不再直接调用百度API，改为调用后端代理接口

// AI写作API - 通过后端代理调用百度文心一言
export const aiWritingAPI = {
  // 根据标题生成文章内容
  generateArticle: async (title: string): Promise<{ content: string; newTitle: string }> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用户未登录');
      }

      const response = await fetch('/api/ai/writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        throw new Error(`AI写作请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code === 1 && data.data) {
        return {
          content: data.data.content,
          newTitle: data.data.newTitle
        };
      } else {
        throw new Error(data.msg || 'AI写作失败');
      }
    } catch (error) {
      console.error('AI写作错误:', error);
      throw error;
    }
  },

  // 使用自定义提示词生成文章内容（暂时不支持，统一使用默认提示词）
  generateArticleWithPrompt: async (prompt: string): Promise<{ content: string; newTitle: string }> => {
    // 从提示词中提取标题（简单实现）
    const titleMatch = prompt.match(/从医生的角度回答：(.+?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : 'AI写作';
    
    return aiWritingAPI.generateArticle(title);
  }
};
