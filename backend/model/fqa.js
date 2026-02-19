const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the FAQ
const FAQSchema = new mongoose.Schema({
  question: { type: String},
  answer: { type: String},
  status: { type: String, default: false, },
  photo: [{ type: String }],
serviceparentCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
servicesubCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
servicesubSubCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
industryparentCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'IndustriesCategory' },
industrysubCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'IndustriesCategory' },
industrysubSubCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'IndustriesCategory' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
});

FAQSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model
const FAQ = mongoose.model('FAQ', FAQSchema);

module.exports = FAQ;