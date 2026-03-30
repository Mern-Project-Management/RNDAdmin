import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Breadcrumb, message, Upload, Select, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import {
    useSubmitApplicationMutation,
    useUpdateApplicationMutation,
    useGetApplicationByIdQuery
} from '../../slice/career/CareerForm';

const { Option } = Select;
const { TextArea } = Input;

const CareerAdminForm = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [fileList, setFileList] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);

    // API hooks
    const [submitApplication] = useSubmitApplicationMutation();
    const [updateApplication] = useUpdateApplicationMutation();
    const { data: editData, isLoading: isLoadingEdit } = useGetApplicationByIdQuery(id, {
        skip: !isEditMode
    });

    // Fetch available roles (career options)
    useEffect(() => {
        const fetchRoles = async () => {
            setIsLoadingRoles(true);
            try {
                const response = await axios.get('/api/career-option/getCareeroption');
                setRoles(response.data || []);
            } catch (error) {
                console.error('Failed to fetch roles:', error);
            } finally {
                setIsLoadingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    // Set form values when editing
    useEffect(() => {
        const rawData = editData?.data || editData;
        const dataToSet = Array.isArray(rawData) ? rawData[0] : rawData;

        if (isEditMode && dataToSet) {
            form.setFieldsValue({
                name: dataToSet.name,
                email: dataToSet.email,
                phone: dataToSet.phone || dataToSet.contactNo,
                careerTitle: dataToSet.careerTitle || dataToSet.postAppliedFor,
                linkedin: dataToSet.linkedin,
                projectDetails: dataToSet.projectDetails,
            });

            // Set existing resume file
            const resumeFile = dataToSet.resumeFile || dataToSet.resumeUrl;
            if (resumeFile) {
                const fileName = resumeFile.split('/').pop();
                setFileList([
                    {
                        uid: '-1',
                        name: fileName,
                        status: 'done',
                        url: resumeFile,
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
            formData.append('phone', values.phone);
            formData.append('contactNo', values.phone); // Sync for legacy
            formData.append('careerTitle', values.careerTitle);
            formData.append('postAppliedFor', values.careerTitle); // Sync for legacy
            formData.append('linkedin', values.linkedin || '');
            formData.append('projectDetails', values.projectDetails || '');
            formData.append('url', 'Dashboard');

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

    const handleFileChange = ({ fileList: newFileList }) => setFileList(newFileList);

    const uploadProps = {
        beforeUpload: (file) => {
            const isValidType = 
                file.type === 'application/pdf' || 
                file.type === 'application/msword' || 
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            
            if (!isValidType) {
                message.error('You can only upload PDF or DOC/DOCX files!');
                return false;
            }
            return false;
        },
        maxCount: 1,
        fileList,
        onChange: handleFileChange,
    };

    if (isLoadingEdit && isEditMode) {
        return <div className="flex justify-center p-10"><Spin size="large" /></div>;
    }

    return (
        <div className='p-5'>
            <Breadcrumb
                items={[
                    { title: 'Dashboard', onClick: () => navigate('/dashboard'), className: 'cursor-pointer' },
                    { title: 'Career Applications', onClick: () => navigate('/career-table'), className: 'cursor-pointer' },
                    { title: isEditMode ? 'Edit Application' : 'Add Application' }
                ]}
                className='mb-6'
            />

            <Card title={isEditMode ? 'Edit Application' : 'Add New Application'}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input placeholder="Enter full name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="Enter email address" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                        <Input placeholder="Enter contact number" />
                    </Form.Item>

                    <Form.Item
                        name="careerTitle"
                        label="Role / Post Applied For"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select placeholder="Select a role" loading={isLoadingRoles}>
                            {roles.map(role => (
                                <Option key={role._id} value={role.jobtitle}>{role.jobtitle}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="linkedin"
                        label="LinkedIn Profile"
                        rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                    >
                        <Input placeholder="https://linkedin.com/in/profile" />
                    </Form.Item>

                    <Form.Item
                        name="resumeFile"
                        label="Resume (PDF/DOC/DOCX)"
                        rules={[{ required: !isEditMode && !fileList.length, message: 'Please upload resume' }]}
                    >
                        <Upload {...uploadProps} listType="picture">
                            <Button icon={<UploadOutlined />}>
                                {fileList.length ? 'Change Resume' : 'Click to Upload'}
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="projectDetails"
                        label="Project Details / Cover Letter"
                    >
                        <TextArea rows={4} placeholder="Tell us more about your experience..." />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Button htmlType="submit" className="bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold">
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
