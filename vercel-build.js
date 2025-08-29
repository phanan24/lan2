// vercel-build.js
import { execSync } from 'child_process';

// Thực hiện build client
console.log('Building client...');
execSync('vite build', { stdio: 'inherit' });

// Thực hiện build server
console.log('Building server...');
execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

console.log('Build completed successfully!');