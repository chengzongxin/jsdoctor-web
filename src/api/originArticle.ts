// 原始文章API接口
import type { OriginArticle, OriginArticleImportResult, OriginArticleListResponse, OriginArticleQueryParams } from '../types/originArticle';

const request = async <T>(
    url: string, 
    options: RequestInit = {}
): Promise<T> => {
    const token = localStorage.getItem('token');
    
    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'token': token }),
        },
    };

    const response = await fetch(`${url}`, {
        ...defaultOptions,
        ...options,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.code !== 1) {
        throw new Error(result.msg || '请求失败');
    }
    
    return result.data;
};

// 导入Excel文件
export const importExcelFile = async (file: File): Promise<OriginArticleImportResult | string> => {
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`/api/origin-articles/import`, {
        method: 'POST',
        headers: {
            ...(token && { 'token': token }),
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.code !== 1) {
        throw new Error(result.msg || '导入失败');
    }
    
    return result.data;
};

// 获取原始文章列表
export const getOriginArticleList = async (params: OriginArticleQueryParams = {}): Promise<OriginArticleListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.title) searchParams.append('title', params.title);
    if (params.department) searchParams.append('department', params.department);
    if (params.status !== undefined) searchParams.append('status', params.status.toString());
    
    const url = `/api/origin-articles/list${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    return request<OriginArticleListResponse>(url);
};

// 获取原始文章详情
export const getOriginArticleDetail = async (id: number): Promise<OriginArticle> => {
    return request<OriginArticle>(`/api/origin-articles/${id}`);
};

// 更新原始文章
export const updateOriginArticle = async (id: number, article: Partial<OriginArticle>): Promise<string> => {
    return request<string>(`/api/origin-articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(article),
    });
};

// 删除原始文章
export const deleteOriginArticle = async (id: number): Promise<string> => {
    return request<string>(`/api/origin-articles/${id}`, {
        method: 'DELETE',
    });
};

// 批量删除原始文章
export const deleteOriginArticles = async (ids: number[]): Promise<string> => {
    return request<string>('/api/origin-articles/batch', {
        method: 'DELETE',
        body: JSON.stringify(ids),
    });
};

// 获取科室列表
export const getDepartments = async (): Promise<string[]> => {
    return request<string[]>('/api/origin-articles/departments');
};

// 获取可选择的文章列表（学生用）
export const getArticlesForSelection = async (department?: string, limit: number = 50): Promise<OriginArticle[]> => {
    const searchParams = new URLSearchParams();
    
    if (department) searchParams.append('department', department);
    searchParams.append('limit', limit.toString());
    
    const url = `/api/origin-articles/selection${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    return request<OriginArticle[]>(url);
};

// 按科室领取下一个可用的源文章
export const claimNextArticle = async (department: string): Promise<OriginArticle> => {
    const searchParams = new URLSearchParams();
    searchParams.append('department', department);
    
    const url = `/api/origin-articles/claim-next?${searchParams.toString()}`;
    
    return request<OriginArticle>(url, {
        method: 'POST',
    });
};

// 标记源文章为已使用
export const markArticleAsUsed = async (id: number): Promise<string> => {
    return request<string>(`/api/origin-articles/${id}/mark-used`, {
        method: 'POST',
    });
};
