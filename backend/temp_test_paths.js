const fs = require('fs');
const path = require('path');

const filename = 'image_1766141530536.webp';
const dirName = 'b:\\RND\\RNDAdmin\\backend\\route'; // Simulating __dirname in route/image.js

const originalPath = path.join(dirName, '../uploads/images', filename);
const nestedPath = path.join(dirName, '../uploads/images/images', filename);

console.log(`Checking original: ${originalPath} - Exists: ${fs.existsSync(originalPath)}`);
console.log(`Checking nested: ${nestedPath} - Exists: ${fs.existsSync(nestedPath)}`);

// Also check relative to index.js
const indexDir = 'b:\\RND\\RNDAdmin\\backend';
const uploadsPath = path.join(indexDir, 'uploads/images', filename);
const nestedUploadsPath = path.join(indexDir, 'uploads/images/images', filename);

console.log(`Checking from index: ${uploadsPath} - Exists: ${fs.existsSync(uploadsPath)}`);
console.log(`Checking from index nested: ${nestedUploadsPath} - Exists: ${fs.existsSync(nestedUploadsPath)}`);
