const { createCanvas } = require('canvas');
const fs = require('fs');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#4F46E5';
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size/2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', size/2, size/2);
  
  return canvas;
}

// Generate icons
[192, 512].forEach(size => {
  const canvas = createIcon(size);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/logo${size}.png`, buffer);
  console.log(`Created logo${size}.png`);
});

// Create favicon
const faviconCanvas = createIcon(64);
const faviconBuffer = faviconCanvas.toBuffer('image/png');
fs.writeFileSync('public/favicon.ico', faviconBuffer);
console.log('Created favicon.ico');
