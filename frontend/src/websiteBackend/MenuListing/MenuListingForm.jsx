import React, { useEffect } from "react";
import { Form, Input, Button, Card } from "antd";
import { useCreateMenuListingMutation, useUpdateMenuListingMutation, useGetMenuListingByIdQuery, useGetAllMenuListingsQuery } from "@/slice/menuListing/menuList";
import { useNavigate, useParams } from "react-router-dom";

const MenuListingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form] = Form.useForm();
  
  const { data, isLoading } = useGetMenuListingByIdQuery(id, { skip: !id });
  const { refetch: refetchAllMenuListings } = useGetAllMenuListingsQuery();
  const [createMenuListing] = useCreateMenuListingMutation();
  const [updateMenuListing] = useUpdateMenuListingMutation();

  useEffect(() => {
    if (data && data.data) {
      form.setFieldsValue({
        parent: {
          name: data.data.parent?.name,
          path: data.data.parent?.path,
        }
      });
    }
  }, [data, form]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
      
    form.setFieldValue(["parent", "path"], slug ? `/${slug}` : "");
  };

  const handleSubmit = async (values) => {
    // Send as JSON. The backend parses it correctly.
    if (id) {
      await updateMenuListing({ id, updatedMenuListing: values });
    } else {
      await createMenuListing(values);
    }

    await refetchAllMenuListings();
    navigate("/menu-listing-table");
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <Card title={id ? "Update Menu Listing" : "Create Menu Listing"} bordered={false}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        
        <Form.Item 
          name={["parent", "name"]} 
          label="Page Name" 
          rules={[{ required: true, message: "Please enter page name" }]}
        >
          <Input placeholder="Enter page name" onChange={handleNameChange} />
        </Form.Item>
        
        <Form.Item 
          name={["parent", "path"]} 
          label="Slug" 
          rules={[{ required: true, message: "Please enter slug" }]}
        >
          <Input placeholder="Enter slug" />
        </Form.Item>

        <Button htmlType="submit" className="mt-5 bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold">
          {id ? "Update" : "Create"}
        </Button>
      </Form>
    </Card>
  );
};

export default MenuListingForm;
