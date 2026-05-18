const WhyChooseUs = require('../model/whychooseus');
const path = require('path');
const fs = require('fs');

// Helper function to delete old images
const deleteImage = (imagePath) => {
  if (imagePath) {
    const fullPath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};
const processCards = (cards, files, oldCards = []) => {
  let parsedCards = [];

  if (typeof cards === 'string') {
    try {
      parsedCards = JSON.parse(cards);
    } catch (e) {
      throw new Error('Invalid cards JSON');
    }
  } else if (Array.isArray(cards)) {
    parsedCards = cards;
  } else {
    throw new Error('Cards must be an array or a JSON string');
  }

  return parsedCards.map((card, index) => {
    const specificField = `cards[${index}][photo]`;
    let finalPhoto = card.photo || '';

    // Check if new photo uploaded for this specific card
    if (files && files[specificField] && files[specificField][0]) {
      // If there was an old photo at this index, delete it
      if (oldCards[index] && oldCards[index].photo && oldCards[index].photo !== card.photo) {
        deleteImage(oldCards[index].photo);
      }
      finalPhoto = 'uploads/images/' + files[specificField][0].filename;
    } else if (files && files['photo'] && files['photo'][index]) {
      // Fallback for old frontend format if still used
      if (oldCards[index] && oldCards[index].photo && oldCards[index].photo !== card.photo) {
        deleteImage(oldCards[index].photo);
      }
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
// Create WhyChooseUs
exports.createWhyChooseUs = async (req, res) => {
  try {
    const {
      heading,
      subheading,
      details,
      alt,
      imgTitle,
      cards,
      categoryId,
      subCategoryId,
      subSubCategoryId,
    } = req.body;

    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }

    // Handle main photo (separate from card photos)
    const mainPhoto = req.files && req.files['mainPhoto'] 
      ? 'uploads/images/' + req.files['mainPhoto'][0].filename 
      : '';

    // Process cards with up to 5 uploaded photos (field name: 'photo')
    const processedCards = processCards(cards, req.files);

    const payload = {
      heading: heading || '',
      subheading: subheading || '',
      details: details || '',
      photo: mainPhoto,
      alt: alt || '',
      imgTitle: imgTitle || '',
      cards: processedCards,
      categoryId,
      ...(subCategoryId && subCategoryId !== 'null' && { subCategoryId }),
      ...(subSubCategoryId && subSubCategoryId !== 'null' && { subSubCategoryId }),
    };

    const whyChooseUs = await WhyChooseUs.create(payload);

    res.status(201).json({
      success: true,
      message: 'Why Choose Us section created successfully',
      data: whyChooseUs,
    });
  } catch (error) {
    console.error('Error creating Why Choose Us:', error);
    res.status(error.message.includes('Invalid') || error.message.includes('Maximum') 
      ? 400 
      : 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get all WhyChooseUs
exports.getAllWhyChooseUs = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId, page = 1, limit = 10 } = req.query;

    const query = {};
    if (categoryId) query.categoryId = categoryId;
    if (subCategoryId) query.subCategoryId = subCategoryId;
    if (subSubCategoryId) query.subSubCategoryId = subSubCategoryId;

    const skip = (page - 1) * limit;

    const whyChooseUsList = await WhyChooseUs.find(query)
      .populate('categoryId', 'category slug')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await WhyChooseUs.countDocuments(query);

    res.status(200).json({
      success: true,
      data: whyChooseUsList,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching Why Choose Us:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Why Choose Us',
      error: error.message,
    });
  }
};

// Get WhyChooseUs by ID
exports.getWhyChooseUsById = async (req, res) => {
  try {
    const whyChooseUs = await WhyChooseUs.findById(req.params.id)
      .populate('categoryId');

    if (!whyChooseUs) {
      return res.status(404).json({
        success: false,
        message: 'Why Choose Us not found',
      });
    }

    res.status(200).json({
      success: true,
      data: whyChooseUs,
    });
  } catch (error) {
    console.error('Error fetching Why Choose Us:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Why Choose Us',
      error: error.message,
    });
  }
};

// Get WhyChooseUs by Category
exports.getWhyChooseUsByCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId, subSubCategoryId } = req.params;

    const query = { categoryId };
    if (subCategoryId && subCategoryId !== 'null') query.subCategoryId = subCategoryId;
    if (subSubCategoryId && subSubCategoryId !== 'null') query.subSubCategoryId = subSubCategoryId;

    const whyChooseUs = await WhyChooseUs.findOne(query)
      .populate('categoryId');

    if (!whyChooseUs) {
      return res.status(404).json({
        success: false,
        message: 'Why Choose Us not found for this category',
      });
    }

    res.status(200).json({
      success: true,
      data: whyChooseUs,
    });
  } catch (error) {
    console.error('Error fetching Why Choose Us by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Why Choose Us',
      error: error.message,
    });
  }
};

// Update WhyChooseUs
exports.updateWhyChooseUs = async (req, res) => {
  try {
    const {
      heading,
      subheading,
      details,
      alt,
      imgTitle,
      cards,
      categoryId,
      subCategoryId,
      subSubCategoryId,
    } = req.body;

    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }

    const whyChooseUs = await WhyChooseUs.findById(req.params.id);
    if (!whyChooseUs) {
      return res.status(404).json({
        success: false,
        message: 'Why Choose Us not found',
      });
    }

    /* ---------------- MAIN PHOTO ---------------- */
    let mainPhoto = whyChooseUs.photo;

    if (req.files && req.files['mainPhoto']) {
      // delete old photo
      if (whyChooseUs.photo) {
        deleteImage(whyChooseUs.photo);
      }
      mainPhoto = 'uploads/images/' + req.files['mainPhoto'][0].filename;
    }

    /* ---------------- CARDS ---------------- */
    // processCards should:
    // - parse cards if string
    // - keep existing card photos if new not uploaded
    // - replace photo if new uploaded
    const processedCards = processCards(cards, req.files, whyChooseUs.cards);

    // Check for deleted cards and remove their images
    if (whyChooseUs.cards && whyChooseUs.cards.length > 0) {
      const newCardPhotos = processedCards.map(c => c.photo).filter(p => p);
      whyChooseUs.cards.forEach(oldCard => {
        // If the old photo is not in the new set of photos, delete it
        // Note: we check if it's NOT in newCardPhotos to avoid deleting a photo that was just kept
        if (oldCard.photo && !newCardPhotos.includes(oldCard.photo)) {
          deleteImage(oldCard.photo);
        }
      });
    }

    /* ---------------- PAYLOAD ---------------- */
    const payload = {
      heading: heading ?? whyChooseUs.heading,
      subheading: subheading ?? whyChooseUs.subheading,
      details: details ?? whyChooseUs.details,
      photo: mainPhoto,
      alt: alt ?? whyChooseUs.alt,
      imgTitle: imgTitle ?? whyChooseUs.imgTitle,
      cards: processedCards ?? whyChooseUs.cards,
      categoryId,

      // optional relations
      ...(subCategoryId && subCategoryId !== 'null'
        ? { subCategoryId }
        : { subCategoryId: undefined }),

      ...(subSubCategoryId && subSubCategoryId !== 'null'
        ? { subSubCategoryId }
        : { subSubCategoryId: undefined }),
    };

    const updatedWhyChooseUs = await WhyChooseUs.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Why Choose Us updated successfully',
      data: updatedWhyChooseUs,
    });
  } catch (error) {
    console.error('Error updating Why Choose Us:', error);
    res.status(
      error.message.includes('Invalid') || error.message.includes('Maximum')
        ? 400
        : 500
    ).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


// Delete WhyChooseUs
exports.deleteWhyChooseUs = async (req, res) => {
  try {
    const whyChooseUs = await WhyChooseUs.findById(req.params.id);
    if (!whyChooseUs) {
      return res.status(404).json({
        success: false,
        message: 'Why Choose Us not found',
      });
    }

    // Delete main photo
    if (whyChooseUs.photo) {
      deleteImage(whyChooseUs.photo);
    }

    // Delete card photos
    if (whyChooseUs.cards && whyChooseUs.cards.length > 0) {
      whyChooseUs.cards.forEach(card => {
        if (card.photo) {
          deleteImage(card.photo);
        }
      });
    }

    await WhyChooseUs.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Why Choose Us deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting Why Choose Us:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Why Choose Us',
      error: error.message,
    });
  }
};

// Delete a specific card from WhyChooseUs
exports.deleteCard = async (req, res) => {
  try {
    const { id, cardId } = req.params;

    const whyChooseUs = await WhyChooseUs.findById(id);
    if (!whyChooseUs) {
      return res.status(404).json({
        success: false,
        message: 'Why Choose Us not found',
      });
    }

    const card = whyChooseUs.cards.id(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    // Delete card photo
    if (card.photo) {
      deleteImage(card.photo);
    }

    whyChooseUs.cards.pull(cardId);
    await whyChooseUs.save();

    res.status(200).json({
      success: true,
      message: 'Card deleted successfully',
      data: whyChooseUs,
    });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete card',
      error: error.message,
    });
  }
};