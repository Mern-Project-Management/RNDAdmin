import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Upload, Breadcrumb, Select } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateBannerMutation } from '../../slice/banner/banner';
import { UploadOutlined, HomeOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const AddBannerForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [createBanner] = useCreateBannerMutation();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuList = async () => {
      try {
        const response = await axios.get('/api/menulist/get-menu');
        if (response.data.success) {
          setMenuList(response.data.data);
        } else {
          message.error('Failed to load menu list');
        }
      } catch (error) {
        console.error('Error fetching menu list:', error);
        message.error('Error fetching menu list');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuList();
  }, []);

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      if (values.image?.[0]?.originFileObj) {
        formData.append('image', values.image[0].originFileObj);
        formData.append('imgName', values.imgName); // Use the manually entered imgName
      } else {
        message.error('Please select an image');
        return;
      }

      formData.append('altName', values.altName);
      formData.append('pageSlug', values.pageSlug);
      formData.append('heading', JSON.stringify(values.heading || []));
      formData.append('description', values.description || '');
      formData.append('marqueeText', JSON.stringify(values.marqueeText || []));
      formData.append('link', JSON.stringify(values.link || []));

      await createBanner(formData);
      message.success('Banner created successfully');
      navigate('/banner-table');
    } catch (error) {
      console.error(error);
      message.error('Failed to create banner');
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

  const renderMenuOptions = (items) => {
    const options = [];
    items.forEach(item => {
      options.push(<Option key={item._id} value={item.parent.path} className="font-bold">{item.parent.name}</Option>);
      if (item.children) {
        item.children.forEach(child => {
          options.push(<Option key={child._id} value={child.path} className="pl-5"><span> ├── </span>{child.name}</Option>);
          if (child.subChildren) {
            child.subChildren.forEach(subChild => {
              options.push(<Option key={subChild._id} value={subChild.path} className="pl-10"><span>├────</span> {subChild.name}</Option>);
            });
          }
        });
      }
    });
    return options;
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
          <Link to="/banner-table">Banner Management</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Add New Banner</Breadcrumb.Item>
      </Breadcrumb>

      <div className='p-6'>
        <h1 className="text-2xl font-bold mb-6">Add New Banner</h1>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="pageSlug" label="Page Slug" rules={[{ required: true, message: 'Please select a page slug!' }]}>
            <Select placeholder="Select a menu item" loading={loading}>
              {renderMenuOptions(menuList)}
            </Select>
          </Form.Item>
          <Form.Item name="image" label="Banner Image" rules={[{ required: true, message: 'Please upload an image!' }]}>
            <Upload maxCount={1} listType="picture" beforeUpload={() => false} onChange={handleImageChange}>
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="imgName" label="Image Name" rules={[{ required: true, message: 'Please input image name!' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="altName" label="Alt Name" rules={[{ required: true, message: 'Please input alt name!' }]}>
            <Input />
          </Form.Item>

          <Form.List name="heading">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    label={index === 0 ? 'Heading' : ''}
                    required={false}
                    key={field.key}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        noStyle
                      >
                        <Input placeholder="Heading" />
                      </Form.Item>
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                      />
                    </div>
                  </Form.Item>
                ))}
                <Form.Item label={fields.length === 0 ? 'Heading' : ''}>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Heading
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.List name="marqueeText">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    label={index === 0 ? 'Marque Text' : ''}
                    required={false}
                    key={field.key}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        noStyle
                      >
                        <Input placeholder="Marque Text" />
                      </Form.Item>
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                      />
                    </div>
                  </Form.Item>
                ))}
                <Form.Item label={fields.length === 0 ? 'Marquee Text' : ''}>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Marquee Text
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.List name="link">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    label={index === 0 ? 'Links' : ''}
                    required={false}
                    key={field.key}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Form.Item
                        name={[field.name, 'name']}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[{ required: true, whitespace: true, message: 'Please input link name.' }]}
                        noStyle
                      >
                        <Input placeholder="Button Name" style={{ width: '40%' }} />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'url']}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[{ required: true, whitespace: true, message: 'Please input link URL.' }]}
                        noStyle
                      >
                        <Input placeholder="URL" style={{ width: '55%' }} />
                      </Form.Item>
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                      />
                    </div>
                  </Form.Item>
                ))}
                <Form.Item label={fields.length === 0 ? 'Links' : ''}>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Link
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit">Submit</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddBannerForm;
