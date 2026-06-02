import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, ConfigProvider, Modal, Form, Input, Select, Tag, Space } from "antd";
import { ArrowRight, Edit3, Trash2, Plus, Zap } from "lucide-react";
import axios from "axios";

const { Option } = Select;

const Redirects = () => {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/redirect");
      if (response.data && response.data.success) {
        setRedirects(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching redirects", error);
      message.error("Failed to load redirects");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/redirect/${id}`);
      message.success("Redirect deleted successfully!");
      fetchRedirects();
    } catch (error) {
      console.error("Delete error", error);
      message.error("Failed to delete redirect");
    }
  };

  const showModal = (record = null) => {
    if (record) {
      setEditingId(record._id);
      form.setFieldsValue({
        sourceUrl: record.sourceUrl,
        targetUrl: record.targetUrl,
        statusCode: record.statusCode,
        isActive: record.isActive
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ statusCode: 301, isActive: true });
    }
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editingId) {
          await axios.put(`/api/redirect/${editingId}`, values);
          message.success("Redirect updated successfully");
        } else {
          await axios.post("/api/redirect", values);
          message.success("Redirect created successfully");
        }
        setIsModalVisible(false);
        fetchRedirects();
      } catch (error) {
        console.error("Save error", error);
        message.error("Failed to save redirect");
      }
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "SOURCE URL",
      dataIndex: "sourceUrl",
      key: "sourceUrl",
      render: text => <span className="font-medium text-gray-800">{text}</span>
    },
    {
      title: "TARGET URL",
      dataIndex: "targetUrl",
      key: "targetUrl",
      render: text => <span className="text-gray-500">{text}</span>
    },
    {
      title: "CODE",
      dataIndex: "statusCode",
      key: "statusCode",
      render: code => (
        <Tag color={code === 301 ? "green" : "orange"} className="rounded-full px-3">
          {code}
        </Tag>
      )
    },
    {
      title: "STATUS",
      dataIndex: "isActive",
      key: "isActive",
      render: isActive => (
        <div className="flex items-center gap-1.5 text-sm">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={isActive ? 'text-green-600' : 'text-red-500 font-medium'}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
    {
      title: "HITS",
      dataIndex: "hits",
      key: "hits",
      render: hits => (
        <div className="flex items-center gap-1 font-bold text-gray-700">
          <Zap size={14} className="text-[#ffd333]" fill="#ffd333" />
          <span>{hits}</span>
        </div>
      )
    },
    {
      title: "ACTIONS",
      key: "actions",
      render: (_, record) => (
        <Space size="middle" className="text-gray-400">
          <Edit3
            size={18}
            className="cursor-pointer hover:text-[#ffd333] transition-colors"
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Are you sure to delete this redirect?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ style: { backgroundColor: '#ffd333', color: '#1a1a1a', borderColor: '#ffd333' } }}
          >
            <Trash2 
              size={18}
              className="cursor-pointer hover:text-red-500 transition-colors"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Get current date string
  const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  const todayString = new Date().toLocaleDateString('en-US', dateOptions).replace(/,/g, '');

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ffd333',
        },
        components: {
          Table: {
            headerBg: '#fafafa',
            headerColor: '#6b7280',
            rowHoverBg: '#f9f9f9',
            headerBorderRadius: 0,
          },
        }
      }}
    >
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Header Widget */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#fff9e6] text-[#e69b00] flex items-center justify-center">
              <ArrowRight size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Redirects</h2>
              <p className="text-gray-500 text-sm">Manage URL redirects and track hit counts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 text-sm font-medium">
              {todayString}
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          
          <div className="p-4 flex justify-between items-center border-b border-gray-50">
            <div className="text-gray-600 font-medium text-sm">
              Total {redirects.length} <span className="text-gray-400 mx-2">|</span> Active {redirects.filter(r => r.isActive).length}
            </div>
            <Button 
              className="bg-[#ffd333] hover:bg-[#edc32f] text-[#1a1a1a] font-medium border-none flex items-center gap-2 h-9 px-4 rounded-md shadow-sm"
              onClick={() => showModal()}
            >
              <Plus size={16} /> New Redirect
            </Button>
          </div>

          <Table 
            columns={columns} 
            dataSource={redirects} 
            rowKey="_id" 
            loading={loading}
            pagination={{ pageSize: 10, className: "px-4 mb-4 mt-2" }}
            className="custom-redirects-table"
          />
        </div>
      </div>

      <Modal
        title={editingId ? "Edit Redirect" : "Create New Redirect"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingId ? "Update Redirect" : "Save Redirect"}
        okButtonProps={{ className: "bg-[#ffd333] text-[#1a1a1a] border-none font-medium" }}
        cancelButtonProps={{ className: "border-gray-200 text-gray-600 hover:text-gray-800 hover:border-gray-300" }}
        width={500}
      >
        <Form layout="vertical" form={form} className="mt-4">
          <Form.Item 
            name="sourceUrl" 
            label={<span className="font-medium text-gray-700"><span className="text-red-500 mr-1">*</span>Source URL</span>}
            rules={[{ required: true, message: 'Please enter source URL' }]}
            extra={<span className="text-xs text-gray-400">The old URL path (e.g. /pricing)</span>}
          >
            <Input placeholder="/old-page" className="rounded-md" />
          </Form.Item>

          <Form.Item 
            name="targetUrl" 
            label={<span className="font-medium text-gray-700"><span className="text-red-500 mr-1">*</span>Target URL</span>}
            rules={[{ required: true, message: 'Please enter target URL' }]}
            extra={<span className="text-xs text-gray-400">The new destination path (e.g. /rates-locations)</span>}
          >
            <Input placeholder="/new-page" className="rounded-md" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <Form.Item name="statusCode" label="Status Code">
              <Select className="w-full">
                <Option value={301}>301 (Permanent)</Option>
                <Option value={302}>302 (Temporary)</Option>
                <Option value={307}>307 (Temporary Redirect)</Option>
                <Option value={308}>308 (Permanent Redirect)</Option>
              </Select>
            </Form.Item>
            <Form.Item name="isActive" label="Status">
              <Select className="w-full">
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-redirects-table .ant-table-thead > tr > th {
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }
        .custom-redirects-table .ant-table-cell {
          padding: 16px 24px !important;
        }
      `}} />
    </ConfigProvider>
  );
};

export default Redirects;
