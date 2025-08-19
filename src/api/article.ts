import type { 
    Article, 
    ArticleSubmitRequest, 
    ReviewRequest, 
    ArticleListResponse,
    UserCreateRequest,
    UserRole,
    UserRoleRelation,
    User
} from '../types/article';

// API 基础配置
const API_BASE_URL = '/api';

// 通用请求函数
const request = async <T>(
    url: string, 
    options: RequestInit = {}
): Promise<T> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('用户未登录');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'token': token,
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    if (responseData.code === 1) {
        return responseData.data;
    } else {
        throw new Error(responseData.msg || '请求失败');
    }
};

// 文章管理API
export const articleAPI = {
    // 提交文章
    submit: (data: ArticleSubmitRequest): Promise<{ success: boolean; message: string }> => {
        return request<{ success: boolean; message: string }>('/articles/submit', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // 获取文章列表
    getList: (page: number = 1, pageSize: number = 20, status?: number, authorId?: number): Promise<ArticleListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        
        if (status !== undefined) {
            params.append('status', status.toString());
        }
        
        if (authorId !== undefined) {
            params.append('authorId', authorId.toString());
        }

        return request<ArticleListResponse>(`/articles/list?${params.toString()}`);
    },

    // 获取文章详情
    getDetail: (id: number): Promise<Article> => {
        return request<Article>(`/articles/${id}`);
    },

    // 更新文章
    update: (id: number, data: ArticleSubmitRequest): Promise<{ success: boolean; message: string }> => {
        return request<{ success: boolean; message: string }>(`/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // 删除文章
    delete: (id: number): Promise<{ success: boolean; message: string }> => {
        return request<{ success: boolean; message: string }>(`/articles/${id}`, {
            method: 'DELETE',
        });
    },

    // 审核文章
    review: (id: number, data: ReviewRequest): Promise<{ success: boolean; message: string }> => {
        return request<{ success: boolean; message: string }>(`/articles/${id}/review`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // 获取待审核文章列表
    getPendingReview: (): Promise<Article[]> => {
        return request<Article[]>('/articles/pending-review');
    },

    // 获取我的文章列表
    getMyArticles: (): Promise<Article[]> => {
        return request<Article[]>('/articles/my');
    },
};

// 用户管理API
export const userAPI = {
    // 创建学生账号
    createStudent: (data: UserCreateRequest): Promise<{ success: boolean; message: string }> => {
        return request<{ success: boolean; message: string }>('/users/students', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // 创建审核员账号
    createReviewer: (data: UserCreateRequest): Promise<{ success: boolean; message: string }> => {
        return request<{ success: boolean; message: string }>('/users/reviewers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // 获取所有角色
    getAllRoles: (): Promise<UserRole[]> => {
        return request<UserRole[]>('/users/roles');
    },

    // 获取用户角色
    getUserRoles: (userId: number): Promise<UserRoleRelation[]> => {
        return request<UserRoleRelation[]>(`/users/${userId}/roles`);
    },

    // 分配角色
    assignRole: (userId: number, roleCode: string): Promise<{ success: boolean; message: string }> => {
        const params = new URLSearchParams({ roleCode });
        return request<{ success: boolean; message: string }>(`/users/${userId}/roles?${params.toString()}`, {
            method: 'POST',
        });
    },

    // 移除角色
    removeRole: (userId: number, roleCode: string): Promise<{ success: boolean; message: string }> => {
        const params = new URLSearchParams({ roleCode });
        return request<{ success: boolean; message: string }>(`/users/${userId}/roles?${params.toString()}`, {
            method: 'DELETE',
        });
    },

    // 获取当前用户角色
    getMyRoles: (): Promise<UserRoleRelation[]> => {
        return request<UserRoleRelation[]>('/users/my/roles');
    },

    // 获取所有用户列表
    getAllUsers: (): Promise<User[]> => {
        return request<User[]>('/users/all');
    },

    // 获取用户详细信息
    getUserDetail: (userId: number): Promise<{ user: User; roles: UserRoleRelation[] }> => {
        return request<{ user: User; roles: UserRoleRelation[] }>(`/users/${userId}/detail`);
    },
};
