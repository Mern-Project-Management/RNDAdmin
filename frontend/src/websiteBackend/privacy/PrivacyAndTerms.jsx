import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, message, Breadcrumb } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const PrivacyForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExistingData, setIsExistingData] = useState(false);
  const [privacyId, setPrivacyId] = useState(null);
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [photo, setPhoto] = useState('');
  const [alt, setAlt] = useState('');
  const [imgTitle, setImgTitle] = useState('');

  // Quill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [
          { list: 'ordered' },
          { list: 'bullet' },
          { indent: '-1' },
          { indent: '+1' },
        ],
        ['link', 'image', 'video'],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  // Quill formats
  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'align',
    'color',
    'background',
  ];

  useEffect(() => {
    const fetchPrivacyData = async () => {
      try {
        const response = await axios.get('/api/privacy');
        if (response.data.length > 0) {
          const privacyData = response.data[0];
          setPrivacyPolicy(privacyData.privacyPolicy);
          setPrivacyId(privacyData._id);
          form.setFieldsValue({
            privacyPolicy: privacyData.privacyPolicy,
          });
          setIsExistingData(true);
        }
      } catch (error) {
        message.error('Failed to fetch privacy data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacyData();
    fetchHeadings();
  }, []);

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=privacy-policy');
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

  const handleEditorChange = (content) => {
    // Guard: ReactQuill fires onChange with empty string on initial mount
    // Don't overwrite already-loaded DB content with an empty reset
    if (!content || content === '<p><br></p>') {
      if (privacyPolicy && privacyPolicy !== '<p><br></p>') {
        return; // Ignore the empty reset, keep DB content
      }
    }
    setPrivacyPolicy(content);
    form.setFieldsValue({ privacyPolicy: content });
  };

  const handleFinish = async () => {
    try {
      // Use form field value as source of truth (most reliable after edits)
      const currentContent = form.getFieldValue('privacyPolicy') || privacyPolicy;
      const dataToSend = { privacyPolicy: currentContent };

      if (!currentContent || currentContent.replace(/<[^>]*>/g, '').trim() === '') {
        message.error('Privacy policy content cannot be empty');
        return;
      }

      if (isExistingData) {
        await axios.put(`/api/privacy/${privacyId}`, dataToSend);
        message.success('Privacy data updated successfully');
      } else {
        await axios.post('/api/privacy/add', dataToSend);
        message.success('Privacy data created successfully');
      }
      navigate('/privacypolicy-terms');
    } catch (error) {
      message.error('Failed to save privacy data');
      console.error('Error:', error);
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
      await axios.put('/api/pageHeading/updateHeading?pageType=privacy-policy', formData, { withCredentials: true });
      message.success('Page heading updated successfully!');
    } catch (error) {
      console.error('Failed to update page heading:', error);
      message.error('Failed to update page heading');
    }
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };


  return (
    <>
      <Breadcrumb className='mb-4'>
        <Breadcrumb.Item>
          <Link to="/dashboard">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Privacy Form</Breadcrumb.Item>
      </Breadcrumb>
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
          className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-900 transition duration-300 font-serif"
        >
          Save Headings
        </button>
      </div>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="privacyPolicy"
          label="Privacy Policy"
          rules={[
            {
              required: true,
              message: 'Please enter the privacy policy'
            },
            {
              validator: (_, value) => {
                // Check if content is empty (Quill returns '<p><br></p>' for empty content)
                const textContent = value?.replace(/<[^>]*>/g, '').trim();
                if (!textContent || textContent === '') {
                  return Promise.reject('Please enter the privacy policy');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <ReactQuill
            theme="snow"
            value={privacyPolicy}
            onChange={handleEditorChange}
            modules={modules}
            formats={formats}
            placeholder="Start typing your privacy policy..."
            style={{ height: '400px', marginBottom: '50px' }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} disabled={isLoading}>
            {isExistingData ? 'Update' : 'Save'}
          </Button>
          {isLoading && <span className="ml-3 text-gray-500 text-sm">Loading data...</span>}
        </Form.Item>
      </Form>
    </>
  );
};

export default PrivacyForm;