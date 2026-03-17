const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const filename = 'photo_1773658687075_jemptm4t3.webp'; // One of the files I saw
const originalPath = path.join(__dirname, 'uploads/images', filename);

console.log('Checking path:', originalPath);
console.log('Exists:', fs.existsSync(originalPath));

if (fs.existsSync(originalPath)) {
    try {
        sharp(originalPath)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer()
            .then(buffer => {
                console.log('Sharp processing successful, buffer size:', buffer.length);
            })
            .catch(err => {
                console.error('Sharp processing failed:', err);
            });
    } catch (err) {
        console.error('Sharp error:', err);
    }
} else {
    // Try nested
    const nestedPath = path.join(__dirname, 'uploads/images/images', filename);
    console.log('Checking nested path:', nestedPath);
    console.log('Nested Exists:', fs.existsSync(nestedPath));
}
