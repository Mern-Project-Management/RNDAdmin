import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, message, Breadcrumb, Tabs, Checkbox, ConfigProvider } from "antd";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

const { Option } = Select;

const StaticMetaForm = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [titleLen, setTitleLen] = useState(0);
  const [descLen, setDescLen] = useState(0);

  // Fetch existing meta data for editing
  useEffect(() => {
    if (id) {
      axios
        .get(`/api/meta/get-meta/${id}`)
        .then((response) => {
          if (response.data && response.data.success) {
            const metaData = response.data.data;
            form.setFieldsValue({
              pageName: metaData.pageName,
              pageSlug: metaData.pageSlug, // Set slug from existing data
              metaTitle: metaData.metaTitle,
              metaDescription: metaData.metaDescription,
              metaKeyword: metaData.metaKeyword,
              canonicalLink: metaData.canonicalLink,
              faqSchema: metaData.faqSchema,
              ogTitle: metaData.ogTitle,
              ogDescription: metaData.ogDescription,
              ogImage: metaData.ogImage,
              ogType: metaData.ogType,
              twitterCard: metaData.twitterCard,
              noIndex: metaData.noIndex,
              noFollow: metaData.noFollow,
              structuredData: metaData.structuredData,
            });
            setTitleLen(metaData.metaTitle?.length || 0);
            setDescLen(metaData.metaDescription?.length || 0);
          }
        })
        .catch((error) => console.error("Error fetching meta data:", error));
    }
  }, [id, form]);

  // Function to generate slug from page name
  const generateSlug = (pageName) => {
    return pageName
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/[^a-z0-9-]/g, ""); // Remove special characters
  };

  // Handle page selection and auto-fill slug
  const handlePageChange = (e) => {
    const value = e.target.value;
    let slug;
    let canonical;

    if (value === "Home Page") {
      slug = "/";
      canonical = "https://www.rndtechnosoft.com/";
    } else {
      slug = generateSlug(value);
      canonical = slug ? `https://www.rndtechnosoft.com/${slug}` : "";
    }

    form.setFieldsValue({ 
      pageSlug: slug,
      canonicalLink: canonical
    });
  };

  // Handle form submission
  const onFinish = async (values) => {
    try {
      if (id) {
        await axios.put(`/api/meta/update-meta/${id}`, values);
        message.success("Meta data updated successfully!");
      } else {
        await axios.post("/api/meta/add-meta", values);
        message.success("Meta data added successfully!");
        form.resetFields();
      }
      navigate("/meta-table");
    } catch (error) {
      message.error("Failed to save meta data.");
      console.error("Error:", error);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-5">
        <Breadcrumb.Item>
          <Link to="/dashboard">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/meta-table">Meta List</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{id ? "Edit Meta" : "Add Meta"}</Breadcrumb.Item>
      </Breadcrumb>

      <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-4">
        <ConfigProvider
          theme={{
            components: {
              Tabs: {
                inkBarColor: '#ffd333',
                itemActiveColor: '#ffd333',
                itemHoverColor: '#ffd333',
                itemSelectedColor: '#ffd333',
              },
            },
          }}
        >
          <Tabs
            defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: 'Core SEO',
              children: (
                <div className="space-y-4 pt-4 border rounded-lg p-5 bg-white shadow-sm">
                  <Form.Item
                    name="pageName"
                    label="Page Name"
                    rules={[{ required: true, message: "Please enter a page name" }]}
                  >
                    <Input 
                      placeholder="Enter a page name" 
                      onChange={handlePageChange} 
                      className="w-full" 
                    />
                  </Form.Item>

                  <Form.Item
                    name="pageSlug"
                    label="Page Slug"
                    rules={[{ required: true, message: "Slug is required" }]}
                  >
                    <Input placeholder="Auto-generated slug" className="w-full" />
                  </Form.Item>

                  <Form.Item
                    name="metaTitle"
                    label={
                      <div className="flex items-center gap-2">
                        <span>Meta Title</span>
                        <span className="text-sm font-normal text-[#d9a300]">
                          {titleLen}/60 characters recommended
                        </span>
                      </div>
                    }
                    rules={[{ required: true, message: "Please enter meta title" }]}
                  >
                    <Input 
                      placeholder="Enter Meta Title" 
                      className="w-full" 
                      onChange={(e) => setTitleLen(e.target.value.length)}
                    />
                  </Form.Item>

                  <Form.Item
                    name="metaDescription"
                    label={
                      <div className="flex items-center gap-2">
                        <span>Meta Description</span>
                        <span className="text-sm font-normal text-[#d9a300]">
                          {descLen}/160 characters recommended
                        </span>
                      </div>
                    }
                    rules={[{ required: true, message: "Please enter meta description" }]}
                  >
                    <Input.TextArea 
                      placeholder="Enter Meta Description" 
                      rows={4} 
                      className="w-full" 
                      onChange={(e) => setDescLen(e.target.value.length)}
                    />
                  </Form.Item>

                  <Form.Item
                    name="metaKeyword"
                    label="Meta Keywords"
                  >
                    <Input placeholder="Enter Meta Keywords" className="w-full" />
                  </Form.Item>

                  <Form.Item
                    name="canonicalLink"
                    label="Canonical Link"
                  >
                    <Input placeholder="Enter Canonical Link" className="w-full" />
                  </Form.Item>

                  <Form.Item
                    name="faqSchema"
                    label="FAQ Schema"
                  >
                    <Input.TextArea placeholder="Enter FAQ Schema (JSON-LD)" rows={6} className="w-full font-mono text-sm" />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: '2',
              label: 'Social',
              children: (
                <div className="space-y-4 pt-4 border rounded-lg p-5 bg-white shadow-sm">
                  <Form.Item
                    name="ogTitle"
                    label="OG Title"
                  >
                    <Input placeholder="Open Graph title for social sharing" className="w-full" />
                  </Form.Item>
                  <Form.Item
                    name="ogDescription"
                    label="OG Description"
                  >
                    <Input.TextArea placeholder="Description shown when shared on social media..." rows={4} className="w-full" />
                  </Form.Item>
                  <Form.Item
                    name="ogImage"
                    label="OG Image URL"
                  >
                    <Input placeholder="https://..." className="w-full" />
                  </Form.Item>
                  <div className="flex gap-4">
                    <Form.Item
                      name="ogType"
                      label="OG Type"
                      className="w-1/2"
                      initialValue="website"
                    >
                      <Select>
                        <Option value="website">website</Option>
                        <Option value="article">article</Option>
                        <Option value="product">product</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="twitterCard"
                      label="Twitter Card"
                      className="w-1/2"
                      initialValue="summary_large_image"
                    >
                      <Select>
                        <Option value="summary_large_image">summary_large_image</Option>
                        <Option value="summary">summary</Option>
                        <Option value="player">player</Option>
                        <Option value="app">app</Option>
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              ),
            },
            {
              key: '3',
              label: 'Advanced',
              children: (
                <div className="space-y-4 pt-4 border rounded-lg p-5 bg-white shadow-sm">
                  <div className="flex gap-4">
                    <Form.Item
                      name="noIndex"
                      valuePropName="checked"
                      className="w-1/2 border p-3 rounded-lg flex items-start"
                    >
                      <Checkbox>
                        <div className="flex flex-col">
                          <span className="font-semibold">noIndex</span>
                          <span className="text-gray-500 text-sm">Hide from search engines</span>
                        </div>
                      </Checkbox>
                    </Form.Item>
                    <Form.Item
                      name="noFollow"
                      valuePropName="checked"
                      className="w-1/2 border p-3 rounded-lg flex items-start"
                    >
                      <Checkbox>
                        <div className="flex flex-col">
                          <span className="font-semibold">noFollow</span>
                          <span className="text-gray-500 text-sm">Don't pass link equity</span>
                        </div>
                      </Checkbox>
                    </Form.Item>
                  </div>
                  <Form.Item
                    name="structuredData"
                    label="Structured Data (JSON-LD)"
                  >
                    <Input.TextArea placeholder='{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [...] }' rows={6} className="w-full font-mono text-sm" />
                  </Form.Item>
                </div>
              ),
            },
          ]}
        />
        </ConfigProvider>

        <div className="flex justify-end gap-4 mt-6">
          <Button onClick={() => navigate("/meta-table")}>Cancel</Button>
          <button
            type="submit"
            className="bg-[#ffd333] text-[#1a1a1a] px-6 py-2 rounded-lg hover:bg-[#edc32f] transition font-semibold"
          >
            Save Changes
          </button>
        </div>
      </Form>

    </div>
  );
};

export default StaticMetaForm;
