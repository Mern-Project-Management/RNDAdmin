import React from 'react';
import { Table, Button, Space, message, Breadcrumb, Popconfirm } from 'antd';
import { PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useGetAllCoreValuesQuery, useDeleteCoreValueMutation } from '../../slice/coreValue/coreValue';
import { useNavigate, Link } from 'react-router-dom';

const CoreValueTable = () => {
  const navigate = useNavigate();
  const { data: coreValueData, isLoading } = useGetAllCoreValuesQuery();
  const [deleteCoreValue] = useDeleteCoreValueMutation();

  const handleDelete = async (id) => {
    try {
      await deleteCoreValue(id);
      message.success('Core Value deleted successfully');
    } catch (error) {
      message.error('Failed to delete Core Value');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: '20%',
      render: (image) => (
        <img
        src={`/api/image/download/${image}`}
        alt="Core Value"
        className="w-36 h-12 object-contain"
      />
      
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
    },
    {
      title: 'details',
      dataIndex: 'details',
      key: 'details',
      width: '30%',
      render: (text) => <div dangerouslySetInnerHTML={{ __html: text?.substring(0, 50) + '...' }} />
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Space size="middle">
          <FaEdit 
            className="text-green-500 cursor-pointer text-lg hover:text-green-700 transition-colors"
            onClick={() => navigate(`/edit-core-value/${record._id}`)}
          />
          <Popconfirm
            title="Delete Core Value"
            details="Are you sure you want to delete this core value?"
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
      <Breadcrumb className='px-4 py-6'>
        <Breadcrumb.Item>
          <Link to="/dashboard">
            <HomeOutlined /> Dashboard
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Core Value Management</Breadcrumb.Item>
      </Breadcrumb>
      
      <div className='p-6 flex justify-between items-center'>
        <div className='text-2xl font-bold'>
          <h1>Core Value Management</h1>   
        </div>
        <div>
          <Button 
            icon={<PlusOutlined />}
            onClick={() => navigate('/add-core-value')}
            className='mb-4 bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold'
          >
            Add New Core Value
          </Button>
        </div>
      </div>
      <Table 
        columns={columns} 
        dataSource={coreValueData} 
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default CoreValueTable;
