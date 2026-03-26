import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, message, Breadcrumb } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const CookiesForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [cookiesPolicy, setCookiesPolicy] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExistingData, setIsExistingData] = useState(false);
  const [cookiesId, setCookiesId] = useState(null);
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
    const fetchCookiesData = async () => {
      try {
        const response = await axios.get('/api/cookies');
        if (response.data.length > 0) {
          const cookiesData = response.data[0]; // Assuming API returns { _id, CookiesPolicy }
          setCookiesPolicy(cookiesData.CookiesPolicy); // State for ReactQuill
          setCookiesId(cookiesData._id);
          form.setFieldsValue({ // Set antd form field value
            cookiesPolicy: cookiesData.CookiesPolicy,
          });
          setIsExistingData(true);
        }
      } catch (error) {
        message.error('Failed to fetch cookies data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCookiesData();
    fetchHeadings();
  }, [form]);

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=cookies-policy');
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
    setCookiesPolicy(content);
    // Update form field value to trigger validation
    form.setFieldsValue({ cookiesPolicy: content });
  };

  const handleFinish = async () => {
    try {
      const dataToSend = { CookiesPolicy: cookiesPolicy }; // API expects 'CookiesPolicy'

      if (isExistingData) {
        await axios.put(`/api/cookies/${cookiesId}`, dataToSend);
        message.success('Cookies data updated successfully');
      } else {
        await axios.post('/api/cookies', dataToSend);
        message.success('Cookies data created successfully');
      }

    } catch (error) {
      message.error('Failed to save cookies data');
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
      await axios.put('/api/pageHeading/updateHeading?pageType=cookies-policy', formData, { withCredentials: true });
      message.success('Page heading updated successfully!');
    } catch (error) {
      console.error('Failed to update page heading:', error);
      message.error('Failed to update page heading');
    }
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <Breadcrumb className='mb-4'>
        <Breadcrumb.Item>
          <Link to="/dashboard">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Cookies Form</Breadcrumb.Item>
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
          className="px-4 py-2 bg-[#ffcc00] text-[#1a1a1a] rounded hover:bg-[#e6b800] transition duration-300 font-serif"
        >
          Save Headings
        </button>
      </div>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="cookiesPolicy"
          label="Cookies Policy"
          rules={[
            {
              required: true,
              message: 'Please enter the cookies policy'
            },
            {
              validator: (_, value) => {
                // Check if content is empty (Quill returns '<p><br></p>' for empty content)
                const textContent = value?.replace(/<[^>]*>/g, '').trim();
                if (!textContent || textContent === '') {
                  return Promise.reject('Please enter the cookies policy');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <ReactQuill
            theme="snow"
            value={cookiesPolicy}
            onChange={handleEditorChange}
            modules={modules}
            formats={formats}
            placeholder="Start typing your cookies policy..."
            style={{ height: '400px', marginBottom: '50px' }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isExistingData ? 'Update' : 'Save'}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default CookiesForm;




