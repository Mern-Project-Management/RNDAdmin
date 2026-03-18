import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Breadcrumb, message, Upload, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    UserOutlined, 
    MailOutlined, 
    PhoneOutlined, 
    LinkOutlined, 
    FilePdfOutlined, 
    MessageOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import axios from 'axios';
import {
    useSubmitApplicationMutation,
    useUpdateApplicationMutation,
    useGetApplicationByIdQuery
} from '../../slice/career/CareerForm';

const { Option } = Select;

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
                setFileList([
                    {
                        uid: '-1',
                        name: resumeFile.split('/').pop(),
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
            formData.append('phone', values.phone); // Model uses 'phone'
            formData.append('contactNo', values.phone); // For backward compatibility
            formData.append('careerTitle', values.careerTitle); // Model uses 'careerTitle'
            formData.append('postAppliedFor', values.careerTitle); // For backward compatibility
            formData.append('linkedin', values.linkedin || '');
            formData.append('projectDetails', values.projectDetails || '');
            formData.append('url', 'Dashboard'); // Default for admin-added

            // Only append file if a new one is uploaded
            if (fileList[0]?.originFileObj) {
                formData.append('resumeFile', fileList[0].originFileObj);
            } else if (isEditMode && fileList.length > 0) {
              // Optionally handle existing file if needed by backend, 
              // but current backend only updates if file is present in req.files
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
            const isValidType = 
              file.type === 'application/pdf' || 
              file.type === 'application/msword' || 
              file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            
            if (!isValidType) {
                message.error('You can only upload PDF or DOC/DOCX files!');
                return false;
            }
            return false; // Prevent automatic upload
        },
        maxCount: 1,
        fileList,
        onChange: handleFileChange,
        className: 'custom-upload'
    };

    return (
        <div className='p-6 max-w-4xl mx-auto'>
            <Breadcrumb
                items={[
                    {
                        title: <span onClick={() => navigate('/dashboard')} className='hover:text-blue-600 transition-colors cursor-pointer'>
                            Dashboard
                        </span>
                    },
                    {
                        title: <span onClick={() => navigate('/career-table')} className='hover:text-blue-600 transition-colors cursor-pointer'>
                            Career Applications
                        </span>
                    },
                    { title: isEditMode ? 'Edit Application' : 'Add Application' }
                ]}
                className='mb-6'
            />

            <Card 
              className="shadow-xl rounded-2xl overflow-hidden border-0"
              title={<span className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Application' : 'Quick Help - New Application'}</span>}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    disabled={isLoadingEdit}
                    className="space-y-6"
                >
                    {/* Name */}
                    <div className="border-b border-gray-200 pb-2">
                      <label className="text-gray-600 font-medium mb-1 block">What's your name?</label>
                      <Form.Item
                          name="name"
                          rules={[{ required: true, message: 'Please enter name' }]}
                          className="!mb-0"
                      >
                          <Input 
                            placeholder="Full name here" 
                            bordered={false} 
                            suffix={<UserOutlined className="text-gray-400" />}
                            className="text-lg py-1 px-0 focus:shadow-none"
                          />
                      </Form.Item>
                    </div>

                    {/* Email */}
                    <div className="border-b border-gray-200 pb-2">
                      <label className="text-gray-600 font-medium mb-1 block">What's your e-mail?</label>
                      <Form.Item
                          name="email"
                          rules={[
                              { required: true, message: 'Please enter email' },
                              { type: 'email', message: 'Please enter a valid email' }
                          ]}
                          className="!mb-0"
                      >
                          <Input 
                            placeholder="Enter your mail here" 
                            bordered={false} 
                            suffix={<MailOutlined className="text-gray-400" />}
                            className="text-lg py-1 px-0 focus:shadow-none"
                          />
                      </Form.Item>
                    </div>

                    {/* Phone */}
                    <div className="border-b border-gray-200 pb-2">
                      <label className="text-gray-600 font-medium mb-1 block">What's your phone number?</label>
                      <Form.Item
                          name="phone"
                          rules={[{ required: true, message: 'Please enter phone number' }]}
                          className="!mb-0"
                      >
                          <Input 
                            placeholder="Enter your phone number" 
                            bordered={false} 
                            suffix={<PhoneOutlined className="text-gray-400" />}
                            className="text-lg py-1 px-0 focus:shadow-none"
                          />
                      </Form.Item>
                    </div>

                    {/* Role / Career Title */}
                    <div className="border-b border-gray-200 pb-2">
                      <label className="text-gray-600 font-medium mb-1 block">What's your role?</label>
                      <Form.Item
                          name="careerTitle"
                          rules={[{ required: true, message: 'Please select a role' }]}
                          className="!mb-0"
                      >
                          <Select 
                            placeholder="Select a role" 
                            bordered={false}
                            className="text-lg w-full !px-0"
                            loading={isLoadingRoles}
                            suffixIcon={null} // We'll let the border suffice
                          >
                              {roles.map(role => (
                                  <Option key={role._id} value={role.jobtitle}>{role.jobtitle}</Option>
                              ))}
                          </Select>
                      </Form.Item>
                    </div>

                    {/* LinkedIn */}
                    <div className="border-b border-gray-200 pb-2">
                      <label className="text-gray-600 font-medium mb-1 block">LinkedIn Profile <span className="text-gray-400 text-sm italic font-normal">(optional)</span></label>
                      <Form.Item
                          name="linkedin"
                          rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                          className="!mb-0"
                      >
                          <Input 
                            placeholder="https://linkedin.com/in/your-profile" 
                            bordered={false} 
                            suffix={<LinkOutlined className="text-gray-400" />}
                            className="text-lg py-1 px-0 focus:shadow-none"
                          />
                      </Form.Item>
                    </div>

                    {/* Resume */}
                    <div className="border-b border-gray-200 pb-2">
                      <label className="text-gray-600 font-medium mb-1 block">Upload your resume</label>
                      <Form.Item
                          name="resumeFile"
                          rules={[{ required: !isEditMode && !fileList.length, message: 'Please upload resume' }]}
                          className="!mb-0"
                      >
                          <Upload {...uploadProps}>
                              <div className="flex justify-between items-center w-full cursor-pointer py-2">
                                <span className={fileList.length ? 'text-gray-800' : 'text-gray-400 text-lg'}>
                                  {fileList.length ? fileList[0].name : 'Choose File No file chosen'}
                                </span>
                                <FilePdfOutlined className="text-gray-400 text-xl" />
                              </div>
                          </Upload>
                      </Form.Item>
                      <p className="text-gray-400 text-xs mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                    </div>

                    {/* Project Details */}
                    <div className="border-b border-gray-200 pb-2">
                      <label className="text-gray-600 font-medium mb-1 block">Project Details</label>
                      <Form.Item
                          name="projectDetails"
                          className="!mb-0"
                      >
                          <Input.TextArea 
                            placeholder="Tell us about your background, interest, or relevant experience..." 
                            bordered={false} 
                            autoSize={{ minRows: 1, maxRows: 6 }}
                            className="text-lg py-1 px-0 focus:shadow-none"
                          />
                      </Form.Item>
                      <div className="flex justify-end pr-1">
                        <MessageOutlined className="text-gray-400 transition-transform hover:scale-110" />
                      </div>
                    </div>

                    <Form.Item className="pt-4">
                        <div className="flex items-center gap-4">
                          <Button 
                            type="default" 
                            htmlType="submit" 
                            loading={isLoadingEdit}
                            className="h-auto py-2.5 px-8 rounded-full border-2 border-gray-800 text-gray-800 font-bold hover:!bg-gray-800 hover:!text-white transition-all flex items-center gap-2"
                          >
                              {isEditMode ? 'Update Application' : 'Submit Application'}
                              <div className="bg-gray-800 text-white rounded-full p-1 group-hover:bg-white group-hover:text-gray-800 transition-colors">
                                <ArrowRightOutlined className="text-[10px] transform -rotate-45" />
                              </div>
                          </Button>
                          <Button
                              type="text"
                              className='font-medium text-gray-500 hover:text-red-500 transition-colors'
                              onClick={() => navigate('/career-table')}
                          >
                              Cancel
                          </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>

            <style>{`
              .ant-select-selection-search { margin-inline-start: 0 !important; }
              .ant-upload-list { margin-top: 8px !important; }
              .ant-form-item-explain-error { font-size: 12px; margin-top: 4px; }
              .ant-card-head { border-bottom: 0 !important; padding: 24px 24px 0 24px !important; }
              .ant-card-body { padding: 8px 24px 24px 24px !important; }
              .ant-input:focus, .ant-input-focused { border-right-width: 0 !important; }
              textarea.ant-input { resize: none; overflow-y: hidden !important; }
            `}</style>
        </div>
    );
};

export default CareerAdminForm;