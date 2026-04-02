import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Button, message, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation, 
  useGetCategoryByIdQuery 
} from '../../slice/lifeAtRnd/lifeAtRndCategory';

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm();

  const { data: categoryData, isLoading: isFetching } = useGetCategoryByIdQuery(id, { skip: !isEdit });
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  useEffect(() => {
    if (categoryData) {
      form.setFieldsValue(categoryData);
    }
  }, [categoryData, form]);

  const onFinish = async (values) => {
    try {
      if (isEdit) {
        await updateCategory({ id, data: values }).unwrap();
        message.success('Category updated successfully');
      } else {
        await createCategory(values).unwrap();
        message.success('Category created successfully');
      }
      navigate('/life-at-rnd/categories');
    } catch (error) {
      message.error('Failed to save category');
      console.error(error);
    }
  };

  return (
    <div>
      <Breadcrumb className="px-4 py-6">
        <Breadcrumb.Item>
          <Link to="/dashboard">
            <HomeOutlined /> Dashboard
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/life-at-rnd/categories">Life at RND Categories</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{isEdit ? 'Edit' : 'Add'} Category</Breadcrumb.Item>
      </Breadcrumb>

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit' : 'Add'} Life at RND Category</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: true, priority: 0 }}
          className="max-w-2xl"
        >
          <Form.Item
            label="Category Name"
            name="name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="e.g., Office Life, Team Events" />
          </Form.Item>

          <Form.Item label="Priority" name="priority">
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Published" unCheckedChildren="Draft" />
          </Form.Item>

          <Form.Item className="mt-8">
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating || isUpdating}
              className="bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none px-8 font-normal"
            >
              {isEdit ? 'Update' : 'Add'} Category
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CategoryForm;
