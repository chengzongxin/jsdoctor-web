// 文章状态常量
export const ARTICLE_STATUS = {
    SUBMITTED: 1,    // 已提交
    REVIEWING: 2,    // 审核中
    APPROVED: 3,     // 已通过
    REJECTED: 4      // 已拒绝
} as const;

export const ARTICLE_STATUS_TEXT: Record<number, string> = {
    [ARTICLE_STATUS.SUBMITTED]: '已提交',
    [ARTICLE_STATUS.REVIEWING]: '审核中',
    [ARTICLE_STATUS.APPROVED]: '已通过',
    [ARTICLE_STATUS.REJECTED]: '已拒绝'
};

export type ArticleStatus = typeof ARTICLE_STATUS[keyof typeof ARTICLE_STATUS];

// 文章图片类型
export interface ArticleImage {
    id: number;
    articleId: number;
    imageId: number;
    sortOrder: number;
    createdAt: string;
    originalName: string;
    downloadUrl: string;
    fileSize: number;
    fileType: string;
}

// 文章类型
export interface Article {
    id: number;
    title: string;
    content: string;
    authorId: number;
    originArticleId: number | null;
    status: ArticleStatus;
    submittedAt: string;
    reviewedAt: string | null;
    reviewedBy: number | null;
    reviewComment: string | null;
    createdAt: string;
    updatedAt: string;
    authorName: string;
    reviewerName: string | null;
    originArticleTitle: string | null;
    images: ArticleImage[];
}

// 文章提交请求类型
export interface ArticleSubmitRequest {
    title: string;
    content: string;
    originArticleId?: number | null;
    images: ArticleImageRequest[];
}

export interface ArticleImageRequest {
    id: number;
    sortOrder: number;
}

// 文章审核请求类型
export interface ReviewRequest {
    status: ArticleStatus;
    reviewComment: string;
}

// 文章列表响应类型
export interface ArticleListResponse {
    articles: Article[];
    total: number;
    page: number;
    pageSize: number;
}

// 用户类型
export interface User {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
}

// 用户角色类型
export interface UserRole {
    id: number;
    roleName: string;
    roleCode: string;
    description: string;
    createdAt: string;
}

// 用户角色关联类型
export interface UserRoleRelation {
    id: number;
    userId: number;
    roleId: number;
    createdAt: string;
    username: string;
    roleName: string;
    roleCode: string;
}

// 用户创建请求类型
export interface UserCreateRequest {
    username: string;
    email: string;
    password: string;
    roleCode: string;
}
