const fs = require('fs');
const path = require('path');

// Test logic similar to the updated route
function findImagePath(filename) {
    let imagePath = path.join(__dirname, 'uploads', 'images', filename);

    if (!fs.existsSync(imagePath)) {
        const singularPath = path.join(__dirname, 'uploads', 'image', filename);
        if (fs.existsSync(singularPath)) {
            imagePath = singularPath;
        } else {
            const nestedPath = path.join(__dirname, 'uploads', 'images', 'images', filename);
            if (fs.existsSync(nestedPath)) {
                imagePath = nestedPath;
            }
        }
    }
    return imagePath;
}

const filesToTest = [
    'photo_1773658687075_jemptm4t3.webp', // in uploads/images
    'image_1766141530536.webp',            // in uploads/image
];

filesToTest.forEach(file => {
    const foundPath = findImagePath(file);
    console.log(`File: ${file}`);
    console.log(`Found at: ${foundPath}`);
    console.log(`Exists: ${fs.existsSync(foundPath)}`);
    console.log('---');
});
