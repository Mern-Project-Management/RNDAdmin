const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        console.log('--- All Collections ---');
        console.log(collectionNames.join(', '));

        console.log('\n--- Career Related Counts ---');
        for (const colName of collectionNames) {
            if (colName.toLowerCase().includes('career') || colName.toLowerCase().includes('application')) {
                const count = await mongoose.connection.db.collection(colName).countDocuments();
                console.log(`Collection: ${colName}, Count: ${count}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
