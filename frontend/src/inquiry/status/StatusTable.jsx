import React, { useState } from 'react';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { useGetAllStatusesQuery, useDeleteStatusMutation } from '@/slice/status/status';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StatusForm } from './AddStatus';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Table, Breadcrumb, Popconfirm, Space } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Link } from 'react-router-dom';

const StatusTable = () => {
  const { data: statusesResponse, isLoading, isError } = useGetAllStatusesQuery();
  const [deleteStatus] = useDeleteStatusMutation(); // Hook for delete mutation
  const [statusToEdit, setStatusToEdit] = useState(null); // Track the status being edited
  const statuses = statusesResponse?.data;

  const handleDelete = async (id) => {
    try {
      await deleteStatus(id).unwrap(); // Perform the delete operation
      alert('Status deleted successfully!');
    } catch (error) {
      alert('Failed to delete status.');
    }
  };

  const handleEdit = (status) => {
    console.log(status)
    setStatusToEdit(status);  // Set the status being edited
  };

  const handleCloseModal = () => {
    setStatusToEdit(null);  // Clear the statusToEdit when modal is closed
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space size="middle">
          <FaEdit
            className="text-green-500 cursor-pointer text-lg hover:text-green-700 transition"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete Status"
            description="Are you sure you want to delete this status?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <FaTrashAlt 
              className="text-red-500 cursor-pointer text-lg hover:text-red-700 transition"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching statuses.</div>;

  return (
    <div className="p-6">
      <Breadcrumb className='mb-6'>
        <Breadcrumb.Item>
          <Link to="/dashboard">
            <HomeOutlined /> Dashboard
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Inquiry Management</Breadcrumb.Item>
        <Breadcrumb.Item>Status List</Breadcrumb.Item>
      </Breadcrumb>

      <div className="bg-white rounded-lg shadow mt-4 p-6 w-full max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Status List</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Add Status
              </Button>
            </DialogTrigger>
            <StatusForm closeModal={handleCloseModal} />
          </Dialog>
        </div>

        <Table
          columns={columns}
          dataSource={statuses}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          className="border border-gray-100 rounded-md"
        />

        {statusToEdit && (
          <Dialog open={true} onOpenChange={handleCloseModal}>
            <StatusForm closeModal={handleCloseModal} statusToEdit={statusToEdit} />
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default StatusTable;
