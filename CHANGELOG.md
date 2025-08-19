# 前端项目鉴权方式修改日志

## 概述
将前端项目的鉴权方式从 `Authorization: Bearer ${token}` 改为在请求头中携带 `token` 字段。

## 修改的文件

### 1. src/contexts/AuthContext.tsx
- 修改 `validateToken` 函数中的请求头：`'Authorization': \`Bearer ${token}\`` → `'token': token`
- 修改 `login` 函数中的请求头：`'Authorization': \`Bearer ${data.access_token}\`` → `'token': data.data`
- 适配新的后端返回格式：`{"code":1,"msg":"success","data":"token字符串"}`
- 修改错误处理：`errorData.detail` → `errorData.msg`

### 2. src/pages/api.ts
- 修改 `getFileList` 函数：`'Authorization': \`Bearer ${token}\`` → `'token': token`
- 修改 `uploadFile` 函数：`'Authorization': \`Bearer ${token}\`` → `'token': token`
- 修改 `deleteFile` 函数：`'Authorization': \`Bearer ${token}\`` → `'token': token`
- 修改 `downloadFile` 函数：`'Authorization': \`Bearer ${token}\`` → `'token': token`

### 3. src/pages/ProductList.tsx
- 修改 `fetchProducts` 函数：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``
- 修改 `fetchTotal` 函数：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``
- 修改商品详情获取请求：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``
- 修改批量下架请求：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``

### 4. src/pages/ProductDetail.tsx
- 修改商品详情查询：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``
- 修改关联搜索请求：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``
- 修改下架当前商品请求：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``
- 修改批量下架关联商品请求：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``

### 5. src/pages/ProductPage.tsx
- 修改商品搜索请求：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``
- 修改批量下架请求：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``

### 6. src/pages/ConfigPage.tsx
- 修改配置状态获取：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``
- 修改配置获取：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``
- 修改配置保存：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``
- 修改配置清除：`"Authorization": \`Bearer ${token}\`` → `"token": \`${token}\``

### 7. src/pages/components/SimpleFileTest.tsx
- 修改文件列表测试请求：`'Authorization': \`Bearer ${token}\`` → `'token': token`

### 8. src/pages/README.md
- 更新API文档中的鉴权方式说明

## 修改后的鉴权方式

### 之前的方式
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
}
```

### 现在的方式
```typescript
headers: {
  'token': token,
  'Content-Type': 'application/json',
}
```

## 后端返回格式变化

### 之前的格式
```json
{
  "access_token": "token字符串",
  "username": "用户名"
}
```

### 现在的格式
```json
{
  "code": 1,
  "msg": "success",
  "data": "token字符串"
}
```

## 注意事项

1. 所有使用 `useAuth()` hook 的组件都会自动使用新的鉴权方式
2. 登录成功后的token存储逻辑保持不变
3. 错误处理已经适配新的后端返回格式
4. 所有API请求都会自动携带新的token字段

## 测试建议

1. 测试登录功能，确保能正确获取和存储token
2. 测试各个页面的API请求，确保鉴权正常
3. 测试token过期后的重新登录流程
4. 检查浏览器开发者工具中的请求头，确认token字段正确设置

