const mongoose = require('mongoose');
const Career = require('./model/career');
require('dotenv').config();

const verifyFix = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log('Connected to MongoDB');

        const applications = await Career.find().lean();
        console.log('--- Model Results ---');
        console.log(`Count: ${applications.length}`);

        if (applications.length > 0) {
            console.log('Sample Data (First 1):');
            console.log(JSON.stringify(applications[0], null, 2));

            const hasCreatedAt = applications.every(app => app.createdAt);
            console.log(`All have createdAt: ${hasCreatedAt}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyFix();
