const mongoose = require('mongoose');
require('dotenv').config();
const Career = require('./model/career');

async function debug() {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        const fs = require('fs');
        const path = require('path');
        const apps = await Career.find({}).lean();
        console.log(`--- Career Applications (Total: ${apps.length}) ---`);
        
        const searchDirs = [
            'uploads/documents',
            'uploads/images',
            'uploads/image',
            'resumes',
            'uploads'
        ];

        apps.forEach(app => {
            console.log(`\nApp ID: ${app._id}, Name: ${app.name}`);
            for (const key in app) {
                const val = app[key];
                if (typeof val === 'string' && (val.endsWith('.pdf') || val.endsWith('.doc') || val.endsWith('.docx'))) {
                    console.log(`  POTENTIAL FILE FIELD [${key}]: ${val}`);
                }
            }
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
