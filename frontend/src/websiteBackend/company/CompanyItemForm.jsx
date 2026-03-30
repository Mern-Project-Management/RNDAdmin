import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Breadcrumb, Spin, InputNumber } from 'antd';
import { UploadOutlined, LeftOutlined } from '@ant-design/icons';
import { 
    useCreateCompanyItemMutation, 
    useUpdateCompanyItemMutation,
    useGetCompanyItemByIdQuery 
} from '../../slice/companyItemSlice';
import { useNavigate, useParams } from 'react-router-dom';

const CompanyItemForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const { 
        data: companyItemData, 
        isLoading: isLoadingData 
    } = useGetCompanyItemByIdQuery(id, { skip: !id });

    const [createCompanyItem] = useCreateCompanyItemMutation();
    const [updateCompanyItem] = useUpdateCompanyItemMutation();

    useEffect(() => {
        if (companyItemData) {
            form.setFieldsValue({
                name: companyItemData.name,
                link: companyItemData.link,
                order: companyItemData.order,
            });

            if (companyItemData.image) {
                setFileList([{
                    uid: '-1',
                    name: companyItemData.image,
                    status: 'done',
                    url: `/api/image/download/${companyItemData.image}`,
                }]);
            }
        }
    }, [companyItemData, form]);

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('link', values.link);
            formData.append('order', values.order || 0);
            
            if (fileList[0]?.originFileObj) {
                formData.append('image', fileList[0].originFileObj);
            } else if (id && fileList.length > 0) {
                // Keep existing image name if not changed
                formData.append('image_url', companyItemData.image);
            } else if (!id && fileList.length === 0) {
                message.error('Please upload an image');
                return;
            }

            if (id) {
                await updateCompanyItem({ id, ...Object.fromEntries(formData) }).unwrap();
                // Wait, RTK Query mutation body for Multer should be FormData if you send it like that, 
                // but let's check how other forms do it.
                // Usually for multipart/form-data, we pass the FormData object directly.
                // But my mutation definition was: body: updateData.
                // Re-checking other forms... AboutUsForm uses formData.
                await updateCompanyItem({ id, formData }).unwrap();
                message.success('Company item updated successfully');
            } else {
                await createCompanyItem(formData).unwrap();
                message.success('Company item created successfully');
            }

            navigate('/company-item-table');
        } catch (error) {
            message.error(error.data?.message || `Failed to ${id ? 'update' : 'create'} company item`);
        }
    };

    // Need to fix the mutation call if it was meant to be FormData
    // The previous implementation of Slice was: body: newItem (for Create)
    // and body: updateData (for Update). 
    // RTK Query handles FormData automatically if it's passed as body.

    const uploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return false;
            }
            return false; // Prevent automatic upload
        },
        onChange: ({ fileList }) => setFileList(fileList.slice(-1)), // Only keep the last file
        fileList,
    };

    if (isLoadingData && id) {
        return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;
    }

    return (
        <>
            <Breadcrumb
                items={[
                    { title: 'Dashboard', onClick: () => navigate('/dashboard') },
                    { title: 'Company', onClick: () => navigate('/company-item-table') },
                    { title: id ? 'Edit Company' : 'Create Company' },
                ]}
                className='mb-[1rem]'
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ order: 0 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="name"
                        label="Item Name"
                        rules={[{ required: true, message: 'Please input the item name!' }]}
                    >
                        <Input placeholder="e.g. About Us" />
                    </Form.Item>

                    <Form.Item
                        name="order"
                        label="Display Order"
                    >
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="link"
                    label="Navigation Link"
                    rules={[{ required: true, message: 'Please input the navigation link!' }]}
                >
                    <Input placeholder="e.g. /about-us" />
                </Form.Item>

                <Form.Item
                    label="Preview Image"
                    extra="This image will be shown on hover in the dropdown."
                    required={!id}
                >
                    <Upload {...uploadProps} listType="picture">
                        <Button icon={<UploadOutlined />} className="w-full">
                            {id ? 'Change Image' : 'Select Image'}
                        </Button>
                    </Upload>
                </Form.Item>

                <Form.Item className="mt-8">
                    <Button htmlType="submit" className="w-full h-10 text-lg bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] font-medium border-none shadow-md">
                        {id ? 'Update Item' : 'Create Item'}
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default CompanyItemForm;
