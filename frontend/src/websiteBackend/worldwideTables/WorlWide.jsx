import React from 'react';
import { Table, Space, Breadcrumb, Modal, Button } from 'antd';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useGetAllWorldwideQuery, useDeleteWorldwideMutation } from '../../slice/worldwide/worldwide';
import { useNavigate } from 'react-router-dom';

const WorldWideBackend = () => {
    const navigate = useNavigate();
    const { data: worldwideData, isLoading } = useGetAllWorldwideQuery();
    const [deleteWorldwide] = useDeleteWorldwideMutation();

    const internationalData = worldwideData?.data?.filter(item => item.category === 'international') || [];
    const indianData = worldwideData?.data?.filter(item => item.category === 'india') || [];

    const handleEdit = (record) => {
        navigate(`/worldwide/edit/${record._id}`);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this location?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteWorldwide(id).unwrap();
                    Modal.success({
                        content: 'Location deleted successfully!',
                    });
                } catch (error) {
                    Modal.error({
                        title: 'Delete Failed',
                        content: error.message || 'Something went wrong',
                    });
                }
            },
        });
    };

    const iconClass = 'cursor-pointer text-xl';
    const internationalColumns = [
        {
            title: 'Country Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <FaEdit 
                        className={`${iconClass} text-green-500 hover:text-green-700`} 
                        onClick={() => handleEdit(record)} 
                    />
                    <FaTrashAlt 
                        className={`${iconClass} text-red-500 hover:text-red-700`} 
                        onClick={() => handleDelete(record._id)} 
                    />
                </Space>
            ),
        },
    ];

    const indianColumns = [
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
        },
        {
            title: 'Cities',
            dataIndex: 'cities',
            key: 'cities',
            render: (cities) => cities.join(', ')
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <FaEdit 
                        className={`${iconClass} text-green-500 hover:text-green-700`} 
                        onClick={() => handleEdit(record)} 
                    />
                    <FaTrashAlt 
                        className={`${iconClass} text-red-500 hover:text-red-700`} 
                        onClick={() => handleDelete(record._id)} 
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Breadcrumb
                    items={[
                        { 
                            title: <span onClick={() => navigate('/dashboard')} className="cursor-pointer text-blue-600 hover:underline">Dashboard</span>
                        },
                        { title: 'Worldwide Locations' }
                    ]}
                />

                <Button 
                    type="primary" 
                    onClick={() => navigate('/worldwide/add')}
                >
                    Add New Location
                </Button>
            </div>

            <h2 className="text-2xl font-semibold mb-3">International Locations</h2>
            <Table 
                columns={internationalColumns}
                dataSource={internationalData}
                loading={isLoading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
            />

            <h2 className="text-2xl font-semibold mb-3 mt-8">Indian Locations</h2>
            <Table 
                columns={indianColumns}
                dataSource={indianData}
                loading={isLoading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default WorldWideBackend;
