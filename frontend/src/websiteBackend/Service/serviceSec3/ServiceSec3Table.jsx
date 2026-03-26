import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Eye, EyeOff, Search } from 'lucide-react';
import axios from 'axios';

const ServiceSec3Table = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterData();
  }, [data, searchTerm, filterLevel]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/services/getAll');
      const categoriesData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/serviceSec3/all');
      setData(response.data.data || []);
      setFilteredData(response.data.data || []);
      setMessage({ type: 'success', text: 'Data loaded successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const getItemLevel = (item) => {
    if (item.subSubCategoryId) {
      return 'subsubcategory';
    } else if (item.subCategoryId) {
      return 'subcategory';
    } else {
      return 'category';
    }
  };

  const filterData = () => {
    let filtered = [...data];

    if (filterLevel !== 'all') {
      filtered = filtered.filter(item => getItemLevel(item) === filterLevel);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subheading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryPath(item)?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const getCategoryPath = (item) => {
    if (!item.categoryId || typeof item.categoryId === 'string') {
      return 'Unknown';
    }

    const category = categories.find(cat => cat._id === item.categoryId?._id || cat._id === item.categoryId);
    if (!category) return 'Unknown';

    const level = getItemLevel(item);
    const parts = [];

    parts.push(category.category || 'Unknown');

    if (level === 'subcategory' || level === 'subsubcategory') {
      const subCatId = item.subCategoryId?._id || item.subCategoryId;
      const subCat = category.subCategories?.find(sub => sub._id === subCatId);
      parts.push(subCat?.category || 'Unknown');
    }

    if (level === 'subsubcategory') {
      const subCatId = item.subCategoryId?._id || item.subCategoryId;
      const subCat = category.subCategories?.find(sub => sub._id === subCatId);
      const subSubCatId = item.subSubCategoryId?._id || item.subSubCategoryId;
      const subSubCat = subCat?.subSubCategory?.find(subsub => subsub._id === subSubCatId);
      parts.push(subSubCat?.category || 'Unknown');
    }

    return parts.join(' → ');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/serviceSec3/${id}`);
      setMessage({ type: 'success', text: 'Deleted successfully' });
      fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete' });
    }
  };

  const handleEdit = (id) => {
    const itemToEdit = data.find(item => item._id === id);
    navigate(`/service-sec3-form/${id}`, { state: { itemData: itemToEdit } });
  };

  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'category':
        return 'bg-blue-100 text-blue-800';
      case 'subcategory':
        return 'bg-green-100 text-green-800';
      case 'subsubcategory':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    const stripped = stripHtml(text);
    return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Service Section 3 Data</h2>

          {message.text && (
            <div className={`mb-4 p-4 rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-700' :
              message.type === 'error' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by heading, subheading, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="category">Category</option>
              <option value="subcategory">Sub Category</option>
              <option value="subsubcategory">Sub-Sub Category</option>
            </select>

            <button
              onClick={() => navigate('/service-sec3-form')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
            >
              + Add New
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredData.length} of {data.length} items
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heading
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subheading
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cards
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No data found. {searchTerm || filterLevel !== 'all' ? 'Try adjusting your filters.' : 'Create your first entry using the form.'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const itemLevel = getItemLevel(item);
                  return (
                    <React.Fragment key={item._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{getCategoryPath(item)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeColor(itemLevel)}`}>
                            {itemLevel.charAt(0).toUpperCase() + itemLevel.slice(1).replace(/([A-Z])/g, ' $1')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {item.heading || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {item.subheading || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {item.cards?.length || 0} card(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => toggleRowExpansion(item._id)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              {expandedRows.has(item._id) ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(item._id)}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(item._id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row Details */}
                      {expandedRows.has(item._id) && (
                        <tr className="bg-gray-50">
                          <td colSpan="6" className="px-6 py-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-3">Full Details</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Heading:</p>
                                  <p className="text-sm text-gray-900 mt-1">{item.heading || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Subheading:</p>
                                  <p className="text-sm text-gray-900 mt-1">{item.subheading || '-'}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-sm font-medium text-gray-500">Details:</p>
                                  <div
                                    className="text-sm text-gray-900 mt-1"
                                    dangerouslySetInnerHTML={{ __html: item.details || '-' }}
                                  />
                                </div>
                              </div>

                              {/* Cards Section */}
                              {item.cards && item.cards.length > 0 && (
                                <div className="mt-6">
                                  <h5 className="font-semibold text-gray-900 mb-4">Cards ({item.cards.length})</h5>
                                  <div className="space-y-4">
                                    {item.cards.map((card, cardIndex) => (
                                      <div key={cardIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-sm font-medium text-gray-500">Title:</p>
                                            <p className="text-sm text-gray-900 mt-1">{card.title || '-'}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-gray-500">Sub Title:</p>
                                            <p className="text-sm text-gray-900 mt-1">{card.subTitle || '-'}</p>
                                          </div>
                                          <div className="md:col-span-2">
                                            <p className="text-sm font-medium text-gray-500">Description:</p>
                                            <p className="text-sm text-gray-900 mt-1">{card.description || '-'}</p>
                                          </div>
                                          {card.photo && (
                                            <div className="md:col-span-2">
                                              <p className="text-sm font-medium text-gray-500 mb-2">Image:</p>
                                              <img
                                                src={`/api/image/download/${card.photo}`}
                                                alt={card.alt || 'Card image'}
                                                className="max-w-xs h-auto rounded-lg border border-gray-300"
                                                onError={(e) => {
                                                  e.target.style.display = 'none';
                                                  e.target.nextSibling.style.display = 'block';
                                                }}
                                              />
                                              <p className="text-sm text-red-500 hidden">Image failed to load</p>
                                            </div>
                                          )}
                                          <div>
                                            <p className="text-sm font-medium text-gray-500">Alt Text:</p>
                                            <p className="text-sm text-gray-900 mt-1">{card.alt || '-'}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-gray-500">Image Title:</p>
                                            <p className="text-sm text-gray-900 mt-1">{card.imgTitle || '-'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this entry? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSec3Table;
