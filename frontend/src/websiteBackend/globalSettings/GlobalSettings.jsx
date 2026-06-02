import React, { useEffect, useState } from "react";
import { Form, Input, Button, Tabs, message, ConfigProvider, Card } from "antd";
import { Globe, MapPin, FileSearch, Trash2, Plus } from "lucide-react";
import axios from "axios";

const GlobalSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get("/api/global-settings");
      if (response.data && response.data.success) {
        form.setFieldsValue(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching settings", error);
      message.error("Failed to load global settings");
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.put("/api/global-settings", values);
      if (response.data && response.data.success) {
        message.success("Global settings saved successfully!");
      }
    } catch (error) {
      console.error("Error saving settings", error);
      message.error("Failed to save global settings");
    } finally {
      setLoading(false);
    }
  };

  const CustomTabBtn = ({ active, icon, label, bg }) => (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-colors ${active ? 'bg-[#f06424] text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
      {icon} <span className="font-medium">{label}</span>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ffd333',
          borderRadius: 8,
        },
        components: {
          Tabs: {
            inkBarColor: 'transparent',
            itemActiveColor: 'transparent',
            itemHoverColor: 'transparent',
            itemSelectedColor: 'transparent',
          }
        }
      }}
    >
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Global Settings</h2>
          <p className="text-gray-500 text-sm mt-1">Site-wide SEO configuration</p>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Tabs
            defaultActiveKey="1"
            className="custom-tabs-hide-nav-lines"
            items={[
              {
                key: '1',
                label: <div className="flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-200 text-gray-600 font-medium hover:text-gray-900"><Globe size={18} /> <span>Integrations</span></div>,
                children: (
                  <Card className="shadow-sm border border-gray-100 mt-4 rounded-xl">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800">Site Identity</h3>
                      <p className="text-sm text-gray-500 mb-4">Basic information about your website</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item name="siteName" label="Site Name">
                          <Input placeholder="e.g. Chemtom" size="large" />
                        </Form.Item>
                        <Form.Item name="siteUrl" label="Site URL">
                          <Input placeholder="https://www.example.com/" size="large" />
                        </Form.Item>
                      </div>
                      <Form.Item name="defaultOgImage" label="Default OG Image URL">
                        <Input placeholder="https://www.example.com/assets/logo.png" size="large" />
                      </Form.Item>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800">Analytics & Tracking</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Form.Item name="googleAnalyticsId" label="Google Analytics ID">
                          <Input placeholder="G-XXXXXXXXXX" size="large" />
                        </Form.Item>
                        <Form.Item name="searchConsoleVerification" label="Search Console Verification">
                          <Input placeholder="google-site-verification=..." size="large" />
                        </Form.Item>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">Social Media Profiles</h3>
                          <p className="text-sm text-gray-500">Add multiple links like Twitter, LinkedIn, Instagram, etc.</p>
                        </div>
                      </div>
                      
                      <Form.List name="socialLinks">
                        {(fields, { add, remove }) => (
                          <div className="space-y-4">
                            <div className="flex justify-end">
                               <Button type="primary" onClick={() => add()} icon={<Plus size={16} />} className="bg-[#ffd333] hover:bg-[#edc32f] text-[#1a1a1a] border-none font-medium">
                                Add Social Link
                              </Button>
                            </div>
                            
                            {fields.map(({ key, name, ...restField }) => (
                              <div key={key} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <Form.Item
                                  {...restField}
                                  name={[name, 'name']}
                                  label="Social Media Name"
                                  className="w-1/3 mb-0"
                                >
                                  <Input placeholder="e.g. LinkedIn" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'url']}
                                  label="Handle / Profile URL"
                                  className="w-1/3 mb-0"
                                >
                                  <Input placeholder="https://..." />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'iconUrl']}
                                  label="Image URL"
                                  className="w-1/3 mb-0"
                                >
                                  <Input placeholder="https://..." />
                                </Form.Item>
                                <Button 
                                  type="text" 
                                  danger 
                                  icon={<Trash2 size={18} />} 
                                  onClick={() => remove(name)}
                                  className="mb-1"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </Form.List>
                    </div>
                  </Card>
                ),
              },
              {
                key: '2',
                label: <div className="flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-200 text-gray-600 font-medium hover:text-gray-900"><MapPin size={18} /> <span>Local SEO</span></div>,
                children: (
                  <Card className="shadow-sm border border-gray-100 mt-4 rounded-xl">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800">Business Information</h3>
                      <p className="text-sm text-gray-500 mb-4">Used for LocalBusiness JSON-LD structured data</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Form.Item name="businessName" label="Business Name">
                          <Input placeholder="e.g. Chemtom" size="large" />
                        </Form.Item>
                        <Form.Item name="businessPhone" label="Phone">
                          <Input placeholder="+91..." size="large" />
                        </Form.Item>
                        <Form.Item name="businessEmail" label="Email">
                          <Input placeholder="info@example.com" size="large" />
                        </Form.Item>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">Locations</h3>
                          <p className="text-sm text-gray-500">Add business locations for local SEO</p>
                        </div>
                      </div>

                      <Form.List name="locations">
                        {(fields, { add, remove }) => (
                          <div className="space-y-6">
                            <div className="flex justify-end">
                              <Button type="primary" onClick={() => add()} icon={<Plus size={16} />} className="bg-[#ffd333] hover:bg-[#edc32f] text-[#1a1a1a] border-none font-medium">
                                Add Location
                              </Button>
                            </div>
                            
                            {fields.map(({ key, name, ...restField }, index) => (
                              <div key={key} className="bg-white p-5 rounded-lg border border-gray-200 relative">
                                <div className="flex justify-between mb-4 items-center">
                                  <span className="text-xs font-bold text-gray-500 uppercase">Location {index + 1}</span>
                                  <span 
                                    className="text-xs text-gray-400 hover:text-red-500 cursor-pointer flex items-center gap-1"
                                    onClick={() => remove(name)}
                                  >
                                    <Trash2 size={14} /> Remove
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Form.Item {...restField} name={[name, 'name']} label="Location Name" className="mb-4">
                                    <Input placeholder="e.g. Head Office" />
                                  </Form.Item>
                                  <Form.Item {...restField} name={[name, 'phone']} label="Phone" className="mb-4">
                                    <Input placeholder="+91..." />
                                  </Form.Item>
                                  <Form.Item {...restField} name={[name, 'hours']} label="Hours" className="mb-4">
                                    <Input placeholder="Mo-Sa 09:00-18:00" />
                                  </Form.Item>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Form.Item {...restField} name={[name, 'address']} label="Address" className="mb-0">
                                    <Input placeholder="Street Address" />
                                  </Form.Item>
                                  <Form.Item {...restField} name={[name, 'city']} label="City" className="mb-0">
                                    <Input placeholder="City, State" />
                                  </Form.Item>
                                  <Form.Item {...restField} name={[name, 'zip']} label="Zip" className="mb-0">
                                    <Input placeholder="Zip Code" />
                                  </Form.Item>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Form.List>
                    </div>
                  </Card>
                ),
              },
              {
                key: '3',
                label: <div className="flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-200 text-gray-600 font-medium hover:text-gray-900"><FileSearch size={18} /> <span>Robots.txt</span></div>,
                children: (
                  <Card className="shadow-sm border border-gray-100 mt-4 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800">Robots.txt Configuration</h3>
                    <p className="text-sm text-gray-500 mb-4">Edit crawler directives in standard robots.txt format. Separate multiple user-agent blocks with a blank line.</p>
                    
                    <div className="bg-green-50 p-4 rounded-lg mb-4 text-sm text-green-800 border border-green-100 font-mono">
                      Example format:<br/>
                      User-agent: *<br/>
                      Disallow: /api/<br/>
                      Allow: /
                    </div>

                    <Form.Item name="robotsTxt" className="mb-0">
                      <Input.TextArea rows={12} className="font-mono text-sm w-full" placeholder="User-agent: *" />
                    </Form.Item>
                  </Card>
                ),
              },
              {
                key: '4',
                label: <div className="flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-200 text-gray-600 font-medium hover:text-gray-900"><span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">LLM</span> <span>.txt</span></div>,
                children: (
                  <Card className="shadow-sm border border-gray-100 mt-4 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800">LLM.txt Configuration</h3>
                    <p className="text-sm text-gray-500 mb-4">Manage the contents of the llm.txt file which helps Large Language Models understand your website context. Use standard Markdown formatting.</p>
                    
                    <Form.Item name="llmTxt" className="mb-0">
                      <Input.TextArea rows={16} className="font-mono text-sm w-full" placeholder="# About Us..." />
                    </Form.Item>
                  </Card>
                ),
              }
            ]}
          />

          <div className="flex justify-end mt-6">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="bg-[#ffd333] hover:bg-[#edc32f] border-none px-8 py-5 rounded-lg text-[#1a1a1a] font-bold text-base shadow-sm"
            >
              Save Settings
            </Button>
          </div>
        </Form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-tabs-hide-nav-lines .ant-tabs-nav-list {
          background-color: #f8fafc;
          padding: 6px;
          border-radius: 9999px;
          display: inline-flex;
          border: 1px solid #f1f5f9;
        }
        .custom-tabs-hide-nav-lines .ant-tabs-nav::before {
          display: none !important;
        }
        .custom-tabs-hide-nav-lines .ant-tabs-tab {
          padding: 0 !important;
          margin: 0 4px !important;
          border: none !important;
          background: transparent !important;
        }
        .custom-tabs-hide-nav-lines .ant-tabs-tab-active > div > div {
          background-color: #ffd333 !important;
          color: #1a1a1a !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .custom-tabs-hide-nav-lines .ant-tabs-tab-active > div > div span {
          color: #1a1a1a !important;
        }
        .custom-tabs-hide-nav-lines .ant-tabs-ink-bar {
          display: none !important;
        }
      `}} />
    </ConfigProvider>
  );
};

export default GlobalSettings;
