// vercel-debug.js
// Script để kiểm tra môi trường Vercel và gỡ lỗi

console.log('=== VERCEL DEPLOYMENT DEBUG INFO ===');

// Kiểm tra biến môi trường
console.log('\nEnvironment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
console.log('VERCEL_URL:', process.env.VERCEL_URL);
console.log('VERCEL_REGION:', process.env.VERCEL_REGION);

// Kiểm tra cấu trúc thư mục
const fs = require('fs');
const path = require('path');

function listDir(dir, indent = '') {
  try {
    if (!fs.existsSync(dir)) {
      console.log(`${indent}Directory not found: ${dir}`);
      return;
    }
    
    const files = fs.readdirSync(dir);
    console.log(`${indent}${dir}:`);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        listDir(filePath, `${indent}  `);
      } else {
        console.log(`${indent}  ${file} (${stats.size} bytes)`);
      }
    });
  } catch (error) {
    console.error(`${indent}Error reading directory ${dir}:`, error.message);
  }
}

console.log('\nDirectory Structure:');
listDir(process.cwd());
listDir(path.join(process.cwd(), 'dist'));

console.log('\n=== END DEBUG INFO ===');