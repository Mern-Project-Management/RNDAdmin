import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, message, Breadcrumb } from "antd";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

const { Option } = Select;

const StaticMetaForm = () => {
  const [form] = Form.useForm();
  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch menu list
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await axios.get("/api/menulist/get-menu");
        if (response.data && Array.isArray(response.data.data)) {
          setMenuList(response.data.data);
        } else {
          console.error("Unexpected API response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching menu list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

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
            });
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
  const handlePageChange = (value) => {
    const slug = generateSlug(value);
    form.setFieldsValue({ pageSlug: slug });
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
        <Form.Item
          name="pageName"
          label="Page Name"
          rules={[{ required: true, message: "Please select a page" }]}
        >
          <Select
            placeholder="Select a page"
            loading={loading}
            onChange={handlePageChange}
            className="w-full"
          >
            <Option value="Static Page">Static Page</Option>
            {menuList.map((menu) => (
              <React.Fragment key={menu._id}>
                <Option value={menu.parent.name} className="font-semibold">
                  {menu.parent.name}
                </Option>
                {menu.children.map((child) => (
                  <React.Fragment key={child._id}>
                    <Option value={child.name} className="pl-5">
                      ├── {child.name}
                    </Option>
                    {child.subChildren.map((subChild) => (
                      <Option key={subChild._id} value={subChild.name} className="pl-10">
                        ├──── {subChild.name}
                      </Option>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </Select>
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
          label="Meta Title"
          rules={[{ required: true, message: "Please enter meta title" }]}
        >
          <Input placeholder="Enter Meta Title" className="w-full" />
        </Form.Item>

        <Form.Item
          name="metaDescription"
          label="Meta Description"
          rules={[{ required: true, message: "Please enter meta description" }]}
        >
          <Input.TextArea placeholder="Enter Meta Description" rows={4} className="w-full" />
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

        <Form.Item>
          <div className="flex gap-4">
            <Button type="primary" htmlType="submit">
              {id ? "Update Meta" : "Add Meta"}
            </Button>
          </div>
        </Form.Item>
      </Form>

    </div>
  );
};

export default StaticMetaForm;
