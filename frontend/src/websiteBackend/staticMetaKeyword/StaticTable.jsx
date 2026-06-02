import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Input, ConfigProvider } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Edit3, Trash2, Search, Plus } from "lucide-react";

const MetaList = () => {
  const [metaList, setMetaList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const response = await axios.get("/api/meta/get-meta");
        if (response.data && Array.isArray(response.data.data)) {
          setMetaList(response.data.data);
          setFilteredList(response.data.data);
        } else {
          console.error("Unexpected API response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching meta data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = metaList.filter(
      (item) =>
        item.pageName?.toLowerCase().includes(value) ||
        item.metaTitle?.toLowerCase().includes(value) ||
        item.pageSlug?.toLowerCase().includes(value)
    );
    setFilteredList(filtered);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/meta/delete-meta/${id}`);
      message.success("Meta data deleted successfully!");
      const updatedList = metaList.filter((item) => item._id !== id);
      setMetaList(updatedList);
      setFilteredList(updatedList.filter(
        (item) =>
          item.pageName?.toLowerCase().includes(searchText) ||
          item.metaTitle?.toLowerCase().includes(searchText) ||
          item.pageSlug?.toLowerCase().includes(searchText)
      ));
    } catch (error) {
      message.error("Failed to delete meta data.");
      console.error("Delete error:", error);
    }
  };

  const calculateSeoScore = (record) => {
    let score = 100;
    
    // 1. Meta Title (15 Points)
    if (!record.metaTitle || record.metaTitle.trim() === '') {
      score -= 15;
    } else if (record.metaTitle.length < 30 || record.metaTitle.length > 60) {
      score -= 7;
    }

    // 2. Meta Description (15 Points)
    if (!record.metaDescription || record.metaDescription.trim() === '') {
      score -= 15;
    } else if (record.metaDescription.length < 70 || record.metaDescription.length > 160) {
      score -= 7;
    }

    // 3. Canonical Link (10 Points)
    if (!record.canonicalLink || record.canonicalLink.trim() === '') {
      score -= 10;
    }

    // 4. Keywords (5 Points)
    if (!record.metaKeyword || record.metaKeyword.trim() === '') {
      score -= 5;
    }

    // 5. Open Graph / OG Tags (15 Points)
    if (!record.ogTitle || record.ogTitle.trim() === '') score -= 5;
    if (!record.ogDescription || record.ogDescription.trim() === '') score -= 5;
    if (!record.ogImage || record.ogImage.trim() === '') score -= 5;

    // 6. Index/Follow - Robots (10 Points)
    if (record.noIndex || record.noFollow) {
      score -= 10;
    }

    // 7. Image Alt Text (15 Points)
    // Deduction: 3 points per missing alt text, capped at 15 points
    const altDeduction = Math.min(15, (record.missingAltCount || 0) * 3);
    score -= altDeduction;

    // 8. Headings - H1 & H2 Tags (15 Points)
    const h1Count = record.h1Count || 0;
    const h2Count = record.h2Count || 0;
    
    if (h1Count === 0) {
      score -= 10;
    } else if (h1Count > 1) {
      score -= 5;
    }

    if (h2Count === 0) {
      score -= 5;
    }

    return Math.max(score, 0);
  };

  const handleAudit = async (id) => {
    message.loading({ content: 'Auditing page with Puppeteer...', key: 'audit' });
    try {
      const response = await axios.post(`/api/meta/audit-meta/${id}`);
      if (response.data.success) {
        message.success({ content: 'Page audited successfully!', key: 'audit', duration: 3 });
        // Update local state
        const updatedList = metaList.map(item => item._id === id ? response.data.data : item);
        setMetaList(updatedList);
        setFilteredList(updatedList.filter(
          (item) =>
            item.pageName?.toLowerCase().includes(searchText) ||
            item.metaTitle?.toLowerCase().includes(searchText) ||
            item.pageSlug?.toLowerCase().includes(searchText)
        ));
      }
    } catch (error) {
      console.error(error);
      message.error({ content: 'Failed to audit page.', key: 'audit', duration: 3 });
    }
  };

  const columns = [
    {
      title: "ROUTE",
      dataIndex: "pageSlug",
      key: "pageSlug",
      render: (text) => <span className="font-medium text-gray-800">{text || '/'}</span>,
      width: '20%',
    },
    {
      title: "TITLE",
      dataIndex: "metaTitle",
      key: "metaTitle",
      render: (text) => (
        <span className="text-gray-600">
          {text ? (text.length > 50 ? `${text.substring(0, 50)}...` : text) : 'No Title Set'}
        </span>
      ),
      width: '40%',
    },
    {
      title: "INDEXING",
      key: "indexing",
      render: (_, record) => (
        <div className="flex items-center">
          {record.noIndex ? (
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> No Index
            </span>
          ) : (
            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Indexed
            </span>
          )}
        </div>
      ),
      width: '15%',
    },
    {
      title: "SEO SCORE",
      key: "seoScore",
      render: (_, record) => {
        const score = calculateSeoScore(record);
        return (
          <span className="bg-[#fff9e6] text-[#e69b00] px-3 py-1 rounded-full text-sm font-semibold">
            {score}/100
          </span>
        );
      },
      width: '15%',
    },
    {
      title: "ACTIONS",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-3 text-gray-400 items-center">
          <Edit3
            size={18}
            className="cursor-pointer hover:text-[#ffd333] transition-colors"
            onClick={() => navigate(`/edit-meta-form/${record._id}`)}
          />
          <Popconfirm
            title="Are you sure to delete this meta data?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ style: { backgroundColor: '#ffd333', color: '#000', borderColor: '#ffd333' } }}
          >
            <Trash2 
              size={18}
              className="cursor-pointer hover:text-red-500 transition-colors"
            />
          </Popconfirm>
        </div>
      ),
      width: '10%',
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ffd333',
        },
        components: {
          Table: {
            headerBg: '#fff',
            headerColor: '#6b7280',
            rowHoverBg: '#fafafa',
            headerBorderRadius: 0,
          },
        },
      }}
    >
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Page Meta Tags</h2>
            <p className="text-gray-500 text-sm mt-1">Manage SEO meta tags for each page</p>
          </div>
          <Button 
            className="bg-[#ffd333] text-black hover:bg-[#edc32f] border-none font-medium flex items-center gap-2 h-10 px-5 rounded-md shadow-sm"
            onClick={() => navigate("/meta-form")}
          >
            <Plus size={16} /> Add Meta
          </Button>
        </div>

        {/* Search Section */}
        <div className="mb-6 w-80">
          <Input 
            prefix={<Search size={16} className="text-gray-400 mr-2" />}
            placeholder="Search by page name or title..." 
            value={searchText}
            onChange={handleSearch}
            className="rounded-md border-gray-200 hover:border-gray-300 focus:border-[#ffd333] focus:ring-[#ffd333] py-2 shadow-sm"
          />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredList}
            rowKey="_id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: false,
              className: "px-4"
            }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default MetaList;
