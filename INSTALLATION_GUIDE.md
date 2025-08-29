# HƯỚNG DẪN CÀI ĐẶT LIMVA PLATFORM ĐẦY ĐỦ

## 📋 TỔNG QUAN
LimVA là nền tảng giáo dục AI cho học sinh Việt Nam với các tính năng:
- Kiểm tra bài tập với AI phân tích và LaTeX rendering
- Sinh đề thi tự động (trắc nghiệm, tự luận, ma trận từ PDF)
- Chat AI hỗ trợ học tập với lưu context
- Đọc tài liệu (PDF, Word, Excel, TXT)
- Quản lý database với backup/restore
- Tích hợp Zalo qua QR code

---

## 🛠 YÊU CẦU HỆ THỐNG

### Phần mềm bắt buộc:
1. **Node.js** (v18 hoặc cao hơn)
   - Download: https://nodejs.org/
   - Kiểm tra: `node --version && npm --version`

2. **PostgreSQL** (v12 hoặc cao hơn)
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Ubuntu: `sudo apt install postgresql postgresql-contrib`

3. **Git** (để clone project)
   - Download: https://git-scm.com/downloads

### API Keys cần thiết:
- **OpenRouter API Key** (cho AI): https://openrouter.ai/
- **ImgBB API Key** (cho upload ảnh): https://api.imgbb.com/

---

## 📦 BƯỚC 1: TẢI PROJECT VỀ MÁY

### Cách 1: Clone từ GitHub/Repository
```bash
git clone [URL_REPOSITORY]
cd limva-platform
```

### Cách 2: Download từ Replit
1. Vào Replit project
2. Click menu 3 chấm → Download as ZIP
3. Giải nén vào thư mục mong muốn

---

## 🗄 BƯỚC 2: THIẾT LẬP DATABASE

### Option A: PostgreSQL Local (Khuyên dùng)

1. **Cài đặt PostgreSQL**
   ```bash
   # Windows: Tải installer từ postgresql.org
   # Mac:
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu:
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Tạo database và user**
   ```bash
   # Kết nối PostgreSQL
   sudo -u postgres psql
   
   # Tạo database
   CREATE DATABASE limva_db;
   
   # Tạo user (thay your_username, your_password)
   CREATE USER limva_user WITH PASSWORD 'your_strong_password';
   
   # Cấp quyền
   GRANT ALL PRIVILEGES ON DATABASE limva_db TO limva_user;
   GRANT ALL ON SCHEMA public TO limva_user;
   
   # Thoát
   \q
   ```

3. **Kiểm tra kết nối**
   ```bash
   psql -h localhost -U limva_user -d limva_db
   # Nhập password khi được yêu cầu
   ```

### Option B: Sử dụng Neon Database (Cloud)

1. Đăng ký tại: https://neon.tech/
2. Tạo project mới
3. Copy connection string (dạng: `postgresql://user:pass@host/dbname`)

---

## ⚙️ BƯỚC 3: CẤU HÌNH ENVIRONMENT

1. **Tạo file `.env`** trong thư mục root:
   ```bash
   touch .env
   ```

2. **Thêm nội dung vào `.env`**:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://limva_user:your_strong_password@localhost:5432/limva_db"
   
   # Session Configuration
   SESSION_SECRET="your_super_secret_session_key_here_make_it_long_and_random"
   
   # Environment
   NODE_ENV=development
   
   # Database Connection Details (for Drizzle)
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=limva_db
   PGUSER=limva_user
   PGPASSWORD=your_strong_password
   ```

**⚠️ LÚU Ý QUAN TRỌNG:**
- Thay `your_strong_password` bằng password thật
- `SESSION_SECRET` phải là chuỗi dài và phức tạp
- File `.env` không được commit lên Git

---

## 📚 BƯỚC 4: CÀI ĐẶT VÀ THIẾT LẬP

1. **Cài đặt dependencies**
   ```bash
   cd limva-platform
   npm install
   ```

2. **Thiết lập database schema**
   ```bash
   # Push schema to database
   npm run db:push
   ```

3. **Kiểm tra database**
   ```bash
   # Kết nối database để verify
   psql $DATABASE_URL
   
   # Kiểm tra tables được tạo
   \dt
   
   # Thoát
   \q
   ```

---

## 🚀 BƯỚC 5: CHẠY ỨNG DỤNG

### Development Mode (Phát triển)
```bash
npm run dev
```

### Production Mode (Sản xuất)
```bash
# Build ứng dụng
npm run build

# Chạy production
npm start
```

**Ứng dụng sẽ chạy tại:** `http://localhost:5000`

---

## 🔧 BƯỚC 6: CẤU HÌNH ADMIN PANEL

1. **Truy cập web**: `http://localhost:5000`

2. **Đăng nhập Admin**:
   - Username: `admin`
   - Password: `admin123`

3. **Cấu hình AI Models**:
   - **OpenRouter API Key**: Nhập key từ https://openrouter.ai/
   - **ImgBB API Key**: Nhập key từ https://api.imgbb.com/
   - **Chọn AI Model**: DeepSeek (free) hoặc GPT-5 (paid)

4. **Click "Lưu bài đặt"**

---

## 📊 BƯỚC 7: IMPORT DỮ LIỆU (TÙY CHỌN)

Nếu bạn có file backup từ Replit:

1. **Vào Admin Panel** → **Khôi phục Database**
2. **Chọn file SQL** đã export từ Replit
3. **Upload và import**

Hoặc dùng command line:
```bash
psql $DATABASE_URL < backup_file.sql
```

---

## 🧪 BƯỚC 8: KIỂM TRA TÍNH NĂNG

### Kiểm tra cơ bản:
1. **Trang chủ**: Hiển thị 4 tính năng chính
2. **Kiểm tra bài tập**: Upload ảnh hoặc nhập text
3. **Sinh đề thi**: Chọn môn học và tạo đề
4. **Chat AI**: Đặt câu hỏi và nhận phản hồi
5. **Đọc tài liệu**: Upload PDF/Word để đọc

### Kiểm tra database:
```bash
# Kết nối database
psql $DATABASE_URL

# Kiểm tra data
SELECT COUNT(*) FROM admin_settings;
SELECT COUNT(*) FROM homework_submissions;
\q
```

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### 1. Lỗi kết nối database
```
Error: connect ECONNREFUSED ::1:5432
```
**Giải pháp**:
- Kiểm tra PostgreSQL đã chạy: `sudo systemctl status postgresql`
- Start PostgreSQL: `sudo systemctl start postgresql`
- Kiểm tra DATABASE_URL trong `.env`

### 2. Lỗi permission denied
```
Error: permission denied for schema public
```
**Giải pháp**:
```bash
sudo -u postgres psql
GRANT ALL ON SCHEMA public TO limva_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO limva_user;
```

### 3. Lỗi npm install
```
npm ERR! peer dep missing
```
**Giải pháp**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 4. Port đã được sử dụng
```
Error: listen EADDRINUSE :::5000
```
**Giải pháp**:
```bash
# Tìm process đang dùng port 5000
lsof -i :5000

# Kill process
sudo kill -9 [PID]

# Hoặc đổi port trong server/index.ts
```

### 5. API keys không hoạt động
- Kiểm tra OpenRouter API key: https://openrouter.ai/activity
- Kiểm tra ImgBB API key: Test tại https://api.imgbb.com/
- Đảm bảo có credits/quota

---

## 📝 CẤU TRÚC PROJECT

```
limva-platform/
├── client/                 # Frontend React code
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities
├── server/                # Backend Express code
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   └── index.ts          # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts         # Database schema (Drizzle)
├── uploads/              # File upload directory
├── .env                  # Environment variables
├── package.json          # Dependencies
└── vite.config.ts        # Build configuration
```

---

## 🔒 BẢO MẬT VÀ BACKUP

### Đổi password Admin:
```bash
# Connect database
psql $DATABASE_URL

# Hash password mới (thay 'new_password')
# Sử dụng bcrypt để hash password
```

### Backup database:
```bash
# Xuất toàn bộ database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore từ backup
psql $DATABASE_URL < backup_file.sql
```

### Bảo vệ API keys:
- Không commit file `.env` lên Git
- Sử dụng `.env.example` để chia sẻ template
- Rotate API keys định kỳ

---

## 🌐 TRIỂN KHAI PRODUCTION

### Sử dụng PM2 (Process Manager):
```bash
# Cài PM2
npm install -g pm2

# Build production
npm run build

# Start với PM2
pm2 start npm --name "limva" -- start

# Auto start on boot
pm2 startup
pm2 save
```

### Sử dụng Docker:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Reverse Proxy với Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📞 HỖ TRỢ VÀ LIÊN HỆ

Nếu gặp vấn đề:
1. Kiểm tra logs: `npm run dev` và xem console errors
2. Kiểm tra database connection
3. Verify API keys
4. Check file permissions

**Chúc bạn cài đặt thành công LimVA Platform! 🎉**