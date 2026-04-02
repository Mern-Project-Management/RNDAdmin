import React from 'react';
import { Table, Button, Space, message, Breadcrumb, Tag } from 'antd';
import { PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useGetAllCategoriesQuery, useDeleteCategoryMutation } from '../../slice/lifeAtRnd/lifeAtRndCategory';
import { useNavigate, Link } from 'react-router-dom';

const CategoryTable = () => {
  const navigate = useNavigate();
  const { data: categoryData, isLoading } = useGetAllCategoriesQuery();
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id).unwrap();
      message.success('Category deleted successfully');
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  const columns = [
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: '10%',
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'Published' : 'Draft'}
        </Tag>
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
            onClick={() => navigate(`/life-at-rnd/edit-category/${record._id}`)}
          />
          <FaTrashAlt 
            className="text-red-500 cursor-pointer text-lg hover:text-red-700 transition-colors"
            onClick={() => handleDelete(record._id)}
          />
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
        <Breadcrumb.Item>Life at RND Categories</Breadcrumb.Item>
      </Breadcrumb>
      
      <div className='p-6 flex justify-between items-center'>
        <div className='text-2xl font-bold'>
          <h1>Life at RND Category Management</h1>   
        </div>
        <div>
          <Button 
            icon={<PlusOutlined />}
            onClick={() => navigate('/life-at-rnd/add-category')}
            className='mb-4 bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold'
          >
            Add New Category
          </Button>
        </div>
      </div>
      <Table 
        columns={columns} 
        dataSource={categoryData} 
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default CategoryTable;
