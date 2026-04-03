// controllers/serviceSec3Controller.js
const ServiceSec3 = require('../model/servicesec3');
const fs = require('fs');
const { default: mongoose } = require('mongoose');
const path = require('path');
const serviceCategory = require('../model/serviceCategory');

const photoDir = path.join(__dirname, '../uploads/images');

// Helper to delete file if exists
const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  }
};

// Helper to process cards array
const processCards = (cards, files) => {
  let parsedCards = [];

  if (typeof cards === 'string') {
    try {
      parsedCards = JSON.parse(cards);
    } catch {
      throw new Error('Invalid cards JSON');
    }
  } else if (Array.isArray(cards)) {
    parsedCards = cards;
  }

  return parsedCards.map((card, index) => {
    let finalPhoto = card.photo || ''; // Default to existing photo

    // 1. Check for specific field name: cards[index][photo]
    const specificField = `cards[${index}][photo]`;
    if (files?.[specificField] && files[specificField][0]) {
      finalPhoto = 'uploads/images/' + files[specificField][0].filename;
    }
    // 2. Fallback to 'photo' array if specific field is not found (matching old behavior if needed)
    else if (files?.['photo'] && files['photo'][index]) {
      finalPhoto = 'uploads/images/' + files['photo'][index].filename;
    }

    return {
      title: card.title || '',
      subTitle: card.subTitle || '',
      description: card.description || '',
      photo: finalPhoto,
      alt: card.alt || '',
      imgTitle: card.imgTitle || '',
    };
  });
};

// CREATE or UPDATE (Upsert based on category levels)
exports.createSec3 = async (req, res) => {
  try {
    const {
      heading,
      subheading,
      details,
      categoryId,
      subCategoryId,
      subSubCategoryId,
      cards,
    } = req.body;

    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }

    const processedCards = processCards(cards, req.files);

    const payload = {
      heading,
      subheading,
      details,
      cards: processedCards,
      categoryId,
      ...(subCategoryId && subCategoryId !== 'null' && { subCategoryId }),
      ...(subSubCategoryId && subSubCategoryId !== 'null' && { subSubCategoryId }),
    };

    const sec3 = await ServiceSec3.create(payload);

    res.status(201).json({
      message: 'Service Section 2 created successfully',
      data: sec3,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Server error',
    });
  }
};

exports.updateSec3 = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing document to find old images
    const existingSec3 = await ServiceSec3.findById(id);
    if (!existingSec3) {
      return res.status(404).json({ error: 'Service Section 3 not found' });
    }

    const {
      heading,
      subheading,
      details,
      categoryId,
      subCategoryId,
      subSubCategoryId,
      cards,
    } = req.body;

    const processedCards = processCards(cards, req.files);

    // Identify and delete old photos that have been replaced
    const newPhotos = processedCards.map(c => c.photo).filter(Boolean);
    existingSec3.cards.forEach(oldCard => {
      if (oldCard.photo && !newPhotos.includes(oldCard.photo)) {
        deleteFile(oldCard.photo);
      }
    });

    const updateData = {
      heading,
      subheading,
      details,
      cards: processedCards,
      ...(categoryId && { categoryId }),
      ...(subCategoryId && subCategoryId !== 'null' && { subCategoryId }),
      ...(subSubCategoryId && subSubCategoryId !== 'null' && { subSubCategoryId }),
    };

    const sec3 = await ServiceSec3.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Service Section 3 updated successfully',
      data: sec3,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Server error',
    });
  }
};

// GET by category levels
exports.getSec3 = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }

    const query = { categoryId };
    if (subSubCategoryId && subSubCategoryId !== 'null') query.subSubCategoryId = subSubCategoryId;
    else if (subCategoryId && subCategoryId !== 'null') query.subCategoryId = subCategoryId;

    const sec1 = await ServiceSec3.findOne(query);

    if (!sec1) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json(sec1);
  } catch (error) {
    console.error('Error fetching Sec1:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE (and clean up images)
exports.deleteSec3 = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId } = req.query;

    const query = { categoryId };
    if (subSubCategoryId && subSubCategoryId !== 'null') query.subSubCategoryId = subSubCategoryId;
    else if (subCategoryId && subCategoryId !== 'null') query.subCategoryId = subCategoryId;

    const sec1 = await ServiceSec3.findOneAndDelete(query);

    if (!sec1) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Delete associated card images
    sec1.cards.forEach((card) => {
      if (card.photo) {
        deleteFile(card.photo);
      }
    });

    res.status(200).json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting Sec1:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET single ServiceSec3 by _id
exports.getSec3ById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const sec3 = await ServiceSec3.findById(id).lean();

    if (!sec3) {
      return res.status(404).json({ success: false, message: 'Service Section 3 not found' });
    }

    // Fetch parent category to resolve all levels
    const parentId = sec3.categoryId?.toString();

    let parentMap = {};
    let subMap = {};
    let subSubMap = {};

    if (parentId) {
      const parentCategory = await serviceCategory.findById(parentId).lean();

      if (parentCategory) {
        parentMap[parentCategory._id.toString()] = {
          _id: parentCategory._id,
          category: parentCategory.category,
        };

        (parentCategory.subCategories || []).forEach(sub => {
          subMap[sub._id.toString()] = {
            _id: sub._id,
            category: sub.category,
          };

          (sub.subSubCategory || []).forEach(subsub => {
            subSubMap[subsub._id.toString()] = {
              _id: subsub._id,
              category: subsub.category,
            };
          });
        });
      }
    }

    // Manually attach resolved category objects
    const enrichedSec3 = {
      ...sec3,
      categoryId: sec3.categoryId
        ? parentMap[sec3.categoryId.toString()] || null
        : null,
      subCategoryId: sec3.subCategoryId
        ? subMap[sec3.subCategoryId.toString()] || null
        : null,
      subSubCategoryId: sec3.subSubCategoryId
        ? subSubMap[sec3.subSubCategoryId.toString()] || null
        : null,
    };

    res.status(200).json({ success: true, data: enrichedSec3 });

  } catch (error) {
    console.error('Error fetching Sec3 by ID:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllServiceSec3 = async (req, res) => {
  try {
    const {
      categoryId,
      subCategoryId,
      subSubCategoryId,
      level,
    } = req.query;

    const filter = {};

    if (categoryId) filter.categoryId = categoryId;
    if (subCategoryId) filter.subCategoryId = subCategoryId;
    if (subSubCategoryId) filter.subSubCategoryId = subSubCategoryId;
    if (level) {
      if (!['category', 'subcategory', 'subsubcategory'].includes(level)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid level value',
        });
      }
      filter.level = level;
    }

    const data = await ServiceSec3.find(filter)
      .populate({
        path: 'categoryId',
        select: 'category subCategories',
      })
      .sort({ createdAt: -1 })
      .lean();

    const enrichedData = data.map(item => {
      let subCategory = null;
      let subSubCategory = null;

      if (item.categoryId && item.subCategoryId) {
        subCategory = item.categoryId.subCategories?.find(
          sub => sub._id.toString() === item.subCategoryId.toString()
        ) || null;

        if (subCategory && item.subSubCategoryId) {
          subSubCategory = subCategory.subSubCategory?.find(
            subSub => subSub._id.toString() === item.subSubCategoryId.toString()
          ) || null;
        }
      }

      const { subCategories, ...cleanCategory } = item.categoryId || {};

      return {
        ...item,
        category: cleanCategory,
        subCategory,
        subSubCategory,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedData.length,
      data: enrichedData,
      appliedFilters: filter,
    });
  } catch (error) {
    console.error('Error in getAllServiceSec3:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// DELETE ServiceSec3 by ID
exports.deleteSec3ById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const sec3 = await ServiceSec3.findByIdAndDelete(id);
    if (!sec3) {
      return res.status(404).json({ success: false, message: 'Service Section 3 not found' });
    }
    if (sec3.cards && Array.isArray(sec3.cards)) {
      sec3.cards.forEach((card) => {
        if (card.photo) {
          deleteFile(card.photo);
        }
      });
    }
    res.status(200).json({ success: true, message: 'Service Section 3 deleted successfully' });
  } catch (error) {
    console.error('Error deleting Sec3 by ID:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};