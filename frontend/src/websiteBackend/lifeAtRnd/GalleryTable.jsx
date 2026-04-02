import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Breadcrumb, Tag, Input } from 'antd';
import { PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useGetAllGalleryItemsQuery, useDeleteGalleryItemMutation } from '../../slice/lifeAtRnd/lifeAtRndGallery';
import { useGetAllCategoriesQuery, useDeleteCategoryMutation } from '../../slice/lifeAtRnd/lifeAtRndCategory';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const GalleryTable = () => {
  const navigate = useNavigate();
  const PAGE_TYPE = 'lifeat-rnd'; // Define the pageType for headings
  
  const { data: galleryData, isLoading: isLoadingGallery, refetch: refetchGallery } = useGetAllGalleryItemsQuery();
  const { data: categoryData, isLoading: isLoadingCats } = useGetAllCategoriesQuery();
  
  const [deleteGalleryItem] = useDeleteGalleryItemMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  // Page Heading States
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [photo, setPhoto] = useState('');
  const [alt, setAlt] = useState('');
  const [imgTitle, setImgTitle] = useState('');
  const [loadingHeadings, setLoadingHeadings] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch headings on component mount
  useEffect(() => {
    fetchHeadings();
  }, []);

  const fetchHeadings = async () => {
    setLoadingHeadings(true);
    try {
      const response = await axios.get(`/api/pageHeading/heading?pageType=${PAGE_TYPE}`, {
        withCredentials: true,
      });
      const { 
        heading: h = '', 
        subheading: s = '', 
        photo: p = '', 
        alt: a = '',
        imgTitle: it = '' 
      } = response.data || {};
      
      setHeading(h);
      setSubheading(s);
      setPhoto(p);
      setAlt(a);
      setImgTitle(it);
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to fetch headings:', err);
    } finally {
      setLoadingHeadings(false);
    }
  };

  const saveHeadings = async () => {
    setLoadingHeadings(true);
    const formData = new FormData();
    formData.append('pageType', PAGE_TYPE);
    formData.append('heading', heading);
    formData.append('subheading', subheading);
    formData.append('alt', alt);
    formData.append('imgTitle', imgTitle);
    
    if (photo instanceof File) {
      formData.append('photo', photo);
    }

    try {
      await axios.put(`/api/pageHeading/updateHeading?pageType=${PAGE_TYPE}`, formData, { 
        withCredentials: true 
      });
      message.success('Page headings saved successfully!');
      await fetchHeadings();
    } catch (err) {
      console.error('Failed to save headings:', err);
      message.error('Failed to save headings');
    } finally {
      setLoadingHeadings(false);
    }
  };

  const markChanged = () => setHasChanges(true);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      markChanged();
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category and all its settings?')) return;
    try {
      await deleteCategory(id).unwrap();
      message.success('Category deleted successfully');
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  // Group gallery items by category for cleaner display
  const groupedData = React.useMemo(() => {
    if (!galleryData || !categoryData) return [];
    
    return categoryData.map(category => {
      const items = galleryData.filter(item => 
        (item.category_id?._id || item.category_id) === category._id
      );
      return {
        ...category,
        key: category._id,
        imageCount: items.length,
        items: items
      };
    }).filter(cat => cat.imageCount > 0); 
  }, [galleryData, categoryData]);

  const mainColumns = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      render: (text, record) => (
        <div>
          <span className="text-gray-700 font-normal">{text}</span>
          <p className="text-[11px] text-gray-400 font-normal mt-0.5">{record.title || 'No Heading'} | {record.subtitle || 'No Subtitle'}</p>
        </div>
      )
    },
    {
      title: 'Number of Images',
      dataIndex: 'imageCount',
      key: 'imageCount',
      width: '20%',
      render: (count) => <Tag color="#ffd333" className="px-3 rounded-full font-normal">{count} Photos</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '20%',
      render: (status) => (
        <Tag color={status ? 'green' : 'orange'} className="font-normal">
          {status ? 'Published' : 'Draft'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Space size="middle">
          <FaEdit 
            className="text-green-500 cursor-pointer text-lg hover:text-green-700"
            onClick={() => navigate(`/life-at-rnd/add-gallery?categoryId=${record._id}`)}
          />
          <FaTrashAlt 
            className="text-red-500 cursor-pointer text-lg hover:text-red-700"
            onClick={() => handleDeleteCategory(record._id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="bg-white min-h-screen pb-12">
      <Breadcrumb className='px-6 py-6'>
        <Breadcrumb.Item>
          <Link to="/dashboard" className="text-gray-400">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item className="text-gray-800">Life at RND Banner & Gallery</Breadcrumb.Item>
      </Breadcrumb>
      
      {/* Edit Page Heading - Perfectly Matched to About Us style */}
      <div className="px-6 mb-10">
        <div className="mb-8 border border-gray-200 shadow-lg p-6 rounded">
          <h3 className="text-lg font-semibold mb-6 text-gray-700">Edit Page Heading</h3>
          <div className="grid md:grid-cols-2 md:gap-x-12 grid-cols-1">
            {/* Heading */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2 uppercase font-serif text-sm">Heading</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => { setHeading(e.target.value); markChanged(); }}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-yellow-400 transition duration-300 text-sm"
                placeholder="Enter page heading..."
              />
            </div>

            {/* Subheading */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2 uppercase font-serif text-sm">Sub heading</label>
              <input
                type="text"
                value={subheading}
                onChange={(e) => { setSubheading(e.target.value); markChanged(); }}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-yellow-400 transition duration-300 text-sm"
                placeholder="Enter sub heading..."
              />
            </div>

            {/* Upload Image */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2 uppercase font-serif text-sm">Upload Image</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-yellow-400 transition duration-300 text-sm"
              />
              <div className="mt-4">
                {photo ? (
                  <img
                    src={photo instanceof File 
                      ? URL.createObjectURL(photo) 
                      : `https://rndtechnosoft.com/api/logo/download/${photo}`
                    }
                    alt={alt || "Heading Preview"}
                    className="w-32 h-32 object-cover rounded shadow-sm border border-gray-200 bg-gray-50"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded text-gray-400 text-[10px] text-center px-4 uppercase font-serif">
                    No GIF / Image Preview
                  </div>
                )}
              </div>
            </div>

            {/* Alt Text */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2 uppercase font-serif text-sm">Alt Text</label>
              <input
                type="text"
                value={alt}
                onChange={(e) => { setAlt(e.target.value); markChanged(); }}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-yellow-400 transition duration-300 text-sm"
                placeholder="Enter alt text..."
              />
            </div>

            {/* Image Title */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2 uppercase font-serif text-sm">Image Title</label>
              <input
                type="text"
                value={imgTitle}
                onChange={(e) => { setImgTitle(e.target.value); markChanged(); }}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-yellow-400 transition duration-300 text-sm"
                placeholder="Enter image title..."
              />
            </div>
          </div>

          <button
            onClick={saveHeadings}
            disabled={!hasChanges && !loadingHeadings}
            className={`px-6 py-2 rounded transition duration-300 font-serif shadow-sm ${
              hasChanges 
                ? 'bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loadingHeadings ? 'Saving' : 'Save Headings'}
          </button>
        </div>
      </div>

      <div className='px-6 py-4 flex justify-between items-center bg-white border-y border-gray-100 mb-6'>
        <div className='flex flex-col'>
          <h1 className="text-2xl text-[#1a1a1a] tracking-tight font-normal font-serif">Gallery Management</h1>   
        </div>
        <div>
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/life-at-rnd/add-gallery')}
            className='hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none py-5 px-6 rounded-lg flex items-center shadow-md shadow-yellow-200/50 font-semibold'
            style={{ backgroundColor: '#ffd333', color: '#1a1a1a' }}
          >
            Add New Images
          </Button>
        </div>
      </div>

      <div className="px-6">
        <Table 
          columns={mainColumns} 
          dataSource={groupedData} 
          loading={isLoadingGallery || isLoadingCats}
          rowKey="key"
          className="border border-gray-100 rounded overflow-hidden bg-white"
          pagination={{ pageSize: 15 }}
        />
      </div>
    </div>
  );
};

export default GalleryTable;
