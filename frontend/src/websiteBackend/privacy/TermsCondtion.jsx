import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, message, Breadcrumb } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const TermsConditionForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [termsCondition, setTermsCondition] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExistingData, setIsExistingData] = useState(false);
  const [termsConditionId, setTermsConditionId] = useState(null);
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
    const fetchTermsConditionData = async () => {
      try {
        const response = await axios.get('/api/terms');
        if (response.data.length > 0) {
          const termsConditionData = response.data[0];
          setTermsCondition(termsConditionData.termsCondition);
          setTermsConditionId(termsConditionData._id);
          form.setFieldsValue({
            termsCondition: termsConditionData.termsCondition,
          });
          setIsExistingData(true);
        }
      } catch (error) {
        message.error('Failed to fetch terms and conditions data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTermsConditionData();
    fetchHeadings();
  }, []);

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=terms-condition');
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
      if (termsCondition && termsCondition !== '<p><br></p>') {
        return; // Ignore the empty reset, keep DB content
      }
    }
    setTermsCondition(content);
    form.setFieldsValue({ termsCondition: content });
  };

  const handleFinish = async () => {
    try {
      // Use form field value as source of truth (most reliable after edits)
      const currentContent = form.getFieldValue('termsCondition') || termsCondition;
      const dataToSend = { termsCondition: currentContent };

      if (!currentContent || currentContent.replace(/<[^>]*>/g, '').trim() === '') {
        message.error('Terms and conditions content cannot be empty');
        return;
      }

      if (isExistingData) {
        await axios.put(`/api/terms/${termsConditionId}`, dataToSend);
        message.success('Terms and conditions updated successfully');
      } else {
        await axios.post('/api/terms/add', dataToSend);
        message.success('Terms and conditions created successfully');
      }
    } catch (error) {
      message.error('Failed to save terms and conditions');
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
      await axios.put('/api/pageHeading/updateHeading?pageType=terms-condition', formData, { withCredentials: true });
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
        <Breadcrumb.Item>Terms and Conditions Form</Breadcrumb.Item>
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
          name="termsCondition"
          label="Terms and Conditions"
          rules={[
            {
              required: true,
              message: 'Please enter the terms and conditions'
            },
            {
              validator: (_, value) => {
                // Check if content is empty (Quill returns '<p><br></p>' for empty content)
                const textContent = value?.replace(/<[^>]*>/g, '').trim();
                if (!textContent || textContent === '') {
                  return Promise.reject('Please enter the terms and conditions');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <ReactQuill
            theme="snow"
            value={termsCondition}
            onChange={handleEditorChange}
            modules={modules}
            formats={formats}
            placeholder="Start typing your terms and conditions..."
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

      {/* Custom CSS for better Quill editor styling */}
      <style jsx>{`
        /* Quill Editor Customization */
        :global(.ql-container) {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 16px;
        }

        :global(.ql-toolbar) {
          background-color: #fafafa;
          border: 1px solid #d9d9d9;
          border-bottom: none;
          border-radius: 6px 6px 0 0;
        }

        :global(.ql-container.ql-snow) {
          border: 1px solid #d9d9d9;
          border-radius: 0 0 6px 6px;
        }

        :global(.ql-editor) {
          min-height: 400px;
          font-size: 16px;
          line-height: 1.6;
        }

        :global(.ql-editor.ql-blank::before) {
          color: #bfbfbf;
          font-style: normal;
        }

        /* Toolbar button hover effects */
        :global(.ql-toolbar button:hover),
        :global(.ql-toolbar button:focus) {
          color: #1890ff;
        }

        :global(.ql-toolbar button.ql-active) {
          color: #1890ff;
        }

        :global(.ql-toolbar .ql-stroke) {
          stroke: #595959;
        }

        :global(.ql-toolbar button:hover .ql-stroke),
        :global(.ql-toolbar button:focus .ql-stroke),
        :global(.ql-toolbar button.ql-active .ql-stroke) {
          stroke: #1890ff;
        }

        :global(.ql-toolbar .ql-fill) {
          fill: #595959;
        }

        :global(.ql-toolbar button:hover .ql-fill),
        :global(.ql-toolbar button:focus .ql-fill),
        :global(.ql-toolbar button.ql-active .ql-fill) {
          fill: #1890ff;
        }

        /* Picker hover effects */
        :global(.ql-toolbar .ql-picker-label:hover),
        :global(.ql-toolbar .ql-picker-item:hover) {
          color: #1890ff;
        }

        /* Editor content styling */
        :global(.ql-editor h1) {
          font-size: 2em;
          font-weight: 700;
          margin-bottom: 0.5em;
        }

        :global(.ql-editor h2) {
          font-size: 1.5em;
          font-weight: 600;
          margin-bottom: 0.5em;
        }

        :global(.ql-editor h3) {
          font-size: 1.25em;
          font-weight: 600;
          margin-bottom: 0.5em;
        }

        :global(.ql-editor p) {
          margin-bottom: 1em;
        }

        :global(.ql-editor ul),
        :global(.ql-editor ol) {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }

        :global(.ql-editor blockquote) {
          border-left: 4px solid #1890ff;
          padding-left: 16px;
          margin: 1em 0;
          font-style: italic;
          color: #595959;
        }

        :global(.ql-editor a) {
          color: #1890ff;
          text-decoration: underline;
        }

        :global(.ql-editor a:hover) {
          color: #40a9ff;
        }

        :global(.ql-editor img) {
          max-width: 100%;
          height: auto;
        }

        /* Focus state */
        :global(.ql-container.ql-snow:focus-within) {
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
        }

        /* Scrollbar styling */
        :global(.ql-editor::-webkit-scrollbar) {
          width: 8px;
        }

        :global(.ql-editor::-webkit-scrollbar-track) {
          background: #f1f1f1;
        }

        :global(.ql-editor::-webkit-scrollbar-thumb) {
          background: #d9d9d9;
          border-radius: 4px;
        }

        :global(.ql-editor::-webkit-scrollbar-thumb:hover) {
          background: #bfbfbf;
        }
      `}</style>
    </>
  );
};

export default TermsConditionForm;




