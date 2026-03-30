import React, { useEffect, useMemo, useState } from 'react';
import { Breadcrumb, Button, Form, Input, message, Select, Spin, Switch } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useCreatePolicyMutation, useGetPolicyByIdQuery, useUpdatePolicyMutation } from '@/slice/policy/policy';

const POLICY_OPTIONS = [
  { label: 'Cookies Policy', value: 'cookies' },
  { label: 'Terms & Conditions', value: 'terms' },
  { label: 'Privacy Policy', value: 'privacy' },
];

const PolicyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data: policy, isLoading: isLoadingPolicy } = useGetPolicyByIdQuery(id, { skip: !id });
  const [createPolicy, { isLoading: isCreating }] = useCreatePolicyMutation();
  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();

  const [content, setContent] = useState('');

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image', 'video'],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ['clean'],
      ],
      clipboard: { matchVisual: false },
    }),
    []
  );

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'align',
    'color',
    'background',
  ];

  useEffect(() => {
    if (!policy) return;
    form.setFieldsValue({
      policyType: policy.policyType,
      title: policy.title,
      isActive: policy.isActive,
      content: policy.content,
    });
    setContent(policy.content || '');
  }, [policy, form]);

  const handleEditorChange = (html) => {
    setContent(html);
    form.setFieldsValue({ content: html });
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        policyType: values.policyType,
        title: values.title || '',
        content: values.content,
        isActive: values.isActive ?? true,
      };

      if (id) {
        await updatePolicy({ id, policyData: payload }).unwrap();
        message.success('Policy updated successfully');
      } else {
        await createPolicy(payload).unwrap();
        message.success('Policy created successfully');
      }

      navigate('/policy-table');
    } catch (error) {
      message.error(error?.data?.message || `Failed to ${id ? 'update' : 'create'} policy`);
    }
  };

  if (id && isLoadingPolicy) {
    return (
      <div className="p-6">
        <Spin />
      </div>
    );
  }

  return (
    <>
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <Link to="/dashboard">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/policy-table">Policies</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{id ? 'Edit Policy' : 'Create Policy'}</Breadcrumb.Item>
      </Breadcrumb>

      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isActive: true }}>
        <Form.Item
          name="policyType"
          label="Policy Type"
          rules={[{ required: true, message: 'Please select policy type' }]}
        >
          <Select options={POLICY_OPTIONS} placeholder="Select policy type" />
        </Form.Item>

        <Form.Item name="title" label="Title (optional)">
          <Input placeholder="Eg: Updated Jan 2026" />
        </Form.Item>

        <Form.Item name="isActive" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item
          name="content"
          label="Content"
          rules={[
            { required: true, message: 'Please enter policy content' },
            {
              validator: (_, value) => {
                const textContent = value?.replace(/<[^>]*>/g, '').trim();
                if (!textContent) return Promise.reject(new Error('Please enter policy content'));
                return Promise.resolve();
              },
            },
          ]}
        >
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleEditorChange}
            modules={modules}
            formats={formats}
            placeholder="Start typing..."
            style={{ height: '400px', marginBottom: '50px' }}
          />
        </Form.Item>

        <Form.Item>
          <div className="flex gap-2">
            <Button type="default" onClick={() => navigate('/policy-table')}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-6 py-2 bg-[#ffd333] text-[#1a1a1a] rounded-lg hover:bg-[#edc32f] transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {id ? 'Update' : 'Create'}
            </button>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};

export default PolicyForm;

