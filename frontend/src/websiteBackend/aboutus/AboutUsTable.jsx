import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetAboutUsQuery, useDeleteAboutUsMutation } from '../../slice/aboutUs/aboutUs';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AboutUsTable = () => {
  const navigate = useNavigate();
  const { data: aboutUsData, isLoading } = useGetAboutUsQuery();
  const [deleteAboutUs] = useDeleteAboutUsMutation();

  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [photo, setPhoto] = useState('');
  const [alt, setAlt] = useState('');
  const [imgTitle, setImgTitle] = useState('');

  useEffect(() => {
    fetchHeadings();
  }, []);

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=aboutus', { withCredentials: true });
      const { heading, subheading, photo, alt, imgTitle } = response.data;
      setHeading(heading || '');
      setSubheading(subheading || '');
      setPhoto(photo || '');
      setAlt(alt || '');
      setImgTitle(imgTitle || '');
    } catch (error) {
      console.error('Failed to fetch headings:', error);
      message.error('Failed to load page headings');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAboutUs(id);
      message.success('About Us entry deleted successfully');
    } catch (error) {
      message.error('Failed to delete About Us entry');
    }
  };

  const saveHeadings = async () => {
    const formData = new FormData();
    formData.append("heading", heading);
    formData.append("subheading", subheading);
    formData.append("alt", alt);
    formData.append("imgTitle", imgTitle);
    if (photo instanceof File) {
      formData.append("photo", photo);
    }
    try {
      await axios.put('/api/pageHeading/updateHeading?pageType=aboutus', formData, { withCredentials: true });
      message.success('Page heading updated successfully!');
    } catch (error) {
      console.error('Failed to update page heading:', error);
      message.error('Failed to update page heading');
    }
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '10%',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: '10%',
    },
    {
      title: 'Short Description',
      dataIndex: 'shortDescription',
      key: 'shortDescription',
      ellipsis: true,
      width: '40%',
      render: (shortDescription) => (
        <div dangerouslySetInnerHTML={{ __html: shortDescription }} />
      ),
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: '15%',
      render: (image) => (
        <img
          src={`/api/image/download/${image}`}
          alt="About Us"
          className='w-[100px] h-[50px] object-cover'
        />
      ),
    },

    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Space size="middle">
          <EditOutlined
            className="text-green-500 cursor-pointer text-lg hover:text-green-700 transition-colors"
            onClick={() => navigate(`/edit-about-us-form/${record._id}`)}
            title="Edit"
          />
          <DeleteOutlined
            className="text-red-500 cursor-pointer text-lg hover:text-red-700 transition-colors"
            onClick={() => handleDelete(record._id)}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 border border-gray-200 shadow-lg p-4 rounded ">
        <h3 className="text-lg font-semibold mb-4">Edit Page Heading</h3>
        <div className="grid md:grid-cols-2 md:gap-6 grid-cols-1">
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">Heading</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">Sub heading</label>
            <input
              type="text"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">Upload Image</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
            {photo && (
              <div className="mt-2">
                <img
                  src={photo instanceof File ? URL.createObjectURL(photo) : `/api/logo/download/${photo}`}
                  alt={alt}
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">Alt Text</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>

        </div>
        <button
          onClick={saveHeadings}
          className="px-4 py-2 bg-[#ffd333] text-[#1a1a1a] rounded hover:bg-[#edc32f] transition duration-300 font-serif"
        >
          Save Headings
        </button>
      </div>
      <div className='flex justify-between p-6 items-center'>
        <div className='text-2xl font-bold'>
          <h1>About Us</h1>
        </div>
        <div>
          <Button
            icon={<PlusOutlined />}
            onClick={() => navigate('/about-us-form')}
            className='mb-4 bg-[#ffd333] text-[#1a1a1a] hover:!bg-[#edc32f] hover:!text-[#1a1a1a] border-none font-semibold flex items-center gap-1 h-10'
          >
            Add About Us
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={aboutUsData}
        loading={isLoading}
        rowKey="_id"
        pagination={false}
      />
    </div>
  );
};

export default AboutUsTable;

