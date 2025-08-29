# Hướng dẫn triển khai lên Vercel

## Chuẩn bị

1. Đảm bảo đã cập nhật file `vercel.json` với cấu hình sau:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node",
      "config": {
        "buildCommand": "npm run build",
        "outputDirectory": "dist"
      }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/dist/index.js" },
    { "src": "/assets/(.*)", "dest": "/dist/public/assets/$1" },
    { "src": "/(.*)", "dest": "/dist/public/index.html" }
  ]
}
```

2. Đảm bảo `package.json` có script build đúng:

```json
"scripts": {
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
}
```

## Các bước triển khai

### Phương pháp 1: Sử dụng Vercel CLI

1. Cài đặt Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Đăng nhập vào Vercel:
   ```
   vercel login
   ```

3. Triển khai dự án:
   ```
   vercel
   ```

4. Để triển khai phiên bản production:
   ```
   vercel --prod
   ```

### Phương pháp 2: Triển khai qua GitHub

1. Đẩy code lên GitHub repository
2. Đăng nhập vào [Vercel](https://vercel.com)
3. Tạo dự án mới và kết nối với GitHub repository
4. Cấu hình các biến môi trường cần thiết:
   - `DATABASE_URL`
   - `OPENROUTER_API_KEY`
   - `IMGBB_API_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH`
   - `NODE_ENV=production`

5. Triển khai dự án

## Xử lý lỗi 404 NOT_FOUND

Nếu gặp lỗi 404 NOT_FOUND sau khi triển khai, hãy thử các giải pháp sau:

1. Kiểm tra cấu trúc thư mục `dist` sau khi build để đảm bảo các file đã được tạo đúng:
   ```
   npm run build && ls -la dist
   ```

2. Đảm bảo các routes trong `vercel.json` trỏ đến đúng vị trí file trong thư mục `dist`

3. Chạy script debug để kiểm tra môi trường Vercel:
   ```
   npm run vercel-debug
   ```

4. Kiểm tra logs triển khai trên Vercel Dashboard để xác định nguyên nhân cụ thể

5. Thử xóa cache và triển khai lại:
   ```
   vercel --prod --force
   ```

6. Nếu vẫn gặp lỗi 404, hãy thử các cấu hình sau trong `vercel.json`:

   **Cấu hình 1:**
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

   **Cấu hình 2:**
   ```json
   {
     "routes": [
       { "handle": "filesystem" },
       { "src": "/api/(.*)", "dest": "/api/$1" },
       { "src": "/(.*)", "dest": "/index.html" }
     ]
   }
   ```

   **Cấu hình 3:**
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "package.json", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/api/$1" },
       { "src": "/(.*)", "dest": "/" }
     ]
   }
   ```

## Lưu ý quan trọng

- Đảm bảo đã cấu hình đúng database URL và các biến môi trường khác
- Kiểm tra logs triển khai để phát hiện lỗi
- Nếu cần thiết, hãy liên hệ hỗ trợ của Vercel