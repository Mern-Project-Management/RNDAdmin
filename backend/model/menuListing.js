const mongoose = require('mongoose');

const MenuListingSchema = new mongoose.Schema(
    {
        parent: { 
            name: { type: String, required: true }, 
            path: { type: String, required: true },
            photo: { type: String },
            alt: { type: String },
            imgtitle: { type: String }
        },
        children: [
            {
                name: { type: String, required: true }, 
                path: { type: String, required: true },
                photo: { type: String },
                alt: { type: String },
                imgtitle: { type: String },
                subChildren: [
                    {
                        name: { type: String, required: true }, 
                        path: { type: String, required: true },
                        photo: { type: String },
                        alt: { type: String },
                        imgtitle: { type: String }
                    }
                ]
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('MenuListing', MenuListingSchema);
