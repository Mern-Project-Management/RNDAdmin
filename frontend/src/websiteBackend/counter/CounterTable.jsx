import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Breadcrumb, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CounterTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCounters = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/counter/getCounters", { withCredentials: true });
      setData(response.data);
    } catch (error) {
      message.error("Failed to fetch counters");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounters();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/counter/deleteCounter?id=${id}`, { withCredentials: true });
      message.success('Counter deleted successfully');
      fetchCounters();
    } catch (error) {
      message.error('Failed to delete counter');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Sign',
      dataIndex: 'sign',
      key: 'sign',
    },
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <EditOutlined 
            className="text-green-500 cursor-pointer text-lg hover:text-green-700 transition-colors"
            onClick={() => navigate(`/edit-counter/${record._id}`)}
          />
          <Popconfirm
            title="Are you sure to delete this counter?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined 
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
        <Breadcrumb.Item>Counter Management</Breadcrumb.Item>
      </Breadcrumb>
      
      <div className='p-6 flex justify-between items-center'>
        <div className='text-2xl font-bold'>
          <h1>Counter Management</h1>   
        </div>
        <div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/add-counter')}
            className='mb-4'
          >
            Add New Counter
          </Button>
        </div>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default CounterTable;
