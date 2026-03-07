import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';


// Define modules
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }], // This adds left, center, right, justify alignment
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean'] // Remove formatting
  ]
};

// Define formats
const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'list', 'bullet', 'indent',
  'align', // Include align in formats
  'blockquote', 'code-block',
  'link', 'image', 'video'
];


const ServiceSec1Form = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    categoryId: '',
    subCategoryId: '',
    subSubCategoryId: '',
    heading: '',
    subheading: '',
    details: '',
    photo: '',
    alt: '',
    imgTitle: ''
  });

  const [selectedLevel, setSelectedLevel] = useState('category');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchCategories();

    if (id) {
      setIsEditMode(true);
      fetchDataById(id);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode && categories.length > 0 && formData.categoryId) {
      loadSubCategoriesForEdit(formData);
    }
  }, [categories, isEditMode]);

  // Set image preview when photo URL is loaded in edit mode
  useEffect(() => {
    if (isEditMode && formData.photo && !selectedFile) {
      setImagePreview(`/api/image/download/${formData.photo}`);
    }
  }, [formData.photo, isEditMode, selectedFile]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetch('/api/services/getAll');
      const data = await response.json();
      const categoriesData = Array.isArray(data) ? data : (data.data || []);
      setCategories(categoriesData);
      setMessage({ type: 'success', text: 'Categories loaded successfully' });
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchDataById = async (dataId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/servicesec1/${dataId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const fetchedData = data.data;

        // Handle nested category objects from API response
        const categoryId = (fetchedData.categoryId && typeof fetchedData.categoryId === 'object' ? fetchedData.categoryId._id : fetchedData.categoryId) || '';
        const subCategoryId = (fetchedData.subCategoryId && typeof fetchedData.subCategoryId === 'object' ? fetchedData.subCategoryId._id : fetchedData.subCategoryId) || '';
        const subSubCategoryId = (fetchedData.subSubCategoryId && typeof fetchedData.subSubCategoryId === 'object' ? fetchedData.subSubCategoryId._id : fetchedData.subSubCategoryId) || '';

        setFormData({
          categoryId,
          subCategoryId,
          subSubCategoryId,
          heading: fetchedData.heading || '',
          subheading: fetchedData.subheading || '',
          details: fetchedData.details || '',
          photo: fetchedData.photo || '',
          alt: fetchedData.alt || '',
          imgTitle: fetchedData.imgTitle || ''
        });

        if (subSubCategoryId) {
          setSelectedLevel('subsubcategory');
        } else if (subCategoryId) {
          setSelectedLevel('subcategory');
        } else {
          setSelectedLevel('category');
        }

        setMessage({ type: 'info', text: 'Data loaded for editing' });
      } else {
        setMessage({ type: 'error', text: 'Data not found' });
        setTimeout(() => navigate('/serviceSec1-table'), 2000);
      }
    } catch (error) {
      console.error('Error fetching data by ID:', error);
      setMessage({ type: 'error', text: 'Error loading data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadSubCategoriesForEdit = (data) => {
    if (data.categoryId) {
      const category = categories.find(cat => String(cat._id) === String(data.categoryId));
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

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(cat => String(cat._id) === String(categoryId));

    setFormData({
      ...formData,
      categoryId,
      subCategoryId: '',
      subSubCategoryId: '',
      heading: isEditMode ? formData.heading : '',
      subheading: isEditMode ? formData.subheading : '',
      details: isEditMode ? formData.details : '',
      photo: isEditMode ? formData.photo : '',
      alt: isEditMode ? formData.alt : '',
      imgTitle: isEditMode ? formData.imgTitle : ''
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
      heading: isEditMode ? formData.heading : '',
      subheading: isEditMode ? formData.subheading : '',
      details: isEditMode ? formData.details : '',
      photo: isEditMode ? formData.photo : '',
      alt: isEditMode ? formData.alt : '',
      imgTitle: isEditMode ? formData.imgTitle : ''
    });

    setSubSubCategories(selectedSubCategory?.subSubCategory || []);
  };

  const handleSubSubCategoryChange = (e) => {
    setFormData({
      ...formData,
      subSubCategoryId: e.target.value,
      heading: isEditMode ? formData.heading : '',
      subheading: isEditMode ? formData.subheading : '',
      details: isEditMode ? formData.details : '',
      photo: isEditMode ? formData.photo : '',
      alt: isEditMode ? formData.alt : '',
      imgTitle: isEditMode ? formData.imgTitle : ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL for the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Store filename in formData
      setFormData(prev => ({
        ...prev,
        photo: file.name
      }));
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      photo: ''
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const submitData = {
        categoryId: formData.categoryId,
        heading: formData.heading,
        subheading: formData.subheading,
        details: formData.details,
        photo: formData.photo,
        alt: formData.alt,
        imgTitle: formData.imgTitle
      };

      if (selectedLevel === 'subcategory' && formData.subCategoryId) {
        submitData.subCategoryId = formData.subCategoryId;
      } else if (selectedLevel === 'subsubcategory' && formData.subSubCategoryId) {
        submitData.subCategoryId = formData.subCategoryId;
        submitData.subSubCategoryId = formData.subSubCategoryId;
      }

      const url = id ? `/api/servicesec1/${id}` : '/api/servicesec1';

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: id ? 'Data updated successfully!' : 'Data created successfully!'
        });

        setTimeout(() => {
          navigate('/serviceSec1-table');
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving data: ' + error.message });
    } finally {
      setLoading(false);
    }
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
      photo: '',
      alt: '',
      imgTitle: ''
    });
    setSelectedFile(null);
    setImagePreview('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        {isEditMode ? 'Edit Service Section 1' : 'Add Service Section 1'}
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

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Level {isEditMode && <span className="text-xs text-gray-500">(Locked in edit mode)</span>}
          </label>
          <div className="flex gap-4">
            <button
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

        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Content Information</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Heading
              </label>
              <input
                type="text"
                name="heading"
                value={formData.heading}
                onChange={handleInputChange}
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
                name="subheading"
                value={formData.subheading}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter subheading"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Details
              </label>
              <ReactQuill
                theme='snow'
                value={formData.details}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    details: value,
                  }))
                }
                modules={modules}
                formats={formats}
                placeholder="Enter detailed description"
                className="bg-white rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Photo Upload
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isEditMode && formData.photo && !selectedFile && (
                <p className="text-sm text-gray-500 mt-1">Current file: {formData.photo}</p>
              )}

              {imagePreview && (
                <div className="mt-4 relative">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Image Preview:</p>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-sm max-h-64 rounded-lg border-2 border-gray-300 shadow-md object-contain"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
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
                  name="alt"
                  value={formData.alt}
                  onChange={handleInputChange}
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
                  name="imgTitle"
                  value={formData.imgTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter image title"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={() => navigate('/serviceSec1-table')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.categoryId}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Saving...' : id ? 'Update Data' : 'Create Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSec1Form;