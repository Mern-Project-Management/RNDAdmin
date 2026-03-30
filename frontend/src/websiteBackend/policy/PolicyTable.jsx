import React from 'react';
import { Table, Button, Space, message, Breadcrumb, Tag, Popconfirm } from 'antd';
import { PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate, Link } from 'react-router-dom';
import { useDeletePolicyMutation, useGetAllPoliciesQuery } from '@/slice/policy/policy';

const POLICY_TYPE_LABEL = {
  cookies: 'Cookies Policy',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
};

const PolicyTable = () => {
  const navigate = useNavigate();
  const { data: policies, isLoading } = useGetAllPoliciesQuery();
  const [deletePolicy, { isLoading: isDeleting }] = useDeletePolicyMutation();

  const handleDelete = async (id) => {
    try {
      await deletePolicy(id).unwrap();
      message.success('Policy deleted successfully');
    } catch (error) {
      message.error(error?.data?.message || 'Failed to delete policy');
    }
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'policyType',
      key: 'policyType',
      width: '20%',
      render: (type) => POLICY_TYPE_LABEL[type] || type,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      render: (value) => value || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '15%',
      render: (isActive) => (isActive ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '20%',
      render: (updatedAt) => (updatedAt ? new Date(updatedAt).toLocaleString() : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space size="middle">
          <FaEdit
            className="text-green-500 cursor-pointer text-lg hover:text-green-700 transition-colors"
            onClick={() => navigate(`/edit-policy/${record._id}`)}
            title="Edit"
          />
          <Popconfirm
            title="Delete policy?"
            onConfirm={() => handleDelete(record._id)}
            okButtonProps={{ danger: true, loading: isDeleting }}
          >
            <FaTrashAlt 
              className="text-red-500 cursor-pointer text-lg hover:text-red-700 transition-colors"
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb className="px-4 py-6">
        <Breadcrumb.Item>
          <Link to="/dashboard">
            <HomeOutlined /> Dashboard
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Policy Management</Breadcrumb.Item>
      </Breadcrumb>

      <div className="p-6 flex justify-between items-center">
        <div className="text-2xl font-bold">
          <h1>Policies</h1>
        </div>
        <div>
          <button
            onClick={() => navigate('/policy-form')}
            className="mb-4 bg-[#ffd333] text-[#1a1a1a] px-4 py-2 rounded-lg hover:bg-[#edc32f] transition font-semibold flex items-center gap-2"
          >
            <PlusOutlined /> Add Policy
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={policies || []}
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
};

export default PolicyTable;

