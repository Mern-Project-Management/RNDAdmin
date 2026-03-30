import { useState } from 'react';
import { Card, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import EmailCategoryTable from './EmailCategory';
import EmailCategoryForm from './emailCategoryForm';

const EmailCategoryParent = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const handleAddNew = () => {
        setEditingCategory(null);
        setIsModalVisible(true);
    };

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setEditingCategory(null);
    };

    return (
        <Card title="Email Categories">
            <Button 
                icon={<PlusOutlined />} 
                onClick={handleAddNew}
                className="mb-4 bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold"
            >
                Add New Category
            </Button>

            <EmailCategoryTable onEditClick={handleEditClick} />

            {isModalVisible && (
                <EmailCategoryForm
                    visible={isModalVisible}
                    onClose={handleModalClose}
                    editingCategory={editingCategory}
                />
            )}
        </Card>
    );
};

export default EmailCategoryParent;
