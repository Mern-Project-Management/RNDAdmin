import React from 'react';
import { Table, Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useGetAllCompanyItemsQuery, useDeleteCompanyItemMutation } from '../../slice/companyItemSlice';
import { useNavigate } from 'react-router-dom';

const CompanyItemTable = () => {
    const navigate = useNavigate();
    const { data: companyItems, isLoading } = useGetAllCompanyItemsQuery();
    const [deleteCompanyItem] = useDeleteCompanyItemMutation();

    const handleDelete = async (id) => {
        try {
            await deleteCompanyItem(id).unwrap();
            message.success('Company item deleted successfully');
        } catch (error) {
            message.error('Failed to delete company item');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
        },
        {
            title: 'Link',
            dataIndex: 'link',
            key: 'link',
            width: '25%',
        },
        {
            title: 'Order',
            dataIndex: 'order',
            key: 'order',
            width: '10%',
            sorter: (a, b) => a.order - b.order,
        },
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            width: '15%',
            render: (image) => (
                <img
                    src={`/api/image/download/${image}`}
                    alt="Company Item"
                    className='w-[80px] h-[50px] object-cover rounded shadow-sm'
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '15%',
            render: (_, record) => (
                <Space size="middle">
                    <FaEdit
                        className="text-green-500 cursor-pointer text-lg hover:text-green-700 transition-colors"
                        onClick={() => navigate(`/edit-company-item/${record._id}`)}
                    />
                    <Popconfirm
                        title="Delete the item"
                        description="Are you sure to delete this item?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <FaTrashAlt 
                            className="text-red-500 cursor-pointer text-lg hover:text-red-700 transition-colors"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className='flex justify-between p-6 items-center'>
                <div className='text-2xl font-bold'>
                    <h1>Company</h1>
                </div>
                <div>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/add-company-item')}
                        className='mb-4 bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold'
                    >
                        Add Company Item
                    </Button>
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={companyItems}
                loading={isLoading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                className="border border-gray-100 rounded-lg overflow-hidden"
            />
        </div>
    );
};

export default CompanyItemTable;
