const { default: mongoose } = require("mongoose");
const FAQ = require("../model/fqa");
const ServiceCategory = require('../model/serviceCategory');

const replaceSlugWithId = async (req, res) => {
  try {
    const faqs = await FAQ.find({});

    let successCount = 0;
    let skipCount = 0;
    const errors = [];

    for (const faq of faqs) {
      try {
        let needsUpdate = false;
        const updates = {};

        // Convert serviceparentCategoryId
        if (faq.serviceparentCategoryId) {
          if (typeof faq.serviceparentCategoryId === 'string' && faq.serviceparentCategoryId.trim() !== '') {
            if (mongoose.Types.ObjectId.isValid(faq.serviceparentCategoryId)) {
              updates.serviceparentCategoryId = new mongoose.Types.ObjectId(faq.serviceparentCategoryId);
              needsUpdate = true;
            } else {
              errors.push({
                faqId: faq._id,
                field: 'serviceparentCategoryId',
                value: faq.serviceparentCategoryId,
                error: 'Invalid ObjectId format'
              });
            }
          }
        }

        // Convert servicesubCategoryId
        if (faq.servicesubCategoryId) {
          if (typeof faq.servicesubCategoryId === 'string' && faq.servicesubCategoryId.trim() !== '') {
            if (mongoose.Types.ObjectId.isValid(faq.servicesubCategoryId)) {
              updates.servicesubCategoryId = new mongoose.Types.ObjectId(faq.servicesubCategoryId);
              needsUpdate = true;
            } else {
              errors.push({
                faqId: faq._id,
                field: 'servicesubCategoryId',
                value: faq.servicesubCategoryId,
                error: 'Invalid ObjectId format'
              });
            }
          }
        }

        // Convert servicesubSubCategoryId
        if (faq.servicesubSubCategoryId) {
          if (typeof faq.servicesubSubCategoryId === 'string' && faq.servicesubSubCategoryId.trim() !== '') {
            if (mongoose.Types.ObjectId.isValid(faq.servicesubSubCategoryId)) {
              updates.servicesubSubCategoryId = new mongoose.Types.ObjectId(faq.servicesubSubCategoryId);
              needsUpdate = true;
            } else {
              errors.push({
                faqId: faq._id,
                field: 'servicesubSubCategoryId',
                value: faq.servicesubSubCategoryId,
                error: 'Invalid ObjectId format'
              });
            }
          }
        }

        // Update the FAQ if needed
        if (needsUpdate) {
          await FAQ.updateOne(
            { _id: faq._id },
            { $set: updates }
          );
          successCount++;
        } else {
          skipCount++;
        }

      } catch (err) {
        errors.push({
          faqId: faq._id,
          error: err.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'String to ObjectId conversion completed',
      totalFAQs: faqs.length,
      successCount,
      skipCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in convertStringToObjectId:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during conversion',
      error: error.message
    });
  }
};





const insertFAQ = async (req, res) => {
  try {
    const {
      question, answer, status,
      serviceparentCategoryId, servicesubCategoryId, servicesubSubCategoryId,
      industryparentCategoryId, industrysubCategoryId, industrysubSubCategoryId,
      blogId, slug
    } = req.body;

    // Helper to convert empty strings to undefined to avoid Mongoose ObjectId casting errors
    const cleanId = (id) => (id && id.trim() !== "") ? id : undefined;

    const faq = new FAQ({
      question,
      answer,
      status,
      serviceparentCategoryId: cleanId(serviceparentCategoryId),
      servicesubCategoryId: cleanId(servicesubCategoryId),
      servicesubSubCategoryId: cleanId(servicesubSubCategoryId),
      industryparentCategoryId: cleanId(industryparentCategoryId),
      industrysubCategoryId: cleanId(industrysubCategoryId),
      industrysubSubCategoryId: cleanId(industrysubSubCategoryId),
      blogId: cleanId(blogId),
      slug: slug
    });

    await faq.save();

    return res.status(201).json({
      message: "your FAQ send successfully",
      faq: faq
    });
  } catch (error) {
    console.error("Error in insertFAQ:", error);
    res.status(400).json({
      message: error.message,
      error: error
    });
  }
}

const getFAQ = async (req, res) => {
  try {
    const faqs = await FAQ.find().lean();

    // Get all unique parent category IDs from FAQs
    const parentIds = [...new Set(
      faqs
        .map(f => f.serviceparentCategoryId)
        .filter(Boolean)
        .map(id => id.toString())
    )];

    // Fetch all relevant parent categories in one query
    const parentCategories = await ServiceCategory.find({
      _id: { $in: parentIds }
    }).lean();

    // Build lookup maps for parent, sub, and subsub
    const parentMap = {};
    const subMap = {};
    const subSubMap = {};

    parentCategories.forEach(parent => {
      parentMap[parent._id.toString()] = {
        _id: parent._id,
        category: parent.category
      };

      (parent.subCategories || []).forEach(sub => {
        subMap[sub._id.toString()] = {
          _id: sub._id,
          category: sub.category
        };

        (sub.subSubCategory || []).forEach(subsub => {
          subSubMap[subsub._id.toString()] = {
            _id: subsub._id,
            category: subsub.category
          };
        });
      });
    });

    // Attach resolved category objects to each FAQ
    const enrichedFaqs = faqs.map(faq => ({
      ...faq,
      serviceparentCategoryId: faq.serviceparentCategoryId
        ? parentMap[faq.serviceparentCategoryId.toString()] || null
        : null,
      servicesubCategoryId: faq.servicesubCategoryId
        ? subMap[faq.servicesubCategoryId.toString()] || null
        : null,
      servicesubSubCategoryId: faq.servicesubSubCategoryId
        ? subSubMap[faq.servicesubSubCategoryId.toString()] || null
        : null,
    }));

    res.status(200).json({ data: enrichedFaqs });

  } catch (error) {
    console.error("getFAQ error:", error);
    res.status(400).json({ message: error.message, error });
  }
};

const updateFAQ = async (req, res) => {
  const { id } = req.query;
  const updateFields = req.body;

  try {
    const existingFaq = await FAQ.findById(id);
    if (!existingFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    // Clean up empty strings for ObjectId fields in updateFields if they exist
    const categoryFields = [
      'serviceparentCategoryId', 'servicesubCategoryId', 'servicesubSubCategoryId',
      'industryparentCategoryId', 'industrysubCategoryId', 'industrysubSubCategoryId',
      'blogId'
    ];

    categoryFields.forEach(field => {
      if (updateFields[field] === "") {
        updateFields[field] = null; // Use null for Mongoose to unset or set it as null
      }
    });

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.status(200).json({ message: 'FAQ updated successfully', data: updatedFAQ });
  } catch (error) {
    console.error("Error in updateFAQ:", error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};


const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.query;
    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).send({ message: 'FAQ not found' });
    }
    res.send({ message: "FAQ deleted successfully" }).status(200);
  } catch (error) {

    res.status(400).send(error);
  }
}

const getFAQById = async (req, res) => {
  try {
    const { id } = req.query;
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({ data: faq });
  } catch (error) {

    res.status(500).json({ message: "Server error" });
  }
}

const countFaq = async (req, res) => {
  try {
    const count = await FAQ.countDocuments();
    res.status(200).json({ total: count });
  } catch (error) {

    res.status(500).json({ message: 'Error counting services' });
  }
};

const getFAQByBlogId = async (req, res) => {
  try {
    const { blogId } = req.query;
    if (!blogId) {
      return res.status(400).json({ message: "blogId is required" });
    }
    const faqs = await FAQ.find({ blogId }).lean();
    res.status(200).json({ data: faqs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// website side routes 

const getFAQWebsite = async (req, res) => {
  try {
    const status = "active"; // Filter for active FAQs
    const faq = await FAQ.find({ status }); // Find only active FAQs

    res.status(200).json({
      data: faq
    });
  } catch (error) {
    res.status(400).send(error);
  }
};

const getFAQBySlug = async (req, res) => {
  try {
    const { slug } = req.query; // Get the slug from the query parameters

    // If the slug is provided, search for FAQs based on the slug
    if (slug) {
      // 0. Check for direct slug match (e.g. for static pages like 'our-expertise')
      const faqsWithDirectSlugMatch = await FAQ.find({
        status: "active",
        slug: slug
      });

      if (faqsWithDirectSlugMatch.length > 0) {
        return res.status(200).json({ data: faqsWithDirectSlugMatch });
      }

      // 1. If slug matches serviceparentCategoryId or industryparentCategoryId, return FAQs where both subCategoryId and subSubCategoryId are empty
      const faqsWithParentMatch = await FAQ.find({
        status: "active",
        $or: [
          { serviceparentCategoryId: slug, servicesubCategoryId: '', servicesubSubCategoryId: '' },
          { industryparentCategoryId: slug, industrysubCategoryId: '', industrysubSubCategoryId: '' }
        ]
      });

      if (faqsWithParentMatch.length > 0) {
        return res.status(200).json({ data: faqsWithParentMatch });
      }

      // 2. If slug matches servicesubCategoryId or industrysubCategoryId, return FAQs where subSubCategoryId is empty
      const faqsWithSubCategoryMatch = await FAQ.find({
        status: "active",
        $or: [
          { servicesubCategoryId: slug, servicesubSubCategoryId: '' },
          { industrysubCategoryId: slug, industrysubSubCategoryId: '' }
        ]
      });

      if (faqsWithSubCategoryMatch.length > 0) {
        return res.status(200).json({ data: faqsWithSubCategoryMatch });
      }

      // 3. If slug matches servicesubSubCategoryId or industrysubSubCategoryId, return all FAQs where both serviceparentCategoryId and servicesubCategoryId are not empty
      const faqsWithSubSubCategoryMatch = await FAQ.find({
        status: "active",
        $or: [
          { servicesubSubCategoryId: slug, serviceparentCategoryId: { $ne: '' }, servicesubCategoryId: { $ne: '' } },
          { industrysubSubCategoryId: slug, industryparentCategoryId: { $ne: '' }, industrysubCategoryId: { $ne: '' } }
        ]
      });

      if (faqsWithSubSubCategoryMatch.length > 0) {
        return res.status(200).json({ data: faqsWithSubSubCategoryMatch });
      }

      // If no matching FAQs are found, return a message
      return res.status(404).json({ message: 'No active FAQs found matching the given slug.' });

    } else {
      // If no slug is provided, return FAQs where all three fields are empty and status is active
      const faqsWithAllEmptyFields = await FAQ.find({
        status: "active",
        serviceparentCategoryId: '',
        servicesubCategoryId: '',
        servicesubSubCategoryId: '',
        industryparentCategoryId: '',
        industrysubCategoryId: '',
        industrysubSubCategoryId: ''
      });

      return res.status(200).json({ data: faqsWithAllEmptyFields });
    }
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { getFAQBySlug, replaceSlugWithId, insertFAQ, getFAQ, updateFAQ, deleteFAQ, getFAQById, countFaq, getFAQWebsite, getFAQByBlogId }; 