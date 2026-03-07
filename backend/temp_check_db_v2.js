const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        const results = {};
        for (const colName of collections.map(c => c.name)) {
            if (colName.toLowerCase().includes('career') || colName.toLowerCase().includes('application')) {
                const count = await mongoose.connection.db.collection(colName).countDocuments();
                results[colName] = count;
            }
        }
        console.log('---START_JSON---');
        console.log(JSON.stringify(results, null, 2));
        console.log('---END_JSON---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
