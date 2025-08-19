import { makeAutoObservable } from 'mobx';
import { message, Modal } from 'antd';
import { 
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import type { FileRecord, UploadCallback, UploadErrorCallback } from '../types/file';
import { getFileList, uploadFile, deleteFile, downloadFile } from '../api';

export class FileManagerStore {
  // 响应式数据属性
  fileList: FileRecord[] = [];
  loading: boolean = false;
  uploadLoading: boolean = false;

  constructor() {
    // 使用 makeAutoObservable 自动处理响应式
    makeAutoObservable(this);
  }

  // 获取文件列表
  async fetchFileList(token: string) {
    this.loading = true;
    try {
      const response = await getFileList(token);
      // 修复：API 现在直接返回文件数组，不需要访问 .data 属性
      this.fileList = response || [];
      
      // 添加调试信息
      console.log('获取到的文件列表:', response);
      console.log('文件数量:', this.fileList.length);
    } catch (error) {
      console.error('获取文件列表错误:', error);
      message.error('获取文件列表失败');
    } finally {
      this.loading = false;
    }
  }

  // 上传文件
  async uploadFile(
    file: File, 
    token: string, 
    onSuccess?: UploadCallback, 
    onError?: UploadErrorCallback
  ) {
    this.uploadLoading = true;
    try {
      const result = await uploadFile(file, token);
      message.success(`${file.name} 上传成功`);
      onSuccess?.(result);
      // 刷新文件列表
      await this.fetchFileList(token);
    } catch (error) {
      console.error('上传错误:', error);
      message.error(`${file.name} 上传失败`);
      onError?.(error as Error);
    } finally {
      this.uploadLoading = false;
    }
  }

  // 下载文件
  async handleDownload(file: FileRecord, token: string) {
    try {
      // 构造下载URL，因为后端返回的是file_path而不是download_url
      const downloadUrl = `/api/files/download?filePath=${encodeURIComponent(file.file_path)}`;
      await downloadFile(downloadUrl, file.original_name, token);
      message.success('文件下载成功');
    } catch (error) {
      console.error('下载错误:', error);
      message.error('文件下载失败');
    }
  }

  // 删除文件
  async handleDelete(file: FileRecord, token: string) {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除文件 "${file.original_name}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteFile(file.id, token);
          message.success('文件删除成功');
          // 刷新文件列表
          await this.fetchFileList(token);
        } catch (error) {
          console.error('删除错误:', error);
          message.error('文件删除失败');
        }
      },
    });
  }

  // 获取文件图标类型
  getFileIconType(fileType: string): string {
    // 转换为小写以便比较
    const type = fileType.toLowerCase();
    
    if (type.startsWith('image/')) {
      return 'image';
    } else if (type.includes('pdf')) {
      return 'pdf';
    } else if (type.includes('word') || type.includes('document') || 
               type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml')) {
      return 'word';
    } else if (type.includes('excel') || type.includes('spreadsheet') || 
               type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml')) {
      return 'excel';
    } else if (type.includes('zip') || type.includes('rar') || type.includes('7z')) {
      return 'archive';
    } else if (type.includes('text/') || type.includes('application/json') || type.includes('application/xml')) {
      return 'text';
    } else {
      return 'file';
    }
  }

  // 格式化文件大小
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 计算属性：文件总数
  get totalFiles(): number {
    return this.fileList.length;
  }

  // 计算属性：按类型分组的文件
  get filesByType() {
    const grouped = this.fileList.reduce((acc, file) => {
      const type = file.file_type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(file);
      return acc;
    }, {} as Record<string, FileRecord[]>);
    
    return grouped;
  }
} 