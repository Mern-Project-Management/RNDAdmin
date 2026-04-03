import React from 'react';
import { Table, Modal, message, Button } from 'antd';
import { DownloadOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useGetAllApplicationsQuery, useDeleteApplicationMutation, useDeleteMultipleApplicationsMutation } from '../../slice/career/CareerForm';

const CareerTable = () => {
    const navigate = useNavigate();
    const { data: applications, isLoading } = useGetAllApplicationsQuery();
    const [deleteApplication] = useDeleteApplicationMutation();
    const [deleteMultipleApplications] = useDeleteMultipleApplicationsMutation();
    const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

    const handleEdit = (record) => {
        navigate(`/career/edit/${record._id}`);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this application?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteApplication(id).unwrap();
                    message.success('Application deleted successfully!');
                } catch (error) {
                    message.error(error.message || 'Something went wrong');
                }
            },
        });
    };

    const handleBulkDelete = () => {
        Modal.confirm({
            title: `Are you sure you want to delete ${selectedRowKeys.length} applications?`,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteMultipleApplications(selectedRowKeys).unwrap();
                    message.success('Applications deleted successfully!');
                    setSelectedRowKeys([]);
                } catch (error) {
                    message.error(error.message || 'Something went wrong');
                }
            },
        });
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const getBaseUrl = () => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3030';
        }
        return 'https://www.admin.rndtechnosoft.com';
    };

    const handleView = (filePath) => {
        if (!filePath) {
            message.warning('No resume file attached');
            return;
        }
        const filename = filePath.includes('/') ? filePath.split('/').pop() : filePath;
        const baseUrl = getBaseUrl();
        window.open(`${baseUrl}/api/image/pdf/view/${filename}`, '_blank');
    };

    const handleDownload = async (filePath) => {
        if (!filePath) {
            message.warning('No resume file attached to this application');
            return;
        }
        try {
            // If it's a full URL or path, get just the filename
            const filename = filePath.includes('/') ? filePath.split('/').pop() : filePath;
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/image/pdf/download/${filename}`);

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            message.error('Failed to download file');
            console.error('Download error:', error);
        }
    };

    const columns = [
        {
            title: 'Info',
            key: 'info',
            render: (_, record) => (
                <div className="space-y-0.5">
                    <p className="font-normal text-gray-950 text-base">{record.name}</p>
                    <p className="text-sm font-medium text-[#7a6b00]">{record.phone || record.contactNo}</p>
                    <p className="text-xs text-gray-500">{record.address}</p>
                </div>
            ),
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
        },
        {
            title: 'Post Applied For',
            dataIndex: 'postAppliedFor',
            key: 'postAppliedFor',
            render: (_, record) => <span className="font-bold text-gray-800 text-sm uppercase tracking-tight">{record.careerTitle || record.postAppliedFor || <span className="text-gray-400 font-normal italic">Not specified</span>}</span>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => <span className="text-sm text-gray-700">{text}</span>
        },
        {
            title: 'Resume',
            key: 'resume',
            render: (_, record) => {
                // Fallback logic: check all known fields that might store the resume
                const resumePath = record.resumeFile || record.resumeUrl || record.resumeName || record.url;
                const hasResume = resumePath && (
                    resumePath.toLowerCase().endsWith('.pdf') ||
                    resumePath.toLowerCase().endsWith('.doc') ||
                    resumePath.toLowerCase().endsWith('.docx')
                );

                return hasResume ? (
                    <div className="flex gap-3 items-center">
                        <EyeOutlined
                            onClick={() => handleView(resumePath)}
                            className="text-green-600 cursor-pointer text-lg hover:scale-110 transition-transform"
                            title="View Resume"
                        />
                        <DownloadOutlined
                            onClick={() => handleDownload(resumePath)}
                            className="text-blue-600 cursor-pointer text-lg hover:scale-110 transition-transform"
                            title="Download Resume"
                        />
                    </div>
                ) : <span className="text-gray-400 italic text-xs">No Resume</span>;
            },
        },
        {
            title: 'Applied Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => <span className="text-xs font-semibold text-gray-500">{new Date(date).toLocaleDateString()}</span>,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex gap-4">
                    <FaEdit
                        className="text-green-500 cursor-pointer text-lg hover:text-green-700 transition"
                        onClick={() => handleEdit(record)}
                    />
                    <FaTrashAlt
                        className="text-red-500 cursor-pointer text-lg hover:text-red-700 transition"
                        onClick={() => handleDelete(record._id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="p-4">
            <div className="mb-4 text-sm text-gray-600 flex gap-2">
                <span
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate('/dashboard')}
                >
                    Dashboard
                </span>
                <span>/</span>
                <span>Career Applications</span>
            </div>

            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-semibold">Career List</h2>
                    {selectedRowKeys.length > 0 && (
                        <Button
                            danger
                            type="primary"
                            icon={<FaTrashAlt />}
                            onClick={handleBulkDelete}
                        >
                            Delete Selected ({selectedRowKeys.length})
                        </Button>
                    )}
                </div>
                <button
                    onClick={() => navigate('/career/application/add')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                    <PlusOutlined />
                    Add New Application
                </button>
            </div>

            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={applications?.data || []}
                loading={isLoading}
                rowKey="_id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} applications`,
                }}
                scroll={{ x: true }}
            />
        </div>
    );
};

export default CareerTable;




