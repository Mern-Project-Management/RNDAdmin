require('dotenv').config();
const mongoose = require('mongoose');
const ClickEvent = require('./model/clickEvent');
const fs = require('fs');

mongoose.connect(process.env.DATABASE_URI).then(async () => {
    const events = await ClickEvent.find({}).limit(5).lean();
    fs.writeFileSync('db-output.json', JSON.stringify(events, null, 2));
    console.log('Done writing');
    mongoose.disconnect();
}).catch(err => {
    console.error(err);
});
