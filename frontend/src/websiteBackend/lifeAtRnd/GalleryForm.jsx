import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Switch, Button, Upload, message, Breadcrumb, Card } from 'antd';
import { HomeOutlined, UploadOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useGetAllCategoriesQuery } from '../../slice/lifeAtRnd/lifeAtRndCategory';
import { 
  useCreateGalleryItemMutation, 
  useUpdateGalleryItemMutation,
  useGetGalleryByIdQuery,
  useGetGalleryByCategoryIdQuery,
  useDeleteGalleryItemMutation
} from '../../slice/lifeAtRnd/lifeAtRndGallery';

const { Option } = Select;

const GalleryForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const categoryIdParam = queryParams.get('categoryId');
  
  const isEdit = !!id;
  const isBulkEdit = !!categoryIdParam;
  
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  
  const { data: categories, isLoading: isLoadingCats } = useGetAllCategoriesQuery();
  const { data: itemData } = useGetGalleryByIdQuery(id, { skip: !isEdit });
  const { data: bulkItemData, refetch: refetchBulk } = useGetGalleryByCategoryIdQuery(categoryIdParam, { skip: !isBulkEdit });
  
  const [createGalleryItem, { isLoading: isCreating }] = useCreateGalleryItemMutation();
  const [updateGalleryItem, { isLoading: isUpdating }] = useUpdateGalleryItemMutation();
  const [deleteGalleryItem] = useDeleteGalleryItemMutation();

  useEffect(() => {
    if (isEdit && itemData) {
      form.setFieldsValue({
        category_id: itemData.category_id?._id || itemData.category_id,
        title: itemData.title,
        status: itemData.status,
        subtitle: itemData.category_id?.subtitle || '',
        category_title: itemData.category_id?.title || '',
        description: itemData.category_id?.description || ''
      });
    } else if (isBulkEdit && categories) {
      const selectedCat = categories.find(c => c._id === categoryIdParam);
      if (selectedCat) {
        form.setFieldsValue({
          category_id: categoryIdParam,
          subtitle: selectedCat.subtitle || '',
          category_title: selectedCat.title || '',
          description: selectedCat.description || ''
        });
      }
    }
  }, [isEdit, itemData, isBulkEdit, categories, categoryIdParam, form]);

  const onCategoryChange = (catId) => {
    const selectedCat = categories?.find(c => c._id === catId);
    if (selectedCat) {
      form.setFieldsValue({
        subtitle: selectedCat.subtitle || '',
        category_title: selectedCat.title || '',
        description: selectedCat.description || ''
      });
    }
  };

  const handleUpdateItem = async (itemId, currentTitle, currentStatus) => {
    try {
      const formData = new FormData();
      formData.append('title', currentTitle);
      formData.append('status', currentStatus === false ? 'false' : 'true');
      formData.append('category_id', form.getFieldValue('category_id'));
      
      await updateGalleryItem({ id: itemId, formData }).unwrap();
      message.success('Item updated');
      if (isBulkEdit) refetchBulk();
    } catch (err) {
      message.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await deleteGalleryItem(itemId).unwrap();
      message.success('Item deleted');
      if (isBulkEdit) refetchBulk();
    } catch (err) {
      message.error('Failed to delete item');
    }
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append('category_id', values.category_id);
      formData.append('status', values.status === false ? 'false' : 'true');
      formData.append('subtitle', values.subtitle || '');
      formData.append('category_title', values.category_title || '');
      formData.append('description', values.description || '');

      if (isEdit) {
        formData.append('title', values.title || '');
        if (fileList.length > 0) {
          formData.append('image', fileList[0].originFileObj || fileList[0]);
        }
        await updateGalleryItem({ id, formData }).unwrap();
        message.success('Updated successfully');
      } else {
        if (fileList.length > 0) {
          fileList.forEach(file => {
            const fileToUpload = file.originFileObj || file;
            formData.append('image', fileToUpload);
            const imgTitle = values[`title_${file.uid}`] || values.title || '';
            formData.append('titles', imgTitle);
          });
          await createGalleryItem(formData).unwrap();
          message.success('Added successfully');
        } else if (isBulkEdit) {
          // Just updating category metadata
          await createGalleryItem(formData).unwrap(); // The backend will update category metadata even if no files
          message.success('Section updated');
        }
      }
      navigate('/life-at-rnd/gallery');
    } catch (error) {
      message.error('Failed to save');
      console.error(error);
    }
  };

  const uploadProps = {
    onRemove: (file) => setFileList(prev => prev.filter(item => item.uid !== file.uid)),
    beforeUpload: (file) => { setFileList(prev => [...prev, file]); return false; },
    fileList,
    multiple: true,
    accept: "image/*",
    listType: "picture",
    showUploadList: false
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-12">
      <Breadcrumb className="px-6 py-6 font-normal">
        <Breadcrumb.Item>
          <Link to="/dashboard" className="text-gray-400">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/life-at-rnd/gallery" className="text-gray-400">Life at RND Gallery</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item className="text-gray-800">{isEdit || isBulkEdit ? 'Edit' : 'Add'} Gallery</Breadcrumb.Item>
      </Breadcrumb>

      <div className="px-6">
        <h1 className="text-2xl text-[#1a1a1a] mb-6 font-normal">
          {isBulkEdit ? `Manage "${categories?.find(c => c._id === categoryIdParam)?.name}" Gallery` : `${isEdit ? 'Edit' : 'Add'} Life at RND Gallery`}
        </h1>
        
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: true }} className="max-w-5xl">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mb-6">
            <h2 className="text-sm text-gray-400 uppercase tracking-widest mb-6 font-normal">Section Settings</h2>
            
            <Form.Item label="Select Category" name="category_id" rules={[{ required: true }]}>
              <Select size="large" onChange={onCategoryChange} disabled={isBulkEdit}>
                {categories?.map(cat => <Option key={cat._id} value={cat._id}>{cat.name}</Option>)}
              </Select>
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Section Subtitle" name="subtitle">
                <Input size="large" />
              </Form.Item>
              <Form.Item label="Section Heading" name="category_title">
                <Input size="large" />
              </Form.Item>
            </div>

            <Form.Item label="Section Description" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item label="Section Status" name="status" valuePropName="checked">
              <Switch checkedChildren="Published" unCheckedChildren="Draft" />
            </Form.Item>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mb-6">
            <h2 className="text-sm text-gray-400 uppercase tracking-widest mb-6 font-normal">Gallery Images</h2>
            
            <div className="space-y-8">
              {/* Existing Images Section */}
              {isBulkEdit && bulkItemData?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs text-gray-400 uppercase tracking-wider">Already in Category ({bulkItemData.length})</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {bulkItemData.map((item) => (
                      <div key={item._id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 items-center">
                        <img src={`/api/image/download/${item.image}`} className="w-20 h-20 object-cover rounded-lg border" alt="" />
                        <div className="flex-grow">
                          <Input 
                            defaultValue={item.title} 
                            placeholder="Caption for this image" 
                            onBlur={(e) => handleUpdateItem(item._id, e.target.value, item.status)}
                            className="mb-2"
                          />
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] text-gray-400 italic">Captions save automatically when you click away.</span>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              className="p-0 h-auto"
                              onClick={() => handleDeleteItem(item._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Section */}
              <div className="pt-4 border-t border-gray-50">
                <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Add New Photos</h3>
                <Upload {...uploadProps}>
                  <Button size="large" icon={<UploadOutlined />} className="w-full h-16 border-dashed rounded-xl font-normal">
                    Drag or Click to Select Gallery Files
                  </Button>
                </Upload>

                {!isEdit && fileList.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <p className="text-xs text-yellow-600 font-medium">Newly Selected Images ({fileList.length})</p>
                    {fileList.map((file) => (
                      <div key={file.uid} className="flex gap-4 p-4 bg-yellow-50/20 rounded-xl border border-yellow-100 items-center">
                        <img src={URL.createObjectURL(file.originFileObj || file)} className="w-20 h-20 object-cover rounded-lg border border-yellow-100" alt="" />
                        <div className="flex-grow">
                          <Form.Item name={`title_${file.uid}`} noStyle>
                            <Input placeholder="Enter caption for upload..." className="mb-1" />
                          </Form.Item>
                          <div className="text-right">
                             <Button type="link" danger size="small" onClick={() => setFileList(prev => prev.filter(f => f.uid !== file.uid))}>Remove</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating || isUpdating}
              className="bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none px-12 h-12 rounded-xl"
            >
              Save All Changes
            </Button>
            <Button onClick={() => navigate('/life-at-rnd/gallery')} className="h-12 border-none text-gray-500 font-medium">
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default GalleryForm;
