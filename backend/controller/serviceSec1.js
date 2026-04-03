const ServiceSec1 = require('../model/servicesec1');
const ServiceCategory = require('../model/serviceCategory');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  }
};

// GET controller - Retrieve data by category, subcategory, or subsubcategory
const getServiceSec1 = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId } = req.query;

    let query = {};

    if (subSubCategoryId) {
      query = { subSubCategoryId };
    } else if (subCategoryId) {
      query = { subCategoryId };
    } else if (categoryId) {
      query = { categoryId };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide categoryId, subCategoryId, or subSubCategoryId'
      });
    }

    const data = await ServiceSec1.findOne(query)
      .populate('categoryId');

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET all controller - Retrieve all data
const getAllServiceSec1 = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId, level } = req.query;

    // Build filter object dynamically
    const filter = {};

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (subCategoryId) {
      filter.subCategoryId = subCategoryId;
    }

    if (subSubCategoryId) {
      filter.subSubCategoryId = subSubCategoryId;
    }

    // Filter by level if provided
    if (level) {
      filter.level = level;
    }

    const data = await ServiceSec1.find(filter)
      .populate('categoryId', 'category subCategories')
      .sort({ createdAt: -1 }); // Optional: sort by newest first

    // Manually populate subcategory and subsubcategory details
    const enrichedData = data.map(item => {
      const itemObj = item.toObject();

      if (itemObj.categoryId) {
        // Find subcategory if subCategoryId exists
        if (itemObj.subCategoryId && itemObj.categoryId.subCategories) {
          const subCategory = itemObj.categoryId.subCategories.find(
            sub => sub._id.toString() === itemObj.subCategoryId.toString()
          );
          itemObj.subCategory = subCategory || null;

          // Find sub-subcategory if subSubCategoryId exists
          if (itemObj.subSubCategoryId && subCategory?.subSubCategory) {
            const subSubCategory = subCategory.subSubCategory.find(
              subSub => subSub._id.toString() === itemObj.subSubCategoryId.toString()
            );
            itemObj.subSubCategory = subSubCategory || null;
          }
        }

        // Remove the full subCategories array to keep response clean
        delete itemObj.categoryId.subCategories;
      }

      return itemObj;
    });

    res.status(200).json({
      success: true,
      count: enrichedData.length,
      data: enrichedData,
      filters: filter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to validate category hierarchy
const validateCategoryHierarchy = async (categoryId, subCategoryId, subSubCategoryId) => {
  const category = await ServiceCategory.findById(categoryId);

  if (!category) {
    throw new Error('Category not found');
  }

  if (subCategoryId) {
    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      throw new Error('SubCategory not found in the specified category');
    }

    if (subSubCategoryId) {
      const subSubCategory = subCategory.subSubCategory.id(subSubCategoryId);
      if (!subSubCategory) {
        throw new Error('SubSubCategory not found in the specified subcategory');
      }
    }
  }

  return true;
};

// PUT controller - Update existing or create new
const updateOrCreateServiceSec1 = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId } = req.body;
    const updateData = { ...req.body };

    // Handle photo upload
    if (req.files && req.files['photo'] && req.files['photo'][0]) {
      updateData.photo = 'uploads/images/' + req.files['photo'][0].filename;
    }

    // Validate required categoryId
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'categoryId is required'
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid categoryId'
      });
    }

    if (subCategoryId && !mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subCategoryId'
      });
    }

    if (subSubCategoryId && !mongoose.Types.ObjectId.isValid(subSubCategoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subSubCategoryId'
      });
    }

    // Validate category hierarchy
    try {
      await validateCategoryHierarchy(categoryId, subCategoryId, subSubCategoryId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Build query based on hierarchy
    let query = { categoryId };
    if (subSubCategoryId) {
      query.subSubCategoryId = subSubCategoryId;
    } else if (subCategoryId) {
      query.subCategoryId = subCategoryId;
    }

    // findOneAndUpdate with upsert option
    const data = await ServiceSec1.findOneAndUpdate(
      query,
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    ).populate('categoryId');

    res.status(200).json({
      success: true,
      message: 'Data saved successfully',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// DELETE controller
const deleteServiceSec1 = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId } = req.query;

    let query = {};

    if (subSubCategoryId) {
      query = { subSubCategoryId };
    } else if (subCategoryId) {
      query = { subCategoryId };
    } else if (categoryId) {
      query = { categoryId };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide categoryId, subCategoryId, or subSubCategoryId'
      });
    }

    const data = await ServiceSec1.findOneAndDelete(query);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }
    if (data && data.photo) {
      deleteFile(data.photo);
    }

    res.status(200).json({
      success: true,
      message: 'Data deleted successfully',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// GET by category - Get all ServiceSec1 data for a specific category
const getServiceSec1ById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await ServiceSec1.findById(id)
      .populate('categoryId');

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getServiceSec1,
  getAllServiceSec1,
  updateOrCreateServiceSec1,
  deleteServiceSec1,
  getServiceSec1ById
};