// controllers/serviceSec2Controller.js
const ServiceSec2 = require('../model/serviceSec2');
const fs = require('fs');
const { default: mongoose } = require('mongoose');
const path = require('path');

const photoDir = path.join(__dirname, '../uploads/images');

// Helper to delete file if exists
const deleteFile = (filePath) => {
  const fullPath = path.join(photoDir, filePath);
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
      finalPhoto = files[specificField][0].filename;
    }
    // 2. Fallback to 'photo' array
    else if (files?.['photo'] && files['photo'][index]) {
      finalPhoto = files['photo'][index].filename;
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
exports.createSec2 = async (req, res) => {
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

    const sec2 = await ServiceSec2.create(payload);

    res.status(201).json({
      message: 'Service Section 2 created successfully',
      data: sec2,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Server error',
    });
  }
};

exports.updateSec2 = async (req, res) => {
  try {
    const { id } = req.params;

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

    const updateData = {
      heading,
      subheading,
      details,
      cards: processedCards,
      ...(categoryId && { categoryId }),
      ...(subCategoryId && subCategoryId !== 'null' && { subCategoryId }),
      ...(subSubCategoryId && subSubCategoryId !== 'null' && { subSubCategoryId }),
    };

    const sec2 = await ServiceSec2.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!sec2) {
      return res.status(404).json({ error: 'Service Section 2 not found' });
    }

    res.status(200).json({
      message: 'Service Section 2 updated successfully',
      data: sec2,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Server error',
    });
  }
};

// GET by category levels
exports.getSec2 = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }

    const query = { categoryId };
    if (subSubCategoryId && subSubCategoryId !== 'null') query.subSubCategoryId = subSubCategoryId;
    else if (subCategoryId && subCategoryId !== 'null') query.subCategoryId = subCategoryId;

    const sec1 = await ServiceSec2.findOne(query);

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
exports.deleteSec2 = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId } = req.query;

    const query = { categoryId };
    if (subSubCategoryId && subSubCategoryId !== 'null') query.subSubCategoryId = subSubCategoryId;
    else if (subCategoryId && subCategoryId !== 'null') query.subCategoryId = subCategoryId;

    const sec1 = await ServiceSec2.findOneAndDelete(query);

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

// GET single ServiceSec2 by _id
exports.getSec2ById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const sec2 = await ServiceSec2.findById(id)
      .populate('categoryId', 'category')
      .populate('subCategoryId')
      .populate('subSubCategoryId');

    if (!sec2) {
      return res.status(404).json({ success: false, message: 'Service Section 2 not found' });
    }

    res.status(200).json({ success: true, data: sec2 });
  } catch (error) {
    console.error('Error fetching Sec2 by ID:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllServiceSec2 = async (req, res) => {
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

    const data = await ServiceSec2.find(filter)
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
    console.error('Error in getAllServiceSec2:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};