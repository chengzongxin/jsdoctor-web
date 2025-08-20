// 医生相关类型定义

export interface Doctor {
    id: number;
    baijiahaoId: string;
    baijiahaoAccount: string;
    name: string;
    hospital: string;
    title: string;
    department: string;
    level: string;
    dailyPublishLimit: number;
    status: number;
    createdAt: string;
    updatedAt: string;
}

export interface DoctorCreateRequest {
    baijiahaoId: string;
    baijiahaoAccount: string;
    name: string;
    hospital: string;
    title: string;
    department: string;
    level: string;
    dailyPublishLimit: number;
}

export interface DoctorUpdateRequest {
    baijiahaoAccount: string;
    name: string;
    hospital: string;
    title: string;
    department: string;
    level: string;
    dailyPublishLimit: number;
    status: number;
}

export interface DoctorQueryParams {
    page?: number;
    pageSize?: number;
    name?: string;
    hospital?: string;
    department?: string;
    status?: number;
}

export interface DoctorListResponse {
    doctors: Doctor[];
    total: number;
    page: number;
    pageSize: number;
}

// 状态常量
export const DOCTOR_STATUS = {
    ENABLED: 1,   // 启用
    DISABLED: 0   // 禁用
} as const;

export type DoctorStatus = typeof DOCTOR_STATUS[keyof typeof DOCTOR_STATUS];

// 状态文本映射
export const DOCTOR_STATUS_TEXT: Record<number, string> = {
    [DOCTOR_STATUS.ENABLED]: '启用',
    [DOCTOR_STATUS.DISABLED]: '禁用'
};

// 常用职称选项
export const TITLE_OPTIONS = [
    '主任医师',
    '副主任医师',
    '主治医师',
    '住院医师',
    '医师',
    '教授',
    '副教授',
    '讲师'
];

// 常用职级选项
export const LEVEL_OPTIONS = [
    '正高',
    '副高',
    '中级',
    '初级'
];

// 常用科室选项
export const DEPARTMENT_OPTIONS = [
    '心血管科',
    '呼吸科',
    '消化科',
    '神经科',
    '内分泌科',
    '肾内科',
    '血液科',
    '风湿免疫科',
    '普外科',
    '骨科',
    '泌尿外科',
    '胸外科',
    '神经外科',
    '妇产科',
    '儿科',
    '眼科',
    '耳鼻喉科',
    '皮肤科',
    '精神科',
    '急诊科',
    '麻醉科',
    '影像科',
    '检验科',
    '病理科'
];
