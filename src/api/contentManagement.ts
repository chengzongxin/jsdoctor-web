// 内容管理API接口

import type {
    ContentManagementQuery,
    ContentManagementResponse,
    ContentManagementItem,
    ContentManagementStats,
    DoctorAssignmentRequest
} from '../types/contentManagement';

const API_BASE_URL = 'http://localhost:8000/api';

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

    const response = await fetch(`${API_BASE_URL}${url}`, {
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

// 获取内容管理列表
export const getContentList = async (params: ContentManagementQuery = {}): Promise<ContentManagementResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.articleTitle) searchParams.append('articleTitle', params.articleTitle);
    if (params.articleStatus !== undefined) searchParams.append('articleStatus', params.articleStatus.toString());
    if (params.authorName) searchParams.append('authorName', params.authorName);
    if (params.originArticleTitle) searchParams.append('originArticleTitle', params.originArticleTitle);
    if (params.originArticleDepartment) searchParams.append('originArticleDepartment', params.originArticleDepartment);
    if (params.assignedDoctorName) searchParams.append('assignedDoctorName', params.assignedDoctorName);
    if (params.assignedDoctorDepartment) searchParams.append('assignedDoctorDepartment', params.assignedDoctorDepartment);
    if (params.isAssigned !== undefined) searchParams.append('isAssigned', params.isAssigned.toString());
    if (params.submittedStartDate) searchParams.append('submittedStartDate', params.submittedStartDate);
    if (params.submittedEndDate) searchParams.append('submittedEndDate', params.submittedEndDate);
    if (params.sortField) searchParams.append('sortField', params.sortField);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `/content-management/list${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

    return request<ContentManagementResponse>(url);
};

// 获取内容详情
export const getContentItem = async (articleId: number): Promise<ContentManagementItem> => {
    return request<ContentManagementItem>(`/content-management/${articleId}`);
};

// 批量分派医生
export const batchAssignDoctor = async (data: DoctorAssignmentRequest): Promise<string> => {
    return request<string>('/content-management/assign-doctor', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// 取消医生分派
export const unassignDoctor = async (articleIds: number[]): Promise<string> => {
    return request<string>('/content-management/unassign-doctor', {
        method: 'POST',
        body: JSON.stringify(articleIds),
    });
};

// 获取统计信息
export const getContentStats = async (): Promise<ContentManagementStats> => {
    return request<ContentManagementStats>('/content-management/stats');
};
