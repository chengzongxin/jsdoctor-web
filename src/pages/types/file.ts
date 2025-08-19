// 文件记录接口定义
export interface FileRecord {
  id: number;
  original_name: string;
  stored_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  upload_time: string;
  download_url?: string; // 可选，因为后端可能不直接返回
}

// 通用API响应接口
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 文件上传响应接口
export interface UploadResponse {
  success: boolean;
  message: string;
  data?: FileRecord;
}

// 文件列表响应接口
export interface FileListResponse {
  data: FileRecord[];
}

// 文件操作回调函数类型
export type UploadCallback = (result?: any) => void;
export type UploadErrorCallback = (error: Error) => void; 