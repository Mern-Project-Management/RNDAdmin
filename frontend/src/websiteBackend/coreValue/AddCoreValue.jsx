import React, { useState } from 'react';
import { Form, Input, Button, message, Upload, Breadcrumb } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateCoreValueMutation } from '../../slice/coreValue/coreValue.js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { UploadOutlined, HomeOutlined } from '@ant-design/icons';

const AddCoreValue = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [createCoreValue] = useCreateCoreValueMutation();
  const [previewUrl, setPreviewUrl] = useState(null);

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      if (values.image?.[0]?.originFileObj) {
        formData.append('image', values.image[0].originFileObj);
      } else {
        message.error('Please select an image');
        return;
      }

      formData.append('title', values.title?.trim() || '');
      formData.append('imgName', values.imgName?.trim() || '');
      formData.append('altName', values.altName?.trim() || '');
      formData.append('details', values.details?.trim() || '');

      await createCoreValue(formData).unwrap();
      message.success('Core Value created successfully');
      navigate('/core-value-table');
    } catch (error) {
      console.error(error);
      message.error('Failed to create Core Value');
    }
  };

  const handleImageChange = (info) => {
    const file = info.fileList[0];
    if (file?.originFileObj) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file.originFileObj);

      // Only set the image field, not imgName
      form.setFieldsValue({
        image: info.fileList,
      });
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div>
      <Breadcrumb className='px-4 py-6'>
        <Breadcrumb.Item>
          <Link to="/dashboard">
            <HomeOutlined /> Dashboard
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/core-value-table">Core Value Management</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Add New Core Value</Breadcrumb.Item>
      </Breadcrumb>

      <div className='p-6'>
        <h1 className="text-2xl font-bold mb-6">Add New Core Value</h1>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="image" label="Image" rules={[{ required: true, message: 'Please upload an image!' }]} valuePropName="fileList" getValueFromEvent={(e) => e && e.fileList}>
            <Upload maxCount={1} listType="picture" beforeUpload={() => false} onChange={handleImageChange}>
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="title" label="Title">
            <Input />
          </Form.Item>

          <Form.Item name="imgName" label="Image Name">
            <Input />
          </Form.Item>

          <Form.Item name="altName" label="Alt Name" rules={[{ required: true, message: 'Please input alt name!' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="details" label="details">
            <ReactQuill theme="snow" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Submit</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddCoreValue;
