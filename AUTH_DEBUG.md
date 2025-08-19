# 前端认证问题调试指南

## 问题描述
刷新页面后，登录态丢失，用户被重定向到登录页面。

## 解决方案

### 1. 已修复的问题

#### ✅ Token 验证时机
- **问题**: 原来只在 `token && !user` 时验证，刷新页面后 `user` 已恢复，不会触发验证
- **修复**: 在页面加载时自动验证已保存的 token 有效性

#### ✅ 认证状态恢复
- **问题**: 从 localStorage 恢复状态后没有验证 token 是否仍然有效
- **修复**: 恢复状态后立即调用后端 API 验证 token

#### ✅ 定期验证
- **新增**: 每5分钟自动验证一次 token 有效性
- **新增**: 网络恢复后自动重新验证 token

#### ✅ 错误处理
- **新增**: 区分网络错误和认证错误
- **新增**: 超时处理（10秒）
- **新增**: 401错误特殊处理

### 2. 调试步骤

#### 步骤1: 打开浏览器开发者工具
```bash
# 按 F12 或右键 -> 检查
# 切换到 Console 标签页
```

#### 步骤2: 查看认证日志
刷新页面后，应该能看到以下日志：
```
🔐 开始初始化认证状态...
📦 从localStorage恢复的数据: { hasToken: true, hasUser: true, tokenLength: xxx }
✅ 已恢复认证状态，开始验证token...
🔍 开始验证token: xxxxxxxx...
📡 API响应状态: 200 OK
📄 API响应数据: { code: 1, msg: "success", data: {...} }
✅ Token验证成功，用户信息已更新
🏁 认证状态初始化完成
```

#### 步骤3: 检查 LocalStorage
```javascript
// 在控制台执行
localStorage.getItem('token')
localStorage.getItem('user')
```

#### 步骤4: 使用测试页面
访问 `/test` 页面，查看认证状态调试区域：
- 认证状态
- 加载状态  
- 用户信息
- Token 信息

### 3. 常见问题排查

#### 问题1: 没有认证日志
**可能原因**: AuthContext 没有正确加载
**解决方案**: 检查 App.tsx 中 AuthProvider 是否正确包裹

#### 问题2: Token 验证失败
**可能原因**: 
- 后端 API 不可用
- Token 已过期
- 网络问题
**解决方案**: 查看网络请求和控制台错误信息

#### 问题3: LocalStorage 为空
**可能原因**: 
- 登录时没有正确保存
- 浏览器隐私模式
- 其他代码清除了存储
**解决方案**: 检查登录流程和 localStorage 操作

### 4. 手动测试

#### 测试认证状态刷新
```javascript
// 在控制台执行
const { refreshAuth } = useAuth();
await refreshAuth();
```

#### 测试 LocalStorage 操作
```javascript
// 手动设置认证信息
localStorage.setItem('token', 'your-token-here');
localStorage.setItem('user', JSON.stringify({username: 'test', id: 1}));

// 刷新页面测试
location.reload();
```

### 5. 网络问题排查

#### 检查 API 端点
```bash
# 测试认证接口是否可用
curl -H "token: your-token" http://localhost:8000/api/auth/me
```

#### 检查网络状态
```javascript
// 在控制台检查网络状态
navigator.onLine
```

### 6. 性能优化

#### Token 验证频率
- 页面加载时验证一次
- 每5分钟自动验证一次
- 网络恢复后验证一次

#### 超时设置
- API 请求超时: 10秒
- 避免长时间等待

### 7. 安全考虑

#### Token 存储
- 使用 localStorage 存储（可配置为 sessionStorage）
- 定期验证 token 有效性
- 过期后自动清除

#### 错误处理
- 不暴露敏感信息
- 区分网络错误和认证错误
- 适当的用户提示

## 联系支持

如果问题仍然存在，请提供：
1. 浏览器控制台日志
2. 网络请求状态
3. LocalStorage 内容
4. 复现步骤
