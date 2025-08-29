#!/bin/bash

# Đảm bảo môi trường Node.js
echo "Checking Node.js environment..."
node -v
npm -v

# Cài đặt dependencies
echo "Installing dependencies..."
npm install

# Build dự án
echo "Building project..."
npm run build

# Kiểm tra cấu trúc thư mục dist
echo "Checking dist directory structure..."
ls -la dist
ls -la dist/public

echo "Deployment preparation completed!"