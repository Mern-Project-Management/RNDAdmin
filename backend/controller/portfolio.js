const Portfolio = require("../model/portfolio");
const PortfolioCategory = require("../model/portfoliocategory")
const ServiceCategory = require("../model/serviceCategory");
const path = require('path');
const fs = require('fs')

const insertPortfolio = async (req, res) => {
  try {
    const { title, details, status, link, alt, imgtitle, slug } = req.body;
    const photo = req.files['photo'] ? req.files['photo'].map(file => file.filename) : [];

    const parseField = (field) => {
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed)) {
            return parsed.filter(item => item && item.toString().trim() !== '');
          }
        } catch (e) {
          return field.split(',').map(s => s.trim()).filter(s => s);
        }
      }
      if (Array.isArray(field)) {
        return field.filter(item => item && item.toString().trim() !== '');
      }
      return [];
    };

    const Portfolios = new Portfolio({
      title,
      details,
      photo,
      imgtitle,
      link,
      slug,
      status,
      alt,
      categories: parseField(req.body.categories),
      subcategories: parseField(req.body.subcategories),
      subSubcategories: parseField(req.body.subSubcategories),
      servicecategories: parseField(req.body.servicecategories),
      servicesubcategories: parseField(req.body.servicesubcategories),
      servicesubSubcategories: parseField(req.body.servicesubSubcategories),
      industrycategories: parseField(req.body.industrycategories),
      industrysubcategories: parseField(req.body.industrysubcategories),
      industrysubSubcategories: parseField(req.body.industrysubSubcategories)
    });

    await Portfolios.save();
    res.send(Portfolios);
  } catch (err) {
    console.error("Error inserting Portfolio:", err);
    res.status(400).send(err);
  }
}

const getPortfolio = async (req, res) => {
  try {
    const { page = 1, } = req.query;
    const limit = 10;
    const count = await Portfolio.countDocuments();
    
    // Fetching the portfolio items with pagination and populating the category
    const portfolios = await Portfolio.find()
      .populate({
        path: 'categories',
        model: PortfolioCategory // Explicitly provide the model to prevent MissingSchemaError
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Map over the portfolios and extract the category name from the populated field
    const portfolioWithCategoryName = portfolios.map(portfolioItem => {
      const categoryName = (portfolioItem.categories && portfolioItem.categories.length > 0)
        ? portfolioItem.categories[0].category
        : 'Uncategorized';

      return {
        ...portfolioItem.toJSON(),
        categoryName
      };
    });

    res.status(200).json({
      data: portfolioWithCategoryName,
      total: count,
      currentPage: page,
      hasNextPage: count > page * limit
    });
  } catch (error) {
    console.error("Error retrieving portfolio:", error);
    let errorMessage = 'Server error';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid query parameter format';
    }
    res.status(500).json({ message: errorMessage, error });
  }
};



const getPortfolioFront = async (req, res) => {
  try {
    // Fetch all Portfolio and sort by date in descending order to get the latest Portfolio first
    const portfolio = await Portfolio.find()
      .populate({ path: 'categories', model: PortfolioCategory })
      .populate({ path: 'servicecategories', model: ServiceCategory })
      .sort({ date: -1 });

    // Map over the Portfolio and extract the associated category and service category names
    const PortfolioWithCategoryAndService = portfolio.map((PortfolioItem) => {
      const categoryName = PortfolioItem.categories && PortfolioItem.categories.length > 0 ? PortfolioItem.categories[0].category : 'Uncategorized';
      const serviceCategoryName = PortfolioItem.servicecategories && PortfolioItem.servicecategories.length > 0 ? PortfolioItem.servicecategories[0].category : 'No Service Category';

      return {
        ...PortfolioItem.toJSON(),
        categoryName,
        serviceCategoryName
      };
    });

    // Return the sorted Portfolio with category and service category names
    res.status(200).json({
      data: PortfolioWithCategoryAndService,
      total: portfolio.length
    });
  } catch (error) {
    console.error("Error retrieving Portfolio:", error);
    let errorMessage = 'Server error';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid query parameter format';
    }
    res.status(500).json({ message: errorMessage, error });
  }
};

// get single details of the blog 
const getPortfolioBySlug = async (req, res) => {
  try {
    // Extract the slug from the request parameters
    const { slug } = req.params;
    // Fetch the Portfolio item by slug
    const PortfolioItem = await Portfolio.findOne({ slug: slug });

    // Check if the Portfolio item exists
    if (!PortfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Fetch the associated category name
    const category = await PortfolioCategory.findOne({ '_id': PortfolioItem.categories });
    const categoryName = category ? category.category : 'Uncategorized';

    // Fetch the associated service category name
    const serviceCategory = await ServiceCategory.findOne({ '_id': PortfolioItem.servicecategories });
    const serviceCategoryName = serviceCategory ? serviceCategory.category : 'No Service Category';

    // Return the Portfolio item with category and service category names
    res.status(200).json({
      ...PortfolioItem.toJSON(),
      categoryName,
      serviceCategoryName
    });
  } catch (error) {
    console.error("Error retrieving Portfolio:", error);
    let errorMessage = 'Server error';
    if (error.name === 'CastError') {
      errorMessage = 'Invalid query parameter format';
    }
    res.status(500).json({ message: errorMessage, error });
  }
};


const updatePortfolio = async (req, res) => {
  const { id } = req.query;
  const updateFields = req.body;

  try {
    const parseField = (field) => {
      if (field === undefined) {
        return undefined;
      }
      if (field === '' || (Array.isArray(field) && field.length === 0)) {
        return [];
      }

      if (typeof field === 'string') {
        const sanitized = field.trim().replace(/^\[|\]$/g, '');
        
        if (sanitized === '') {
          return [];
        }

        return sanitized
          .split(',')
          .map(s => s.trim().replace(/^['"]|['"]$/g, '').trim())
          .filter(item => item);
      }

      if (Array.isArray(field)) {
        return field.filter(item => item && item.toString().trim() !== '');
      }
      return [];
    };

    // Helper function to convert slug to ObjectId with appropriate model
    const convertSlugToObjectId = async (slugOrId, modelName) => {
      if (!slugOrId) return null;

      // Check if the value is already a valid ObjectId
      const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
      if (checkForHexRegExp.test(slugOrId)) {
        return slugOrId;
      }
      
      let Model;
      switch(modelName) {
        case 'PortfolioCategory':
          Model = PortfolioCategory;
          break;
    
        default:
          return null;
      }
      
      const category = await Model.findOne({ _id: slugOrId });
      return category ? category._id : null;
    };

    // Parse category fields
    const categoryFieldsConfig = [
      { field: 'categories', model: 'PortfolioCategory' },
      { field: 'subcategories', model: 'PortfolioCategory' },
      { field: 'subSubcategories', model: 'PortfolioCategory' },
  
    ];

    // Parse all category fields
    for (const config of categoryFieldsConfig) {
      if (Object.prototype.hasOwnProperty.call(updateFields, config.field)) {
        const parsedValue = parseField(updateFields[config.field]);
        if (parsedValue !== undefined) {
          updateFields[config.field] = parsedValue;
        }
      }
    }

    // Convert category slugs to ObjectIds
    for (const config of categoryFieldsConfig) {
      if (updateFields[config.field] && updateFields[config.field].length > 0) {
        const categoryIds = await Promise.all(
          updateFields[config.field].map(slug => 
            convertSlugToObjectId(slug, config.model)
          )
        );
        updateFields[config.field] = categoryIds.filter(id => id !== null);
      }
    }

    // Fetch the existing Portfolio item
    const existingPortfolio = await Portfolio.findOne({ _id: id });

    if (!existingPortfolio) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Process new uploaded photos
    if (req.files && req.files['photo'] && req.files['photo'].length > 0) {
      if (existingPortfolio.photo && existingPortfolio.photo.length > 0) {
        const newPhotoPaths = req.files['photo'].map(file => file.filename);
        updateFields.photo = [...existingPortfolio.photo, ...newPhotoPaths];
      } else {
        updateFields.photo = req.files['photo'].map(file => file.filename);
      }
    } else {
      if (updateFields.photo === undefined) {
        updateFields.photo = existingPortfolio.photo;
      }
    }

    // Process alt and imgtitle arrays
    if (updateFields.alt !== undefined) {
      updateFields.alt = parseField(updateFields.alt);
    }
    if (updateFields.imgtitle !== undefined) {
      updateFields.imgtitle = parseField(updateFields.imgtitle);
    }

    // Perform the update operation
    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedPortfolio);
  } catch (error) {
    console.error("Error updating Portfolio:", error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const deletePortfolio = async (req, res) => {
  try {
    const { slugs } = req.query;

    const portfolio = await Portfolio.findOne({ _id: slugs });

    if (portfolio && portfolio.photo) {
      portfolio.photo.forEach(filename => {
        const filePath = path.join(__dirname, '../uploads/images', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        } else {
          console.warn(`File not found: ${filename}`);
        }
      });
    }

    const deletedPortfolio = await Portfolio.findOneAndDelete({ _id: slugs });

    if (!deletedPortfolio) {
      return res.status(404).send({ message: 'Portfolio not found' });
    }

    res.send({ message: "Portfolio deleted successfully" }).status(200);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
}

const deleteMultiplePortfolios = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided for deletion" });
    }

    const portfolios = await Portfolio.find({ _id: { $in: ids } });

    portfolios.forEach(portfolio => {
      if (portfolio.photo && portfolio.photo.length > 0) {
        portfolio.photo.forEach(filename => {
          const filePath = path.join(__dirname, '../uploads/images', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });

    await Portfolio.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: `${ids.length} portfolios deleted successfully` });
  } catch (error) {
    console.error("Error in bulk delete portfolios:", error);
    res.status(500).json({ message: "Error in bulk delete", error: error.message });
  }
};


const getPortfolioById = async (req, res) => {
  try {
    const { id } = req.query;
    const portfolio = await Portfolio.findById(id);
   
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.status(200).json({ data: portfolio });
  } catch (error) {

    res.status(500).json({ message: "Server error" });
  }
}

const countPortfolio = async (req, res) => {
  try {
    const count = await Portfolio.countDocuments();
    res.status(200).json({ total: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error counting services' });
  }
};

const deletePhotoAndAltText = async (req, res) => {

  const { id, imageFilename, index } = req.params;
console.log(req.params)

  try {

    const portfolio = await Portfolio.findById({ id });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Remove the photo and its alt text
    portfolio.photo = portfolio.photo.filter(photo => photo !== imageFilename);
    portfolio.alt.splice(index, 1);
    portfolio.imgtitle.splice(index, 1);

    await portfolio.save();

    const filePath = path.join(__dirname, '..', 'uploads', 'images', imageFilename);

    // Check if the file exists and delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Photo and alt text deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo and alt text:', error);
    res.status(500).json({ message: error.message });
  }
};

const getCategoryPortfolio = async (req, res) => {
  const { categoryId } = req.query;

  try {
    const portfolio = await Portfolio.find({ categories: categoryId });

    if (portfolio.length === 0) {
      return res.status(404).json({ message: 'No Portfolio found for this category' });
    }

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getSubcategoryPortfolio = async (req, res) => {
  const { subcategoryId } = req.query;

  try {
    const portfolio = await Portfolio.find({ subcategories: subcategoryId });

    if (portfolio.length === 0) {
      return res.status(404).json({ message: 'No Portfolio found for this subcategory' });
    }

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getSubSubcategoryPortfolio = async (req, res) => {
  const { subSubcategoryId } = req.query;

  try {
    const portfolio = await Portfolio.find({ subSubcategories: subSubcategoryId });

    if (portfolio.length === 0) {
      return res.status(404).json({ message: 'No Portfolio found for this sub-subcategory' });
    }

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getPortfolioByServiceSlug = async (req, res) => {
  try {
    const { slug } = req.query; // Get the slug from the query parameters

    // Search for a portfolio matching the slug in service categories, subcategories, or sub-subcategories
    const portfolio = await Portfolio.find({
      $or: [
        { servicecategories: slug }, // Replace with the actual field name for service categories
        { servicesubcategories: slug }, // Replace with the actual field name for service subcategories
        { servicesubsubcategories: slug }, // Replace with the actual field name for service sub-subcategories
        { industrycategories: slug }, // Replace with the actual field name for service categories
        { industrysubcategories: slug }, // Replace with the actual field name for service subcategories
        { industrysubsubcategories: slug }, // Replace with the actual field name for service sub-subcategories
      ],
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.status(200).json({ data: portfolio });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: "Server error" });
  }
};

const searchPortfolio = async (req, res) => {
  try {
    const {
      title = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'all',
      category = '',
      subCategory = '',
      subSubCategory = ''
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery = {};

    // Title search (case-insensitive, partial match)
    if (title.trim() !== '') {
      searchQuery.title = {
        $regex: title.trim(),
        $options: 'i' // Case-insensitive
      };
    }

    // Status filter
    if (status !== 'all' && status.trim() !== '') {
      searchQuery.status = status;
    }

    // Category filters (assuming you have these fields in your Portfolio model)
    if (category.trim() !== '') {
      searchQuery.category = category;
    }

    if (subCategory.trim() !== '') {
      searchQuery.subCategory = subCategory;
    }

    if (subSubCategory.trim() !== '') {
      searchQuery.subSubCategory = subSubCategory;
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute search with aggregation for better performance and data
    const aggregationPipeline = [
      // Match stage - filter documents
      {
        $match: searchQuery
      },
      // Lookup stage - join with category data if needed
      {
        $lookup: {
          from: 'portfoliocategories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      // Add computed fields
      {
        $addFields: {
          categoryInfo: { $arrayElemAt: ['$categoryData', 0] },
          searchScore: {
            $cond: {
              if: { $regexMatch: { input: '$title', regex: title, options: 'i' } },
              then: 1,
              else: 0
            }
          }
        }
      },
      // Sort stage
      {
        $sort: sortOptions
      },
      // Facet stage for pagination and count
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum },
            {
              $project: {
                _id: 1,
                title: 1,
                description: 1,
                photo: 1,
                alt: 1,
                imgtitle: 1,
                slug: 1,
                status: 1,
                category: 1,
                subCategory: 1,
                subSubCategory: 1,
                metatitle: 1,
                metadescription: 1,
                url: 1,
                priority: 1,
                createdAt: 1,
                updatedAt: 1,
                categoryInfo: {
                  category: 1,
                  slug: 1
                }
              }
            }
          ],
          totalCount: [
            { $count: 'count' }
          ],
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ];

    // Execute aggregation
    const results = await Portfolio.aggregate(aggregationPipeline);

    // Extract data from aggregation results
    const portfolioItems = results[0]?.data || [];
    const totalCount = results[0]?.totalCount[0]?.count || 0;
    const statusCounts = results[0]?.statusCounts || [];

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Format status counts for easier frontend consumption
    const statusSummary = statusCounts.reduce((acc, item) => {
      acc[item._id || 'unknown'] = item.count;
      return acc;
    }, {});

    // Response object
    const response = {
      success: true,
      message: 'Portfolio search completed successfully',
      data: {
        portfolios: portfolioItems,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? pageNum + 1 : null,
          prevPage: hasPrevPage ? pageNum - 1 : null
        },
        searchInfo: {
          query: title,
          filters: {
            status: status !== 'all' ? status : null,
            category: category || null,
            subCategory: subCategory || null,
            subSubCategory: subSubCategory || null
          },
          sorting: {
            sortBy,
            sortOrder
          }
        },
        summary: {
          statusCounts: statusSummary,
          searchResultCount: totalCount
        }
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in portfolio search:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching portfolios',
      error: error.message
    });
  }
};

// Alternative simpler search function for basic title search only
const simpleSearchPortfolio = async (req, res) => {
  try {
    const {
      title = '',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search query for title
    const searchQuery = title.trim() !== '' ? {
      title: {
        $regex: title.trim(),
        $options: 'i'
      }
    } : {};

    // Get total count for pagination
    const totalCount = await Portfolio.countDocuments(searchQuery);

    // Get paginated results
    const portfolios = await Portfolio
      .find(searchQuery)
      .select('title description photo alt imgtitle slug status category subCategory subSubCategory createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      message: 'Portfolio search completed',
      data: {
        portfolios,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        searchQuery: title
      }
    });

  } catch (error) {
    console.error('Error in simple portfolio search:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching portfolios',
      error: error.message
    });
  }
};

module.exports = { searchPortfolio, simpleSearchPortfolio, getPortfolioByServiceSlug, getPortfolioFront, getPortfolioBySlug, insertPortfolio, getPortfolio, updatePortfolio, deletePortfolio, deleteMultiplePortfolios, getPortfolioById, countPortfolio, deletePhotoAndAltText, getCategoryPortfolio, getSubcategoryPortfolio, getSubSubcategoryPortfolio };
