const mongoose = require('mongoose');
require('dotenv').config();

async function checkSpecificBlogs() {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        const Blog = mongoose.model('Blog', new mongoose.Schema({ title: String, image: [String] }, { collection: 'blogs' }));
        
        // Exact titles from the screenshot
        const titles = [
            "5 Digital Marketing Myths That Are Keeping Your Business Small",
            "Website vs. Web App vs. Mobile App: Which One Does Your Business Actually Need?",
            "Why \"Just a Logo\" Isn't Enough: The Hidden Elements of a Successful Brand",
            "How to Choose a Visual Style That Matches Your Brand's Personality"
        ];
        
        const blogs = await Blog.find({ title: { $in: titles } });
        console.log("Found blogs:", blogs.length);
        blogs.forEach(blog => {
            console.log(`Title: ${blog.title}`);
            console.log(`Images: ${JSON.stringify(blog.image)}`);
        });
        
        // If not found by exact title, list first 10 blogs
        if (blogs.length === 0) {
            console.log("Listing first 10 blogs to find titles:");
            const allBlogs = await Blog.find({}).limit(10);
            allBlogs.forEach(blog => console.log(`- ${blog.title}`));
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSpecificBlogs();
