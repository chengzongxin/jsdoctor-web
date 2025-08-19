// 原始文章相关类型定义

export interface OriginArticle {
    id: number;
    searchTitle: string;
    title: string;
    doctor: string;
    position: string;
    department: string;
    content: string;
    importedBy: number;
    status: number;
    createdAt: string;
    updatedAt: string;
    importedByUsername?: string;
}

export interface OriginArticleImportResult {
    totalCount: number;
    successCount: number;
    failureCount: number;
    failureReasons: string[];
    failureRows: number[];
}

export interface OriginArticleListResponse {
    articles: OriginArticle[];
    total: number;
    page: number;
    pageSize: number;
}

export interface OriginArticleQueryParams {
    page?: number;
    pageSize?: number;
    title?: string;
    department?: string;
    status?: number;
}

// 状态常量
export const ORIGIN_ARTICLE_STATUS = {
    ENABLED: 1,   // 可用
    DISABLED: 0   // 禁用
} as const;

export type OriginArticleStatus = typeof ORIGIN_ARTICLE_STATUS[keyof typeof ORIGIN_ARTICLE_STATUS];
