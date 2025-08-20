// 医生管理API接口

import type { 
    Doctor, 
    DoctorCreateRequest, 
    DoctorUpdateRequest, 
    DoctorQueryParams, 
    DoctorListResponse 
} from '../types/doctor';

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

// 创建医生
export const createDoctor = async (data: DoctorCreateRequest): Promise<string> => {
    return request<string>('/doctors', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// 获取医生列表
export const getDoctorList = async (params: DoctorQueryParams = {}): Promise<DoctorListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.name) searchParams.append('name', params.name);
    if (params.hospital) searchParams.append('hospital', params.hospital);
    if (params.department) searchParams.append('department', params.department);
    if (params.status !== undefined) searchParams.append('status', params.status.toString());
    
    const url = `/doctors/list${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    return request<DoctorListResponse>(url);
};

// 获取医生详情
export const getDoctorById = async (id: number): Promise<Doctor> => {
    return request<Doctor>(`/doctors/${id}`);
};

// 更新医生信息
export const updateDoctor = async (id: number, data: DoctorUpdateRequest): Promise<string> => {
    return request<string>(`/doctors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// 删除医生
export const deleteDoctor = async (id: number): Promise<string> => {
    return request<string>(`/doctors/${id}`, {
        method: 'DELETE',
    });
};

// 批量删除医生
export const batchDeleteDoctors = async (ids: number[]): Promise<string> => {
    return request<string>('/doctors/batch', {
        method: 'DELETE',
        body: JSON.stringify(ids),
    });
};

// 获取启用的医生列表（用于派发选择）
export const getEnabledDoctors = async (): Promise<Doctor[]> => {
    return request<Doctor[]>('/doctors/enabled');
};

// 获取所有科室列表
export const getDoctorDepartments = async (): Promise<string[]> => {
    return request<string[]>('/doctors/departments');
};

// 获取所有医院列表
export const getDoctorHospitals = async (): Promise<string[]> => {
    return request<string[]>('/doctors/hospitals');
};

// 检查百家号ID是否已存在
export const checkBaijiahaoIdExists = async (baijiahaoId: string): Promise<boolean> => {
    const result = await request<{ exists: boolean }>(`/doctors/check-baijiahao?baijiahaoId=${encodeURIComponent(baijiahaoId)}`);
    return result.exists;
};
