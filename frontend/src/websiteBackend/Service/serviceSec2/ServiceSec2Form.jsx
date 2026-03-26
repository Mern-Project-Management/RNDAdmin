import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';



const ServiceSec2Form = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  const [formData, setFormData] = useState({
    heading: '',
    subheading: '',
    details: '',
    categoryId: '',
    subCategoryId: '',
    subSubCategoryId: '',
    cards: [
      {
        title: '',
        subTitle: '',
        description: '',
        photo: null,
        currentPhoto: '',
        alt: '',
        imgTitle: '',
      },
    ],
  });

  const [selectedLevel, setSelectedLevel] = useState('category');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isFormReady, setIsFormReady] = useState(!isEditMode);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditMode && id && categories.length > 0) {
      fetchDataForEdit(id);
    }
  }, [id, categories]);

  //   useEffect(() => {
  //     if (isEditMode && categories.length > 0 && formData.categoryId) {
  //       loadSubCategoriesForEdit(formData);
  //     }
  //   }, [categories, isEditMode]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const res = await axios.get('/api/services/getAll');
      const cats = Array.isArray(res.data) ? res.data : res.data.data || [];
      setCategories(cats);
      setMessage({ type: 'success', text: 'Categories loaded successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadSubCategoriesForEdit = (data, categoriesList = categories) => {
    if (data.categoryId) {
      const category = categoriesList.find(cat => String(cat._id) === String(data.categoryId));
      if (category) {
        setSubCategories(category.subCategories || []);

        if (data.subCategoryId) {
          const subCategory = category.subCategories?.find(sub => String(sub._id) === String(data.subCategoryId));
          if (subCategory) {
            setSubSubCategories(subCategory.subSubCategory || []);
          }
        }
      }
    }
  };

  const fetchDataForEdit = async (dataId) => {
    try {
      setLoading(true);

      // Fetch both in parallel to ensure synchronization
      const [editRes, catRes] = await Promise.all([
        axios.get(`/api/serviceSec2/${dataId}`),
        categories.length > 0
          ? Promise.resolve({ data: categories })
          : axios.get('/api/services/getAll').then(r => ({
            data: Array.isArray(r.data) ? r.data : r.data.data || []
          }))
      ]);

      const item = editRes.data.data;
      const categoriesList = Array.isArray(catRes.data) ? catRes.data : catRes.data.data || [];

      if (!item) {
        setMessage({ type: 'error', text: 'Data not found' });
        setTimeout(() => navigate('/serviceSec2-table'), 2000);
        return;
      }

      // Handle nested category objects from API response
      const tempDataForSubs = {
        categoryId: (item.categoryId && typeof item.categoryId === 'object' ? item.categoryId._id : item.categoryId) || '',
        subCategoryId: (item.subCategoryId && typeof item.subCategoryId === 'object' ? item.subCategoryId._id : item.subCategoryId) || '',
        subSubCategoryId: (item.subSubCategoryId && typeof item.subSubCategoryId === 'object' ? item.subSubCategoryId._id : item.subSubCategoryId) || '',
      };

      setFormData({
        heading: item.heading ? String(item.heading).trim() : '',
        subheading: item.subheading ? String(item.subheading).trim() : '',
        details: item.details ? String(item.details).trim() : '',
        categoryId: tempDataForSubs.categoryId,
        subCategoryId: tempDataForSubs.subCategoryId,
        subSubCategoryId: tempDataForSubs.subSubCategoryId,
        cards: item.cards && Array.isArray(item.cards) && item.cards.length > 0
          ? item.cards.map(card => ({
            title: card.title ? String(card.title).trim() : '',
            subTitle: card.subTitle ? String(card.subTitle).trim() : '',
            description: card.description ? String(card.description).trim() : '',
            photo: null,
            currentPhoto: card.photo ? String(card.photo).trim() : '',
            alt: card.alt ? String(card.alt).trim() : '',
            imgTitle: card.imgTitle ? String(card.imgTitle).trim() : '',
          }))
          : [{ title: '', subTitle: '', description: '', photo: null, currentPhoto: '', alt: '', imgTitle: '' }],
      });

      if (categories.length === 0) {
        setCategories(categoriesList);
      }

      // Now load subcategories using the temp data and fresh list
      loadSubCategoriesForEdit(tempDataForSubs, categoriesList);

      // Set selectedLevel based on extracted IDs
      if (tempDataForSubs.subSubCategoryId) {
        setSelectedLevel('subsubcategory');
      } else if (tempDataForSubs.subCategoryId) {
        setSelectedLevel('subcategory');
      } else {
        setSelectedLevel('category');
      }

      setIsFormReady(true);
      setMessage({ type: 'info', text: 'Data loaded for editing' });
    } catch (err) {
      console.error('Error fetching data for edit:', err);
      setMessage({ type: 'error', text: 'Failed to load data' });
      setTimeout(() => navigate('/serviceSec2-table'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(cat => String(cat._id) === String(categoryId));

    setFormData({
      ...formData,
      categoryId,
      subCategoryId: '',
      subSubCategoryId: '',
    });

    setSubCategories(selectedCategory?.subCategories || []);
    setSubSubCategories([]);
  };

  const handleSubCategoryChange = (e) => {
    const subCategoryId = e.target.value;
    const selectedSubCategory = subCategories.find(sub => String(sub._id) === String(subCategoryId));

    setFormData({
      ...formData,
      subCategoryId,
      subSubCategoryId: '',
    });

    setSubSubCategories(selectedSubCategory?.subSubCategory || []);
  };

  const handleSubSubCategoryChange = (e) => {
    setFormData({
      ...formData,
      subSubCategoryId: e.target.value,
    });
  };

  const handleLevelChange = (level) => {
    if (isEditMode) {
      setMessage({ type: 'warning', text: 'Cannot change level in edit mode' });
      return;
    }

    setSelectedLevel(level);
    setFormData({
      ...formData,
      subCategoryId: '',
      subSubCategoryId: '',
      heading: '',
      subheading: '',
      details: '',
      cards: [{ title: '', subTitle: '', description: '', photo: null, currentPhoto: '', alt: '', imgTitle: '' }]
    });
  };

  const handleCardChange = (index, field, value) => {
    const newCards = [...formData.cards];
    newCards[index][field] = value;
    setFormData({ ...formData, cards: newCards });
  };

  const handleCardPhotoChange = (index, file) => {
    const newCards = [...formData.cards];
    newCards[index].photo = file;
    setFormData({ ...formData, cards: newCards });
  };

  const addCard = () => {
    setFormData({
      ...formData,
      cards: [
        ...formData.cards,
        { title: '', subTitle: '', description: '', photo: null, currentPhoto: '', alt: '', imgTitle: '' },
      ],
    });
  };

  const removeCard = (index) => {
    const newCards = formData.cards.filter((_, i) => i !== index);
    setFormData({ ...formData, cards: newCards });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      setMessage({ type: 'error', text: 'Please select a category' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    data.append('heading', formData.heading);
    data.append('subheading', formData.subheading);
    data.append('details', formData.details);
    data.append('categoryId', formData.categoryId);

    if (selectedLevel === 'subcategory' && formData.subCategoryId) {
      data.append('subCategoryId', formData.subCategoryId);
    } else if (selectedLevel === 'subsubcategory' && formData.subSubCategoryId) {
      data.append('subCategoryId', formData.subCategoryId);
      data.append('subSubCategoryId', formData.subSubCategoryId);
    }

    const cardsForSubmit = formData.cards.map(card => ({
      title: card.title,
      subTitle: card.subTitle,
      description: card.description,
      alt: card.alt,
      imgTitle: card.imgTitle,
      photo: card.currentPhoto,
    }));
    data.append('cards', JSON.stringify(cardsForSubmit));

    formData.cards.forEach((card, index) => {
      if (card.photo) {
        data.append(`cards[${index}][photo]`, card.photo);
      }
    });

    try {
      const url = isEditMode ? `/api/serviceSec2/${id}` : '/api/serviceSec2';
      const method = isEditMode ? 'put' : 'post';

      await axios({ method, url, data, headers: { 'Content-Type': 'multipart/form-data' } });

      setMessage({ type: 'success', text: isEditMode ? 'Updated successfully!' : 'Created successfully!' });
      setTimeout(() => navigate('/serviceSec2-table'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        {isEditMode ? 'Edit Service Section 2' : 'Add Service Section 2'}
      </h2>

      {isLoadingCategories && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">Loading categories...</p>
        </div>
      )}

      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' :
          message.type === 'error' ? 'bg-red-100 text-red-700' :
            message.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
          }`}>
          {message.text}
        </div>
      )}

      {isEditMode && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 font-semibold">✏️ Edit Mode: Modifying existing data</p>
        </div>
      )}

      {!isFormReady && isEditMode ? (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded animate-pulse text-center">
          <p className="text-blue-800 font-medium italic">Initializing form with data...</p>
        </div>
      ) : (
        <div className="space-y-6" style={{ opacity: (loading && isEditMode) ? 0.5 : 1, pointerEvents: (loading && isEditMode) ? 'none' : 'auto' }}>

          {/* Level Selection */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Level {isEditMode && <span className="text-xs text-gray-500">(Locked in edit mode)</span>}
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleLevelChange('category')}
                disabled={isEditMode}
                className={`px-4 py-2 rounded font-medium transition ${selectedLevel === 'category'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Category
              </button>
              <button
                type="button"
                onClick={() => handleLevelChange('subcategory')}
                disabled={isEditMode}
                className={`px-4 py-2 rounded font-medium transition ${selectedLevel === 'subcategory'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Sub Category
              </button>
              <button
                type="button"
                onClick={() => handleLevelChange('subsubcategory')}
                disabled={isEditMode}
                className={`px-4 py-2 rounded font-medium transition ${selectedLevel === 'subsubcategory'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Sub-Sub Category
              </button>
            </div>
          </div>

          {/* Category Dropdowns */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={handleCategoryChange}
              disabled={isLoadingCategories}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.category}</option>
              ))}
            </select>
          </div>

          {(selectedLevel === 'subcategory' || selectedLevel === 'subsubcategory') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sub Category *
              </label>
              <select
                value={formData.subCategoryId}
                onChange={handleSubCategoryChange}
                disabled={!formData.categoryId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Sub Category</option>
                {subCategories.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.category}</option>
                ))}
              </select>
            </div>
          )}

          {selectedLevel === 'subsubcategory' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sub-Sub Category *
              </label>
              <select
                value={formData.subSubCategoryId}
                onChange={handleSubSubCategoryChange}
                disabled={!formData.subCategoryId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Sub-Sub Category</option>
                {subSubCategories.map(subsub => (
                  <option key={subsub._id} value={subsub._id}>{subsub.category}</option>
                ))}
              </select>
            </div>
          )}

          {/* Main Content Fields */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Content Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter heading"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subheading
                </label>
                <input
                  type="text"
                  value={formData.subheading}
                  onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subheading"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Details
                </label>
                <ReactQuill
                  value={formData.details}
                  onChange={(value) => setFormData({ ...formData, details: value })}
                  placeholder="Enter detailed description"
                  className="bg-white rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Service Cards</h3>
              <button
                type="button"
                onClick={addCard}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                + Add Card
              </button>
            </div>

            <div className="space-y-6">
              {formData.cards.map((card, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6 relative">
                  {formData.cards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCard(index)}
                      className="absolute top-4 right-4 text-red-600 hover:text-red-800 text-xl font-bold"
                    >
                      ×
                    </button>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Card Title *
                        </label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter card title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Sub Title
                        </label>
                        <input
                          type="text"
                          value={card.subTitle}
                          onChange={(e) => handleCardChange(index, 'subTitle', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter subtitle"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={card.description}
                        onChange={(e) => handleCardChange(index, 'description', e.target.value)}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Card Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCardPhotoChange(index, e.target.files[0])}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {card.currentPhoto && (
                        <div className="mt-2 text-center">
                          <p className="text-sm text-gray-500 mb-2">Current Image Preview:</p>
                          <img
                            src={`/api/image/download/${card.currentPhoto}`}
                            alt="Current"
                            className="h-32 mx-auto rounded-lg border-2 border-gray-200 shadow-sm object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={card.alt}
                          onChange={(e) => handleCardChange(index, 'alt', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter alt text"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Image Title
                        </label>
                        <input
                          type="text"
                          value={card.imgTitle}
                          onChange={(e) => handleCardChange(index, 'imgTitle', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter image title"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/serviceSec2-table')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !formData.categoryId}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Data' : 'Create Data'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSec2Form;
