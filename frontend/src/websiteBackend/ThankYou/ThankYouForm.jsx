import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Breadcrumb, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { 
  useGetThankYouQuery, 
  useUpdateThankYouMutation 
} from '../../slice/thankYou/thankYou';
import { useNavigate } from 'react-router-dom';

// Simple replacement for icon if import fails, using fontawesome as backup if available
const CustomUploadIcon = () => <i className="fa-solid fa-upload mr-2"></i>;

const ThankYouForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Page Heading States
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [photo, setPhoto] = useState('');
  const [alt, setAlt] = useState('');
  const [imgTitle, setImgTitle] = useState('');

  const { data: thankYouData, isLoading: isLoadingData } = useGetThankYouQuery();
  const [updateThankYou, { isLoading: isUpdating }] = useUpdateThankYouMutation();

  useEffect(() => {
    fetchHeadings();
  }, []);

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=thankyou', { withCredentials: true });
      if (response.data) {
        const { heading, subheading, photo, alt, imgTitle } = response.data;
        setHeading(heading || '');
        setSubheading(subheading || '');
        setPhoto(photo || '');
        setAlt(alt || '');
        setImgTitle(imgTitle || '');
      }
    } catch (error) {
      console.error('Failed to fetch headings:', error);
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
      await axios.put('/api/pageHeading/updateHeading?pageType=thankyou', formData, { withCredentials: true });
      message.success('Page heading updated successfully!');
    } catch (error) {
      console.error('Failed to update page heading:', error);
      message.error('Failed to update page heading');
    }
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  useEffect(() => {
    if (thankYouData) {
      form.setFieldsValue({
        alt: thankYouData.alt,
        description: thankYouData.description,
        btnTitle: thankYouData.btnTitle,
        btnLink: thankYouData.btnLink,
      });

      if (thankYouData.photo) {
        setFileList([{
          uid: '-1',
          name: 'Current Image',
          status: 'done',
          url: `/api/image/download/${thankYouData.photo}`,
        }]);
      }
    }
  }, [thankYouData, form]);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('alt', values.alt || '');
      formData.append('description', values.description || '');
      formData.append('btnTitle', values.btnTitle || '');
      formData.append('btnLink', values.btnLink || '');
      
      if (fileList[0]?.originFileObj) {
        formData.append('photo', fileList[0].originFileObj);
      }

      await updateThankYou(formData).unwrap();
      message.success('Thank You page content updated successfully');
    } catch (error) {
      message.error(error.data?.message || 'Failed to update Thank You page');
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      return false;
    },
    onChange: ({ fileList }) => setFileList(fileList),
    fileList,
  };

  if (isLoadingData) {
    return <Spin size="large" />;
  }

  return (
    <>
      <Breadcrumb
        items={[
          { title: <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>Dashboard</span> },
          { title: 'Thank You' },
        ]}
        className='mb-[1.5rem]'
      />
      
      {/* Page Heading Editor Section */}
      <div className="mb-8 border border-gray-200 shadow-lg p-6 rounded bg-white">
        <h3 className="text-lg font-semibold mb-6">Edit Page Heading (Breadcrumb)</h3>
        <div className="grid md:grid-cols-2 md:gap-6 grid-cols-1">
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-wider">Heading</label>
            <Input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g., Thank You"
              className="h-10"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-wider">Sub heading</label>
            <Input
              type="text"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="e.g., Success"
              className="h-10"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-wider">Alt Text</label>
            <Input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="SEO Alt Text"
              className="h-10"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-wider">Upload Hero Image</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
            {photo && (
              <div className="mt-2">
                <img
                  src={photo instanceof File ? URL.createObjectURL(photo) : `/api/image/download/${photo}`}
                  alt={alt}
                  className="w-32 h-20 object-cover rounded shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
        <Button
          onClick={saveHeadings}
          className="bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold px-6"
        >
          Save Heading
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Edit Main Section Content</h2>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Image"
            extra="Upload the main illustration for the Thank You page"
          >
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button icon={<CustomUploadIcon />}>
                Click to Upload
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="alt"
            label="Image Alt Text"
            rules={[{ required: true, message: 'Please input the alt text!' }]}
          >
            <Input placeholder="Describe the image for SEO" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter the message for your customers" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="btnTitle"
              label="Button Title"
              rules={[{ required: true, message: 'Please input the button title!' }]}
            >
              <Input placeholder="e.g., Return Home" />
            </Form.Item>

            <Form.Item
              name="btnLink"
              label="Button Link"
              rules={[{ required: true, message: 'Please input the button link!' }]}
            >
              <Input placeholder="e.g., /" />
            </Form.Item>
          </div>

          <Form.Item className="mt-8">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isUpdating}
              className="bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold px-8 h-10 rounded-md"
            >
              Update Content
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default ThankYouForm;
