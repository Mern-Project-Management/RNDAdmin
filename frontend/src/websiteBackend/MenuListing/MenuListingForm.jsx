import React, { useEffect, useState } from "react";
import { Form, Input, Button, Space, Card } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useCreateMenuListingMutation, useUpdateMenuListingMutation, useGetMenuListingByIdQuery, useGetAllMenuListingsQuery } from "@/slice/menuListing/menuList";
import { useNavigate, useParams } from "react-router-dom";

const MenuListingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form] = Form.useForm();
  const [parentFile, setParentFile] = useState(null);
  const [childFiles, setChildFiles] = useState({});
  const [subChildFiles, setSubChildFiles] = useState({});
  const [parentPreview, setParentPreview] = useState(null);
  const [childPreviews, setChildPreviews] = useState({});
  const [subChildPreviews, setSubChildPreviews] = useState({});
  
  const { data, isLoading } = useGetMenuListingByIdQuery(id, { skip: !id });
  const { refetch: refetchAllMenuListings } = useGetAllMenuListingsQuery();
  const [createMenuListing] = useCreateMenuListingMutation();
  const [updateMenuListing] = useUpdateMenuListingMutation();

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data.data);
      // initialize previews from existing data (filenames)
      const existing = data.data || {};
      if (existing.parent && existing.parent.photo) {
        setParentPreview(`/api/image/download/${existing.parent.photo}`);
      }
      const cps = {};
      const scps = {};
      (existing.children || []).forEach((c, ci) => {
        if (c && c.photo) cps[ci] = `/api/image/download/${c.photo}`;
        (c.subChildren || []).forEach((s, si) => {
          if (s && s.photo) scps[`${ci}-${si}`] = `/api/image/download/${s.photo}`;
        });
      });
      setChildPreviews(cps);
      setSubChildPreviews(scps);
    }
  }, [data, form]);

  const handleSubmit = async (values) => {
    // Build FormData so we can send JSON + files together
    const formData = new FormData();
    const parentObj = values.parent || {};
    const childrenArr = values.children || [];

    formData.append('parent', JSON.stringify(parentObj));
    formData.append('children', JSON.stringify(childrenArr));

    if (parentFile) {
      formData.append('photo', parentFile);
    }

    childrenArr.forEach((child, ci) => {
      const cf = childFiles[ci];
      if (cf) formData.append(`children[${ci}][photo]`, cf);
      (child.subChildren || []).forEach((sub, si) => {
        const key = `${ci}-${si}`;
        const sf = subChildFiles[key];
        if (sf) formData.append(`children[${ci}][subChildren][${si}][photo]`, sf);
      });
    });

    if (id) {
      await updateMenuListing({ id, updatedMenuListing: formData });
    } else {
      await createMenuListing(formData);
    }

    await refetchAllMenuListings();
    navigate("/menu-listing-table");
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <Card title={id ? "Update Menu Listing" : "Create Menu Listing"} bordered={false}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ children: [] }}>
        
        {/* Parent Menu */}
        <Card title="Parent Menu" bordered={true} className="mb-5">
          <Form.Item name={["parent", "name"]} label="Name" rules={[{ required: true, message: "Please enter parent menu name" }]}>
            <Input placeholder="Enter parent menu name" />
          </Form.Item>
          <Form.Item name={["parent", "path"]} label="Path" rules={[{ required: true, message: "Please enter parent menu path" }]}>
            <Input placeholder="Enter parent menu path" />
          </Form.Item>
          <Form.Item name={["parent", "alt"]} label="Parent Image Alt">
            <Input placeholder="Enter parent image alt text" />
          </Form.Item>
          <Form.Item name={["parent", "imgtitle"]} label="Parent Image Title">
            <Input placeholder="Enter parent image title" />
          </Form.Item>
          <Form.Item label="Parent Photo">
            <input type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files[0];
              setParentFile(f);
              if (f) {
                const url = URL.createObjectURL(f);
                setParentPreview(url);
              } else {
                setParentPreview(null);
              }
            }} />
            {parentPreview && (
              <div style={{ marginTop: 8 }}>
                <img src={parentPreview} alt="parent preview" style={{ maxWidth: 160, maxHeight: 120, objectFit: 'contain' }} />
              </div>
            )}
          </Form.Item>
        </Card>

        {/* Children Menus */}
        <Form.List name="children">
          {(fields, { add, remove }) => (
            <Card title="Children Menus" bordered={true}>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} bordered={true} className="mb-4">
                  <Space align="baseline">
                    <Form.Item {...restField} name={[name, "name"]} label="Child Name" rules={[{ required: true, message: "Enter child name" }]}>
                      <Input placeholder="Enter child name" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "path"]} label="Child Path" rules={[{ required: true, message: "Enter child path" }]}> 
                      <Input placeholder="Enter child path" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "alt"]} label="Child Image Alt">
                      <Input placeholder="Enter child image alt" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "imgtitle"]} label="Child Image Title">
                      <Input placeholder="Enter child image title" />
                    </Form.Item>
                    <Form.Item label="Child Photo">
                      <input type="file" accept="image/*" onChange={(e) => {
                        const f = e.target.files[0];
                        setChildFiles(prev => ({ ...prev, [name]: f }));
                        if (f) {
                          const url = URL.createObjectURL(f);
                          setChildPreviews(prev => ({ ...prev, [name]: url }));
                        } else {
                          setChildPreviews(prev => { const c = { ...prev }; delete c[name]; return c; });
                        }
                      }} />
                      {childPreviews[name] && (
                        <div style={{ marginTop: 8 }}>
                          <img src={childPreviews[name]} alt={`child-${name}-preview`} style={{ maxWidth: 140, maxHeight: 100, objectFit: 'contain' }} />
                        </div>
                      )}
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>

                  {/* SubChildren */}
                  <Form.List name={[name, "subChildren"]}>
                    {(subFields, { add: addSub, remove: removeSub }) => (
                      <Card title="Sub-Children" bordered={true}>
                        {subFields.map(({ key: subKey, name: subName, ...subRestField }) => (
                          <Space key={subKey} align="baseline">
                            <Form.Item {...subRestField} name={[subName, "name"]} label="Sub-Child Name" rules={[{ required: true, message: "Enter sub-child name" }]}>
                              <Input placeholder="Enter sub-child name" />
                            </Form.Item>
                            <Form.Item {...subRestField} name={[subName, "path"]} label="Sub-Child Path" rules={[{ required: true, message: "Enter sub-child path" }]}>
                              <Input placeholder="Enter sub-child path" />
                            </Form.Item>
                            <Form.Item {...subRestField} name={[subName, "alt"]} label="Sub-Child Image Alt">
                              <Input placeholder="Enter sub-child image alt" />
                            </Form.Item>
                            <Form.Item {...subRestField} name={[subName, "imgtitle"]} label="Sub-Child Image Title">
                              <Input placeholder="Enter sub-child image title" />
                            </Form.Item>
                            <Form.Item label="Sub-Child Photo">
                              <input type="file" accept="image/*" onChange={(e) => {
                                const f = e.target.files[0];
                                const key = `${name}-${subName}`;
                                setSubChildFiles(prev => ({ ...prev, [key]: f }));
                                if (f) {
                                  const url = URL.createObjectURL(f);
                                  setSubChildPreviews(prev => ({ ...prev, [key]: url }));
                                } else {
                                  setSubChildPreviews(prev => { const c = { ...prev }; delete c[key]; return c; });
                                }
                              }} />
                              {subChildPreviews[`${name}-${subName}`] && (
                                <div style={{ marginTop: 8 }}>
                                  <img src={subChildPreviews[`${name}-${subName}`]} alt={`sub-${name}-${subName}-preview`} style={{ maxWidth: 120, maxHeight: 90, objectFit: 'contain' }} />
                                </div>
                              )}
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => removeSub(subName)} />
                          </Space>
                        ))}
                        <Button type="dashed" onClick={() => addSub()} block icon={<PlusOutlined />}>
                          Add Sub-Child
                        </Button>
                      </Card>
                    )}
                  </Form.List>
                </Card>
              ))}
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Child
              </Button>
            </Card>
          )}
        </Form.List>

        <Button htmlType="submit" className="mt-5 bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] hover:text-[#1a1a1a] border-none font-semibold">
          {id ? "Update" : "Create"}
        </Button>
      </Form>
    </Card>
  );
};

export default MenuListingForm;
