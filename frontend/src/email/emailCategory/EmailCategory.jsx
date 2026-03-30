import { useGetEmailCategoriesQuery, useDeleteEmailCategoryMutation } from '@/slice/emailCategory/emailCategory';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const EmailCategoryTable = ({ onEditClick }) => {
    const { data: categories, isLoading } = useGetEmailCategoriesQuery();
    const [deleteCategory] = useDeleteEmailCategoryMutation();

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
            title: 'Category Name',
            dataIndex: 'emailCategory',
            key: 'emailCategory',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <FaEdit 
                        className="text-green-500 cursor-pointer text-lg hover:text-green-700 transition"
                        title="Edit"
                        onClick={() => onEditClick(record)}
                    />
                    <Popconfirm
                        title="Are you sure you want to delete this category?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <FaTrashAlt 
                            className="text-red-500 cursor-pointer text-lg hover:text-red-700 transition"
                            title="Delete"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={categories}
            rowKey="_id"
            loading={isLoading}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
            }}
        />
    );
};

export default EmailCategoryTable;
