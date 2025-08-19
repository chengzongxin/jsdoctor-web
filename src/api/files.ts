import type { FileUploadResponse, FileRecord } from '../types/file';

// 文件管理API接口
export const fileAPI = {
    // 上传文件
    uploadFile: async (formData: FormData): Promise<FileUploadResponse> => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('用户未登录');
        }

        const response = await fetch('/api/files/upload', {
            method: 'POST',
            headers: {
                'token': token,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        if (responseData.code === 1) {
            return responseData.data;
        } else {
            throw new Error(responseData.msg || '上传失败');
        }
    },

    // 获取文件列表
    getFileList: async (): Promise<FileRecord[]> => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('用户未登录');
        }

        const response = await fetch('/api/files/list', {
            headers: {
                'token': token,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        if (responseData.code === 1) {
            return responseData.data;
        } else {
            throw new Error(responseData.msg || '获取文件列表失败');
        }
    },

    // 删除文件
    deleteFile: async (fileId: number): Promise<{ success: boolean; message: string }> => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('用户未登录');
        }

        const response = await fetch(`/api/files/delete/${fileId}`, {
            method: 'DELETE',
            headers: {
                'token': token,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        if (responseData.code === 1) {
            return { success: true, message: '删除成功' };
        } else {
            throw new Error(responseData.msg || '删除失败');
        }
    },

    // 下载文件
    downloadFile: async (fileId: number): Promise<void> => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('用户未登录');
        }

        const response = await fetch(`/api/files/download/${fileId}`, {
            headers: {
                'token': token,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `file_${fileId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};
