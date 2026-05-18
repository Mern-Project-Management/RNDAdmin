import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Eye, EyeOff, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ServiceSec1Table = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('all');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterData();
    }, [data, searchTerm, filterLevel]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/services/getAll');
            const result = await response.json();
            const categoriesData = Array.isArray(result) ? result : (result.data || []);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/servicesec1');
            const result = await response.json();

            if (result.success) {
                setData(result.data);
                setFilteredData(result.data);
            }
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

        // Filter by level
        if (filterLevel !== 'all') {
            filtered = filtered.filter(item => getItemLevel(item) === filterLevel);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.subheading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                getCategoryName(item)?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredData(filtered);
    };

    const getCategoryName = (item) => {
        if (!item.categoryId || typeof item.categoryId === 'string') {
            return 'Unknown';
        }

        const category = categories.find(cat => cat._id === item.categoryId?._id || cat._id === item.categoryId);
        if (!category) return 'Unknown';

        const level = getItemLevel(item);

        if (level === 'category') {
            return category.category || 'Unknown';
        } else if (level === 'subcategory') {
            const subCatId = item.subCategoryId?._id || item.subCategoryId;
            const subCat = category.subCategories?.find(sub => sub._id === subCatId) || item.subCategory;
            return `${category.category || 'Unknown'} → ${subCat?.category || subCat?.category || 'Unknown'}`;
        } else if (level === 'subsubcategory') {
            const subCatId = item.subCategoryId?._id || item.subCategoryId;
            const subCat = category.subCategories?.find(sub => sub._id === subCatId) || item.subCategory;
            const subSubCatId = item.subSubCategoryId?._id || item.subSubCategoryId;
            const subSubCat = subCat?.subSubCategory?.find(subsub => subsub._id === subSubCatId);
            return `${category.category || 'Unknown'} → ${subCat?.category || 'Unknown'} → ${subSubCat?.category || 'Unknown'}`;
        }
        return 'Unknown';
    };

    const handleDelete = async (item) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            let queryParams = `categoryId=${item.categoryId?._id || item.categoryId}`;
            if (item.subCategoryId) {
                queryParams += `&subCategoryId=${item.subCategoryId?._id || item.subCategoryId}`;
            }
            if (item.subSubCategoryId) {
                queryParams += `&subSubCategoryId=${item.subSubCategoryId?._id || item.subSubCategoryId}`;
            }

            const response = await fetch(`/api/servicesec1?${queryParams}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ type: 'success', text: 'Data deleted successfully' });
                fetchData();
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to delete' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error deleting data' });
        }
    };

    const handleEdit = (item) => {
        navigate(`/edit-serviceSec1/${item._id}`);
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
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Service Section 1 Data</h2>

                    {message.text && (
                        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
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

                        <Link
                            to="/serviceSec1-form"
                         
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                        >
                           Add ServiceSec1
                        </Link>
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
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No data found. Create your first entry using the form.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => {
                                    const itemLevel = getItemLevel(item);
                                    return (
                                        <React.Fragment key={item._id}>
                                            <tr className="hover:bg-gray-50">
                                                
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{getCategoryName(item)}</div>
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
                                                            onClick={() => handleEdit(item)}
                                                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item)}
                                                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRows.has(item._id) && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan="6" className="px-6 py-4">
                                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                            <h4 className="font-semibold text-gray-900 mb-3">Full Details</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                                        dangerouslySetInnerHTML={{ __html: item.details }}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-500">Photo URL:</p>
                                                                    <p className="text-sm text-gray-900 mt-1 break-all">{item.photo || '-'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-500">Alt Text:</p>
                                                                    <p className="text-sm text-gray-900 mt-1">{item.alt || '-'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-500">Image Title:</p>
                                                                    <p className="text-sm text-gray-900 mt-1">{item.imgTitle || '-'}</p>
                                                                </div>
                                                                {item.photo && (
                                                                    <div className="md:col-span-2">
                                                                        <p className="text-sm font-medium text-gray-500 mb-2">Image Preview:</p>
                                                                        <img
                                                                            src={`/api/image/download/${item.photo.startsWith('uploads/') ? '' : 'uploads/images/'}${item.photo}`}
                                                                            alt={item.alt || 'Preview'}
                                                                            className="max-w-xs h-auto rounded-lg border border-gray-300"
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                                e.target.nextSibling.style.display = 'block';
                                                                            }}
                                                                        />
                                                                        <p className="text-sm text-red-500 hidden">Image failed to load</p>
                                                                    </div>
                                                                )}
                                                            </div>
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
        </div>
    );
};

export default ServiceSec1Table;
