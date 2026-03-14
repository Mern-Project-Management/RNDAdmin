import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Upload, Select, Breadcrumb } from 'antd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useGetBannerByIdQuery, useUpdateBannerMutation } from '../../slice/banner/banner';
import { UploadOutlined, HomeOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const EditBannerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [imageChanged, setImageChanged] = useState(false);
    const [menuList, setMenuList] = useState([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const { data: banner, isLoading } = useGetBannerByIdQuery(id);
    const [updateBanner] = useUpdateBannerMutation();

    useEffect(() => {
        // Fetch menu list for pageSlug dropdown
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
                setMenuLoading(false);
            }
        };
        fetchMenuList();
    }, []);

    useEffect(() => {
        if (banner) {
            form.setFieldsValue({
                altName: banner.altName,
                imgName: banner.imgName,
                pageSlug: banner.pageSlug || '',
                heading: banner.heading || [],
                description: banner.description,
                marqueeText: banner.marqueeText,
                link: banner.link || [],
                image: banner.image
                    ? [{ name: banner.imgName, url: `/api/image/download/${banner.image}` }]
                    : [],
            });
        }
    }, [banner, form]);

    const handleImageChange = (info) => {
        setImageChanged(true);
        form.setFieldsValue({
            imgName: info.file.name,
            image: info.fileList,
        });
    };

    const onFinish = async (values) => {
        try {
            if (!values.altName?.trim()) {
                message.error('Alt Name is required');
                return;
            }
            if (!values.pageSlug) {
                message.error('Page Slug is required');
                return;
            }

            const formData = new FormData();

            if (imageChanged && values.image?.[0]?.originFileObj) {
                formData.append('image', values.image[0].originFileObj);
                formData.append('imgName', values.image[0].name);
            } else {
                formData.append('imgName', values.imgName || banner.imgName);
            }

            formData.append('altName', values.altName.trim());
            formData.append('pageSlug', values.pageSlug);
            formData.append('heading', JSON.stringify(values.heading || []));
            formData.append('description', values.description || '');
            formData.append('marqueeText', JSON.stringify(values.marqueeText || []));
            formData.append('link', JSON.stringify(values.link || []));

            await updateBanner({
                id,
                bannerData: formData,
            });

            message.success('Banner updated successfully');
            navigate('/banner-table');
        } catch (error) {
            console.error(error);
            message.error('Failed to update banner');
        }
    };

    if (isLoading) return <div>Loading...</div>;

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
                <Breadcrumb.Item>Edit Banner</Breadcrumb.Item>
            </Breadcrumb>

            <div className='p-6'>
                <h1 className="text-2xl font-bold mb-6">Edit Banner</h1>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        altName: banner?.altName || '',
                        imgName: banner?.imgName || '',
                        pageSlug: banner?.pageSlug || '',
                        heading: banner?.heading || [],
                        description: banner?.description || '',
                        marqueeText: banner?.marqueeText || [],
                        image: banner?.image
                            ? [{ name: banner.imgName, url: `/api/image/download/${banner.image}` }]
                            : [],
                    }}
                >

                    <Form.Item
                        name="pageSlug"
                        label="Page Slug"
                        rules={[{ required: true, message: 'Please select a page slug!' }]}
                    >
                        <Select placeholder="Select a menu item" loading={menuLoading}>
                            {menuList.map(item => (
                                <React.Fragment key={item._id}>
                                    <Option key={`${item._id}-parent`} value={item.parent.path} className="font-bold">{item.parent.name}</Option>
                                    {item.children && item.children.map(child => (
                                        <React.Fragment key={child._id}>
                                            <Option key={child._id} value={child.path} className="pl-5">
                                                <span> ├── </span>{child.name}
                                            </Option>
                                            {child.subChildren && child.subChildren.map(subChild => (
                                                <Option key={subChild._id} value={subChild.path} className="pl-10">
                                                    <span>├────</span> {subChild.name}
                                                </Option>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="image" label="Banner Image" valuePropName="fileList" getValueFromEvent={(e) => e && e.fileList}>
                        <Upload
                            maxCount={1}
                            listType="picture"
                            beforeUpload={() => false}
                            onChange={handleImageChange}
                            defaultFileList={
                                banner?.image
                                    ? [{ name: banner.imgName, url: `/api/image/download/${banner.image}` }]
                                    : []
                            }
                        >
                            <Button icon={<UploadOutlined />}>
                                {imageChanged ? 'Change Image' : 'Upload New Image'}
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="imgName"
                        label="Image Name"
                        rules={[{ required: true, message: 'Please input image name!' }]}
                    >
                        <Input disabled={imageChanged} />
                    </Form.Item>

                    <Form.Item
                        name="altName"
                        label="Alt Name"
                        rules={[{ required: true, message: 'Please input alt name!' }]}
                    >
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
                        <Button type="primary" htmlType="submit">
                            Update
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default EditBannerForm;
