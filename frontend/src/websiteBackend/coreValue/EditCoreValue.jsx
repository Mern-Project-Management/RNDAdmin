import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Upload, Breadcrumb } from 'antd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useGetCoreValueByIdQuery, useUpdateCoreValueMutation } from '../../slice/coreValue/coreValue.js';
import TipTapEditor from '@/components/TipTapEditor';
import { UploadOutlined, HomeOutlined } from '@ant-design/icons';

const EditCoreValue = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [imageChanged, setImageChanged] = useState(false);
    const { data: coreValue, isLoading } = useGetCoreValueByIdQuery(id);
    const [updateCoreValue] = useUpdateCoreValueMutation();

    useEffect(() => {
        if (coreValue) {
            form.setFieldsValue({
                title: coreValue.title,
                altName: coreValue.altName,
                details: coreValue.details,
                image: coreValue.image
                    ? [{ name: 'Current Image', url: `/api/image/download/${coreValue.image}` }]
                    : [],
            });
        }
    }, [coreValue, form]);

    const handleImageChange = (info) => {
        setImageChanged(true);
        form.setFieldsValue({
            image: info.fileList,
        });
    };

    const onFinish = async (values) => {
        try {
            if (!values.title?.trim()) {
                message.error('Title is required');
                return;
            }
            if (!values.altName?.trim()) {
                message.error('Alt Name is required');
                return;
            }

            const formData = new FormData();

            if (imageChanged && values.image?.[0]?.originFileObj) {
                formData.append('image', values.image[0].originFileObj);
            }

            formData.append('title', values.title.trim());
            formData.append('altName', values.altName.trim());
            formData.append('details', values.details?.trim() || '');

            await updateCoreValue({
                id,
                coreValueData: formData,
            }).unwrap();

            message.success('Core Value updated successfully');
            navigate('/core-value-table');
        } catch (error) {
            console.error(error);
            message.error('Failed to update Core Value');
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
                    <Link to="/core-value-table">Core Value Management</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Edit Core Value</Breadcrumb.Item>
            </Breadcrumb>

            <div className='p-6'>
                <h1 className="text-2xl font-bold mb-6">Edit Core Value</h1>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        title: coreValue?.title || '',
                        altName: coreValue?.altName || '',
                        details: coreValue?.details || '',
                        image: coreValue?.image
                            ? [{ name: 'Current Image', url: `/api/image/download/${coreValue.image}` }]
                            : [],
                    }}
                >

                    <Form.Item name="image" label="Image" valuePropName="fileList" getValueFromEvent={(e) => e && e.fileList}>
                        <Upload
                            maxCount={1}
                            listType="picture"
                            beforeUpload={() => false}
                            onChange={handleImageChange}
                            defaultFileList={
                                coreValue?.image
                                    ? [{ name: 'Current Image', url: `/api/image/download/${coreValue.image}` }]
                                    : []
                            }
                        >
                            <Button icon={<UploadOutlined />}>
                                {imageChanged ? 'Change Image' : 'Upload New Image'}
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please input title!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="altName"
                        label="Alt Name"
                        rules={[{ required: true, message: 'Please input alt name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="details"
                        label="details"
                        rules={[{ message: 'Please input details!' }]}
                    >
                        <TipTapEditor />
                    </Form.Item>



                    <Form.Item>
                        <Button htmlType="submit" className="bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold">
                            Update
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default EditCoreValue;
