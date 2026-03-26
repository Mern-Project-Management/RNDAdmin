import React from "react";
import { Table, Button, Popconfirm, Space, Typography, Card } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useGetAllMenuListingsQuery, useDeleteMenuListingMutation } from "@/slice/menuListing/menuList";

const { Title } = Typography;

const MenuListingTable = () => {
  const { data, error, isLoading, refetch } = useGetAllMenuListingsQuery();
  const [deleteMenuListing] = useDeleteMenuListingMutation();
  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/menu-listing-form/${id}`);
  };

  const handleDelete = async (id) => {
    await deleteMenuListing(id);
    refetch(); // Refetch the data after deletion
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-700">Error: {error.message}</p>;

  const menuListings = data?.data || [];

  const formattedData = menuListings.map((menu) => ({
    key: menu._id,
    name: menu.parent.name,
    path: menu.parent.path,
    isParent: true, // Add this flag
    children: menu.children.length > 0 ? menu.children.map((child) => ({
      key: child._id,
      name: `└── ${child.name}`,
      path: child.path,
      isParent: false, // Add this flag
      children: child.subChildren?.length > 0 ? child.subChildren.map((sub) => ({
        key: sub._id,
        name: `    └── ${sub.name}`,
        path: sub.path,
        isParent: false, // Add this flag
      })) : undefined,
    })) : undefined,
  }));

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Path",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.key)}>
            <Button type="danger" shape="circle" icon={<DeleteOutlined />} />
          </Popconfirm>

          {!record.name.includes('└──') && (
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.key)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold">Menu Listings</h3>
        <Link to="/menu-listing-form">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
            <PlusOutlined />
            Add Menu
          </button>
        </Link>
      </div>

      <Table columns={columns} dataSource={formattedData} expandable={{ defaultExpandAllRows: false }} />
    </Card>
  );
};

export default MenuListingTable;
