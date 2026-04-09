const mongoose = require('mongoose');
require('dotenv').config();

const BannerSchema = new mongoose.Schema({
    image: String,
    pageSlug: String,
});

const Banner = mongoose.model('banners', BannerSchema);

async function checkBanners() {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log('Connected to MongoDB');
        const banners = await Banner.find();
        console.log('Banners:');
        banners.forEach(b => {
            console.log(`Page: ${b.pageSlug}, Image: ${b.image}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBanners();
