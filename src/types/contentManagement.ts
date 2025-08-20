// 内容管理相关类型定义

export interface ContentManagementItem {
    // 文章基本信息（可能为空，因为原始文章可能还没有对应的文章）
    articleId: number | null;
    articleTitle: string | null;
    articleStatus: number | null;
    articleSubmittedAt: string | null;
    articleReviewedAt: string | null;
    authorName: string | null;
    reviewerName: string | null;
    reviewComment: string | null;
    
    // 原始文章信息（原始文章总是存在的，因为以它为主表）
    originArticleId: number;
    originArticleTitle: string;
    originArticleCreatedAt: string;
    originArticleDoctor: string | null;
    originArticleDepartment: string | null;
    
    // 分派医生信息
    assignedDoctorId: number | null;
    assignedDoctorName: string | null;
    assignedDoctorDepartment: string | null;
    assignedDoctorHospital: string | null;
    assignedDoctorBaijiahaoId: string | null;
    assignedDoctorBaijiahaoAccount: string | null;
    
    // 状态文本
    articleStatusText: string;
    
    // 是否已分派医生
    isAssigned: boolean;
    
    // 时间信息
    createdAt: string;
    updatedAt: string;
}

export interface ContentManagementQuery {
    page?: number;
    pageSize?: number;
    
    // 文章筛选条件
    articleTitle?: string;
    articleStatus?: number;
    authorName?: string;
    
    // 原始文章筛选条件
    originArticleTitle?: string;
    originArticleDepartment?: string;
    
    // 医生分派筛选条件
    assignedDoctorName?: string;
    assignedDoctorDepartment?: string;
    isAssigned?: boolean;
    
    // 时间筛选条件
    submittedStartDate?: string;
    submittedEndDate?: string;
    
    // 排序字段
    sortField?: string;
    sortOrder?: string;
}

export interface ContentManagementStats {
    totalArticles: number;
    submittedArticles: number;
    reviewingArticles: number;
    approvedArticles: number;
    rejectedArticles: number;
    assignedArticles: number;
    unassignedArticles: number;
    totalOriginArticles: number;
    usedOriginArticles: number;
}

export interface ContentManagementResponse {
    items: ContentManagementItem[];
    total: number;
    page: number;
    pageSize: number;
    stats: ContentManagementStats;
}

export interface DoctorAssignmentRequest {
    articleIds: number[];
    doctorId: number | null;
    reason?: string;
}

// 文章状态常量
export const ARTICLE_STATUS = {
    SUBMITTED: 1,   // 已提交
    REVIEWING: 2,   // 审核中
    APPROVED: 3,    // 已通过
    REJECTED: 4     // 已拒绝
} as const;

export type ArticleStatus = typeof ARTICLE_STATUS[keyof typeof ARTICLE_STATUS];

// 文章状态文本映射
export const ARTICLE_STATUS_TEXT: Record<number, string> = {
    [ARTICLE_STATUS.SUBMITTED]: '已提交',
    [ARTICLE_STATUS.REVIEWING]: '审核中',
    [ARTICLE_STATUS.APPROVED]: '已通过',
    [ARTICLE_STATUS.REJECTED]: '已拒绝'
};

// 文章状态颜色映射
export const ARTICLE_STATUS_COLOR: Record<number, string> = {
    [ARTICLE_STATUS.SUBMITTED]: 'blue',
    [ARTICLE_STATUS.REVIEWING]: 'orange',
    [ARTICLE_STATUS.APPROVED]: 'green',
    [ARTICLE_STATUS.REJECTED]: 'red'
};

// 排序字段选项
export const SORT_FIELD_OPTIONS = [
    { label: '创建时间', value: 'created_at' },
    { label: '提交时间', value: 'submitted_at' },
    { label: '审核时间', value: 'reviewed_at' }
];

// 分派状态选项
export const ASSIGNMENT_STATUS_OPTIONS = [
    { label: '全部', value: null },
    { label: '已分派', value: true },
    { label: '未分派', value: false }
];
