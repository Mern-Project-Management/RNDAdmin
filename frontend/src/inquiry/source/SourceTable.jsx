import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useGetAllSourcesQuery, useDeleteSourceMutation, useUpdateSourceMutation } from '@/slice/source/source';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { SourceForm } from './AddSource';
import { Table, Breadcrumb, Popconfirm, Space } from 'antd';
import { HomeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const SourceTable = () => {
  const { data: sourcesResponse, isLoading, isError } = useGetAllSourcesQuery();
  const [deleteSource] = useDeleteSourceMutation();
  const [updateSource] = useUpdateSourceMutation();
  const [sourceToEdit, setSourceToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // New state to control edit modal
  const sources = sourcesResponse?.data;

  const handleDelete = async (id) => {
    try {
      await deleteSource(id).unwrap();
      alert('Source deleted successfully!');
    } catch (error) {
      alert('Failed to delete source.');
    }
  };

  const handleEdit = (source) => {
    setSourceToEdit(source);
    setIsEditModalOpen(true); // Open the edit modal
  };

  const handleCloseModal = () => {
    setSourceToEdit(null);
    setIsEditModalOpen(false); // Close the edit modal
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(record)}
            className="w-8 h-8 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Delete Source"
            description="Are you sure you want to delete this source?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching sources.</div>;

  return (
    <div className="p-6">
      <Breadcrumb className='mb-6'>
        <Breadcrumb.Item>
          <Link to="/dashboard">
            <HomeOutlined /> Dashboard
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Inquiry Management</Breadcrumb.Item>
        <Breadcrumb.Item>Source List</Breadcrumb.Item>
      </Breadcrumb>

      <div className="bg-white rounded-lg shadow mt-4 p-6 w-full max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Source List</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Add Source
              </Button>
            </DialogTrigger>
            <SourceForm closeModal={handleCloseModal} />
          </Dialog>
        </div>

        <Table
          columns={columns}
          dataSource={sources}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          className="border border-gray-100 rounded-md"
        />

        {/* Edit Modal - now controlled by isEditModalOpen */}
        <Dialog open={isEditModalOpen} onOpenChange={handleCloseModal}>
          <SourceForm
            closeModal={handleCloseModal}
            sourceToEdit={sourceToEdit}
          />
        </Dialog>
      </div>
    </div>
  );
};

export default SourceTable;