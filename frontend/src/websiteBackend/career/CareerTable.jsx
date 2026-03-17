import React from 'react';
import { Table, Modal, message, Button } from 'antd';
import { EditOutlined, DeleteOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
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

    const handleDownload = async (filePath) => {
        if (!filePath) {
            message.warning('No resume file attached to this application');
            return;
        }
        try {
            // If it's a full URL or path, get just the filename
            const filename = filePath.includes('/') ? filePath.split('/').pop() : filePath;
            const response = await fetch(`/api/image/pdf/download/${filename}`);

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
                <div>
                    <p className="font-semibold">{record.name}</p>
                    <p>{record.contactNo}</p>
                    <p className="text-gray-500">{record.address}</p>
                </div>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
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
                    <DownloadOutlined
                        onClick={() => handleDownload(resumePath)}
                        className="text-blue-600 cursor-pointer"
                    />
                ) : <span className="text-gray-400 italic">No Resume</span>;
            },
        },
        {
            title: 'Applied Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex gap-3">
                    <EditOutlined
                        className="text-blue-600 cursor-pointer"
                        onClick={() => handleEdit(record)}
                    />
                    <DeleteOutlined
                        className="text-red-500 cursor-pointer"
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
                            icon={<DeleteOutlined />} 
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
