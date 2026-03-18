import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Breadcrumb, message, Upload } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import {
    useSubmitApplicationMutation,
    useUpdateApplicationMutation,
    useGetApplicationByIdQuery
} from '../../slice/career/CareerForm';

const CareerAdminForm = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [fileList, setFileList] = useState([]);

    // API hooks
    const [submitApplication] = useSubmitApplicationMutation();
    const [updateApplication] = useUpdateApplicationMutation();
    const { data: editData, isLoading: isLoadingEdit } = useGetApplicationByIdQuery(id, {
        skip: !isEditMode
    });

    // Set form values when editing
    useEffect(() => {
        const rawData = editData?.data || editData;
        const dataToSet = Array.isArray(rawData) ? rawData[0] : rawData;

        if (isEditMode && dataToSet) {
            form.setFieldsValue({
                name: dataToSet.name,
                email: dataToSet.email,
                contactNo: dataToSet.contactNo,
                address: dataToSet.address,
                postAppliedFor: dataToSet.postAppliedFor,
            });

            // Set existing resume file
            if (dataToSet.resumeFile) {
                setFileList([
                    {
                        uid: '-1',
                        name: dataToSet.resumeFile.split('/').pop(),
                        status: 'done',
                        url: dataToSet.resumeFile,
                    }
                ]);
            }
        }
    }, [editData, form, isEditMode]);

    useEffect(() => {
        if (!isEditMode) {
            form.resetFields();
            setFileList([]);
        }
    }, [isEditMode, form]);

    const onFinish = async (values) => {
        try {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('email', values.email);
            formData.append('contactNo', values.contactNo);
            formData.append('address', values.address);
            formData.append('postAppliedFor', values.postAppliedFor);

            // Only append file if a new one is uploaded
            if (fileList[0]?.originFileObj) {
                formData.append('resumeFile', fileList[0].originFileObj);
            }

            if (isEditMode) {
                await updateApplication({ id, formData }).unwrap();
                message.success('Application updated successfully!');
            } else {
                await submitApplication(formData).unwrap();
                message.success('Application submitted successfully!');
            }
            navigate('/career-table');
        } catch (error) {
            message.error(error.message || 'Something went wrong');
        }
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isPDF = file.type === 'application/pdf';
            if (!isPDF) {
                message.error('You can only upload PDF files!');
                return false;
            }
            return false; // Prevent automatic upload
        },
        maxCount: 1,
        fileList,
        onChange: handleFileChange,
    };

    return (
        <div className='p-5'>
            <Breadcrumb
                items={[
                    {
                        title: <span onClick={() => navigate('/dashboard')} className='cursor-pointer'>
                            Dashboard
                        </span>
                    },
                    {
                        title: <span onClick={() => navigate('/career-table')} className='cursor-pointer'>
                            Career Applications
                        </span>
                    },
                    { title: isEditMode ? 'Edit Application' : 'Add Application' }
                ]}
                className='mb-4'
            />

            <Card title={isEditMode ? 'Edit Application' : 'Add New Application'}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    disabled={isLoadingEdit}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[
                            { required: true, message: 'Please enter name' },
                            { min: 2, message: 'Name must be at least 2 characters' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="contactNo"
                        label="Contact Number"
                        rules={[
                            { required: true, message: 'Please enter contact number' },
                            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit number' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[
                            { required: true, message: 'Please enter address' },
                            { min: 5, message: 'Address must be at least 5 characters' }
                        ]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="postAppliedFor"
                        label="Post Applied For"
                        rules={[{ required: true, message: 'Please enter post applied for' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="resumeFile"
                        label="Resume"
                        rules={[
                            {
                                required: !isEditMode && !fileList.length,
                                message: 'Please upload resume'
                            }
                        ]}
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>
                                {fileList.length ? 'Replace Resume' : 'Upload Resume'}
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isLoadingEdit}>
                            {isEditMode ? 'Update' : 'Submit'}
                        </Button>
                        <Button
                            className='ml-3'
                            onClick={() => navigate('/career-table')}
                        >
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CareerAdminForm; 