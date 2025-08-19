// 文件记录类型
export interface FileRecord {
    id: number;
    original_name: string;
    stored_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    uploaded_by: string;
    upload_time: string;
    download_url?: string;
}

// 文件上传响应类型
export interface FileUploadResponse {
    id: number;
    original_name: string;
    stored_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    uploaded_by: string;
    upload_time: string;
    download_url: string;
}

// 文件列表响应类型
export interface FileListResponse {
    files: FileRecord[];
    total: number;
}
