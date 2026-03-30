import { useGetEmailCategoriesQuery, useDeleteEmailCategoryMutation } from '@/slice/emailCategory/emailCategory';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

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
                <Space>
                    <Button 
                        icon={<EditOutlined />}
                        className="text-green-600 hover:!text-green-900 !bg-green-50 hover:!bg-green-100 border-none flex items-center justify-center p-2"
                        title="Edit"
                        onClick={() => onEditClick(record)}
                    />
                    <Popconfirm
                        title="Are you sure you want to delete this category?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button 
                            icon={<DeleteOutlined />}
                            className="text-red-600 hover:!text-red-900 !bg-red-50 hover:!bg-red-100 border-none flex items-center justify-center p-2"
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
