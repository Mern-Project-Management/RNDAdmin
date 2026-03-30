import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Image, Breadcrumb, Typography } from 'antd';
import { UploadOutlined, HomeOutlined } from '@ant-design/icons';
import JoditEditor from 'jodit-react';
import axios from 'axios';

const { Title } = Typography;

const CareerInfoForm = () => {
  const [form] = Form.useForm();
  const [info, setInfo] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [careerInfo, setCareerInfo] = useState(null);

  const fetchCareerInfo = () => {
    axios.get('/api/careerInfo')
      .then(response => {
        if (response.data.length > 0) {
          const data = response.data[0];
          setCareerInfo(data);
          setInfo(data.info);
          form.setFieldsValue({ info: data.info });
          if (data.image) {
            setImageUrl(`/api/image/download/${data.image}`);
          }
        }
      })
      .catch(error => {
        console.error('Error fetching career info:', error);
      });
  };

  useEffect(() => {
    fetchCareerInfo();
  }, [form]);

  const handleInfoChange = (newInfo) => {
    setInfo(newInfo);
  };

  const handleImageChange = ({ file }) => {
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('info', info);
    if (image) {
      formData.append('image', image);
    }

    try {
      if (careerInfo) {
        // Update existing career info
        await axios.put(`/api/careerInfo/${careerInfo._id}`, formData);
        message.success('Career info updated successfully');
        fetchCareerInfo(); // Fetch updated data
      } else {
        // Create new career info
        await axios.post('/api/careerInfo', formData);
        message.success('Career info created successfully');
        fetchCareerInfo(); // Fetch updated data
      }
    } catch (error) {
      console.error('Error saving career info:', error);
      message.error('Error saving career info');
    }
  };

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item href="/dashboard">
        Dashboard
        </Breadcrumb.Item>
       
        <Breadcrumb.Item>Career Info</Breadcrumb.Item>
      </Breadcrumb>
      <Title level={2} className='mx-4'>Career Info</Title>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item label="Info" name="info" rules={[{ required: true, message: 'Please enter the info' }]}>
          <JoditEditor
            value={info}
            onChange={handleInfoChange}
          />
        </Form.Item>
        <Form.Item label="Image" name="image">
          {imageUrl && (
            <Image
              width={200}
              src={imageUrl}
              alt="Career Info Image"
            />
          )}
          <Upload
            beforeUpload={() => false}
            onChange={handleImageChange}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" className="bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold">
            {careerInfo ? 'Update' : 'Submit'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CareerInfoForm;
