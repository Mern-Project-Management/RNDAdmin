const mongoose = require('mongoose');
require('dotenv').config();
const ClickEvent = require('./model/clickEvent');

async function clearTracking() {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log('Connected to MongoDB');
        
        const result = await ClickEvent.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} tracking events.`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error clearing tracking data:', error);
        process.exit(1);
    }
}

clearTracking();
