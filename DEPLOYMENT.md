# Hướng dẫn Deploy lên Vercel

## Bước 1: Chuẩn bị Environment Variables

Trước khi deploy, bạn cần chuẩn bị các environment variables sau trong Vercel Dashboard:

### Required Variables:
- `OPENROUTER_API_KEY`: API key từ OpenRouter (https://openrouter.ai/)
- `NODE_ENV`: production

### Optional Variables:
- `DATABASE_URL`: Nếu sử dụng database
- `PORT`: 3000 (mặc định)

## Bước 2: Deploy lên Vercel

### Cách 1: Sử dụng Vercel CLI
```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login vào Vercel
vercel login

# Deploy
vercel --prod
```

### Cách 2: Sử dụng Vercel Dashboard
1. Truy cập https://vercel.com/dashboard
2. Click "New Project"
3. Import repository từ GitHub
4. Vercel sẽ tự động detect cấu hình từ `vercel.json`
5. Thêm environment variables trong Settings > Environment Variables
6. Deploy

## Bước 3: Cấu hình Environment Variables trong Vercel

1. Vào project dashboard trên Vercel
2. Chọn Settings > Environment Variables
3. Thêm các variables:
   - Name: `OPENROUTER_API_KEY`, Value: `your_api_key_here`
   - Name: `NODE_ENV`, Value: `production`

## Bước 4: Kiểm tra Deployment

Sau khi deploy thành công:
1. Kiểm tra URL được cung cấp bởi Vercel
2. Test các chức năng chính của ứng dụng
3. Kiểm tra console để đảm bảo không có lỗi

## Lưu ý quan trọng:

- File `vercel.json` đã được cấu hình để handle cả frontend và backend
- Build script `vercel-build` sẽ chỉ build frontend (client)
- Backend sẽ được deploy như serverless functions
- Timeout cho serverless functions được set là 30 giây

## Troubleshooting:

Nếu gặp lỗi:
1. Kiểm tra build logs trong Vercel dashboard
2. Đảm bảo tất cả environment variables đã được set đúng
3. Kiểm tra file `vercel.json` và `package.json` có đúng cấu hình không