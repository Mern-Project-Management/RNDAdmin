const mongoose = require('mongoose');
require('dotenv').config();

const PageHeadingSchema = new mongoose.Schema({
    pageType: String,
    photo: String,
});

const PageHeading = mongoose.model('PageHeadings', PageHeadingSchema);

async function checkHeadings() {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log('Connected to MongoDB');
        const headings = await PageHeading.find();
        console.log('Page Headings:');
        headings.forEach(h => {
            console.log(`Page: ${h.pageType}, Photo: ${h.photo}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkHeadings();
