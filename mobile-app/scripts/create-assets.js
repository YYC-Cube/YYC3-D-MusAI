const fs = require('fs');
const path = require('path');

// 创建一个最小的有效 1x1 像素 PNG 文件（紫色 #6366f1）
const minimalPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');

const assets = [
  './assets/icons/icon.png',
  './assets/adaptive-icon.png',
  './assets/splash.png',
  './assets/favicon.png',
  './assets/notification-icon.png'
];

console.log('Creating placeholder asset files...');

assets.forEach(file => {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(file, minimalPNG);
  console.log('✓ Created:', file);
});

console.log('\n✅ All placeholder assets created successfully!');
