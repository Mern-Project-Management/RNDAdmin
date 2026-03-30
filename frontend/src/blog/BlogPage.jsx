import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, Typography, Image, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import {
  useGetAllBlogsQuery,
  useDeleteBlogMutation,
} from '@/slice/blog/blog';
import axios from 'axios';

const { Text } = Typography;

const BlogTable = () => {
  const { data: blogs = [], error, isLoading, refetch } = useGetAllBlogsQuery();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const navigate = useNavigate();

  // State for expandable details
  const [expandedRows, setExpandedRows] = useState({});

  // State for page headings (current editable values)
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [headingPhoto, setHeadingPhoto] = useState('');
  const [alt, setAlt] = useState('');
  const [imgTitle, setImgTitle] = useState('');

  // State for original fetched values (to detect changes)
  const [originalHeading, setOriginalHeading] = useState('');
  const [originalSubheading, setOriginalSubheading] = useState('');
  const [originalAlt, setOriginalAlt] = useState('');
  const [originalImgTitle, setOriginalImgTitle] = useState('');

  // Loading state for heading operations
  const [loadingHeadings, setLoadingHeadings] = useState(false);

  // Fetch headings on component mount
  useEffect(() => {
    fetchHeadings();
  }, []);

  const fetchHeadings = async () => {
    setLoadingHeadings(true);
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=blogtitle', {
        withCredentials: true,
      });
      const { heading: fetchedHeading = '', subheading: fetchedSubheading = '', photo: fetchedPhoto = '', alt: fetchedAlt = '', imgTitle: fetchedImgTitle = '' } = response.data || {};

      setHeading(fetchedHeading);
      setSubheading(fetchedSubheading);
      setHeadingPhoto(fetchedPhoto);
      setAlt(fetchedAlt);
      setImgTitle(fetchedImgTitle);

      setOriginalHeading(fetchedHeading);
      setOriginalSubheading(fetchedSubheading);
      setOriginalAlt(fetchedAlt);
      setOriginalImgTitle(fetchedImgTitle);
    } catch (err) {
      console.error('Failed to fetch headings:', err);
      message.error('Failed to load page headings');
    } finally {
      setLoadingHeadings(false);
    }
  };

  const saveHeadings = async () => {
    setLoadingHeadings(true);
    const formData = new FormData();
    formData.append('pageType', 'blogtitle');
    formData.append('heading', heading);
    formData.append('subheading', subheading);
    formData.append('alt', alt);
    formData.append('imgTitle', imgTitle);
    if (headingPhoto instanceof File) {
      formData.append('photo', headingPhoto);
    }

    try {
      await axios.put(
        '/api/pageHeading/updateHeading?pageType=blogtitle',
        formData,
        { withCredentials: true }
      );

      message.success('Headings saved successfully!');
      await fetchHeadings();
    } catch (err) {
      console.error('Failed to save headings:', err);
      message.error('Failed to save headings');
    } finally {
      setLoadingHeadings(false);
    }
  };

  // Detect if there are unsaved changes
  const hasChanges = heading !== originalHeading || subheading !== originalSubheading || alt !== originalAlt || imgTitle !== originalImgTitle || (headingPhoto instanceof File);

  const handleHeadingFileChange = (e) => {
    const file = e.target.files[0];
    setHeadingPhoto(file);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBlog(id).unwrap();
      message.success('Blog deleted successfully');
      refetch();
    } catch (err) {
      console.error('Failed to delete blog:', err);
      message.error('Failed to delete blog');
    }
  };

  const toggleDetails = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (text, record) => (
        <div>
          <div
            className={`relative overflow-hidden transition-all duration-300 ${expandedRows[record._id] ? 'max-h-none' : 'max-h-20'
              }`}
            dangerouslySetInnerHTML={{ __html: text }}
          />
          {text && text.length > 100 && (
            <Button
              type="link"
              onClick={() => toggleDetails(record._id)}
              size="small"
              className="p-0 mt-1"
            >
              {expandedRows[record._id] ? 'Show Less' : 'Read More'}
            </Button>
          )}
        </div>
      ),
    },
    {
      title: 'Images',
      dataIndex: 'image',
      key: 'image',
      width: 150,
      render: (images) =>
        images && images.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {images.map((img, index) => (
              <Image
                key={index}
                src={`/api/image/download/${img}`}
                alt={`Blog Image ${index + 1}`}
                width={60}
                height={60}
                className="object-cover border-2 border-gray-300 rounded"
                preview={{ src: `/api/image/download/${img}` }}
              />
            ))}
          </div>
        ) : (
          <Text type="secondary">No Image</Text>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex space-x-4">
          <FaEdit
            className="text-green-500 cursor-pointer text-lg hover:text-green-700 transition"
            onClick={() => navigate(`/edit-blog-form/${record._id}`)}
          />
          <Popconfirm
            title="Are you sure you want to delete this blog?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            disabled={isDeleting}
          >
            <FaTrashAlt 
              className={`text-red-500 cursor-pointer text-lg hover:text-red-700 transition ${isDeleting ? 'opacity-50' : ''}`}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (isLoading) return <div className="p-8 text-center">Loading blogs...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error loading blogs</div>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Blogs</h2>
        <Link to="/blog-form">
          <Button icon={<PlusOutlined />} className="bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold">
            Add Blog
          </Button>
        </Link>
      </div>

      {/* Page Heading Editor */}
      <div className="border border-gray-300 shadow-lg rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">Edit Page Headings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2 uppercase tracking-wider">
              Heading
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              disabled={loadingHeadings}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter main heading"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2 uppercase tracking-wider">
              Subheading
            </label>
            <input
              type="text"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              disabled={loadingHeadings}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subheading"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2 uppercase tracking-wider">
              Upload Image
            </label>
            <input
              type="file"
              onChange={handleHeadingFileChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {headingPhoto && (
              <div className="mt-2">
                <img
                  src={headingPhoto instanceof File ? URL.createObjectURL(headingPhoto) : `/api/logo/download/${headingPhoto}`}
                  alt={alt}
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2 uppercase tracking-wider">
              Alt Text
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              disabled={loadingHeadings}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter alt text"
            />
          </div>

        </div>

        <div className="mt-6 flex items-center gap-4">
          <Button
            onClick={saveHeadings}
            type="primary"
            loading={loadingHeadings}
            disabled={!hasChanges || loadingHeadings}
          >
            {loadingHeadings ? 'Saving...' : 'Save Headings'}
          </Button>

          {!hasChanges && !loadingHeadings && (
            <span className="text-gray-500 text-sm">
              No changes to save
            </span>
          )}
        </div>
      </div>

      {/* Blogs Table */}
      <Table
        columns={columns}
        dataSource={blogs}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default BlogTable;
