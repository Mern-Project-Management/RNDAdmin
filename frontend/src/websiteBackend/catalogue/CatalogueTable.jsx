import React from 'react';
import { useGetAllCataloguesQuery, useDeleteCatalogueMutation } from "@/slice/catalogue/catalogueslice";
import { Table, Button, Space, message, Breadcrumb } from 'antd';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate, Link } from 'react-router-dom';

const CatalogueTable = () => {
  const navigate = useNavigate();
  const { data: catalogues, isLoading } = useGetAllCataloguesQuery();
  const [deleteCatalogue] = useDeleteCatalogueMutation();

  const handleDelete = async (id) => {
    try {
      await deleteCatalogue(id).unwrap();
      message.success('Catalogue deleted successfully');
    } catch (error) {
      message.error('Failed to delete catalogue');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Catalogue',
      dataIndex: 'catalogue',
      key: 'catalogue',
      render: (catalogue) => <Link to={`/api/image/pdf/view/${catalogue}`} target="_blank" rel="noopener noreferrer">Download</Link>,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => <img src={`/api/image/view/${image}`} alt="Catalogue Image" className='w-[100px]' />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <FaEdit
            className="text-green-500 cursor-pointer text-lg hover:text-green-700 transition-colors"
            onClick={() => navigate(`/edit-catalogue/${record._id}`)}
          />
          <FaTrashAlt
            className="text-red-500 cursor-pointer text-lg hover:text-red-700 transition-colors"
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <Breadcrumb className='mb-4'>
        <Breadcrumb.Item>
          <Link to="/dashboard">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Catalogue Table</Breadcrumb.Item>
      </Breadcrumb>
      <div className="flex justify-between items-center mb-3">
        <h1 className='font-bold text-2xl'>Catalogue Table</h1>
        <Button
          type="primary"
          onClick={() => navigate('/catalogue-form')}
        >
          Add Catalogue
        </Button>
      </div>
      <Table columns={columns} dataSource={catalogues} rowKey="_id" />
    </>
  );
};

export default CatalogueTable;
