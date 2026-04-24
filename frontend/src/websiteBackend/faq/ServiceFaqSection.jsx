import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Table, Button, Input, Space, Popconfirm, message, Card, Typography } from 'antd';
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title } = Typography;

const ServiceFaqSection = () => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/faq/getFaq`, { withCredentials: true });
            // Filter for FAQs associated with the 'our-expertise' slug
            const filteredFaqs = (response.data.data || []).filter(faq => faq.slug === 'our-expertise');
            setFaqs(filteredFaqs);
        } catch (error) {
            console.error("Error fetching FAQs:", error);
            message.error("Failed to load FAQs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim()) {
            message.warning("Please fill both question and answer");
            return;
        }

        try {
            if (isEditing) {
                await axios.put(`/api/faq/updateFaq?id=${editId}`, {
                    question,
                    answer,
                    slug: 'our-expertise'
                }, { withCredentials: true });
                message.success("FAQ updated successfully");
            } else {
                await axios.post('/api/faq/insertFAQ', {
                    question,
                    answer,
                    slug: 'our-expertise',
                    status: 'active'
                }, { withCredentials: true });
                message.success("FAQ added successfully");
            }
            setQuestion("");
            setAnswer("");
            setIsEditing(false);
            setEditId(null);
            fetchFaqs();
        } catch (error) {
            console.error("Error saving FAQ:", error);
            message.error("Failed to save FAQ");
        }
    };

    const handleDelete = async (faqId) => {
        try {
            await axios.delete(`/api/faq/deleteFAQ?id=${faqId}`, { withCredentials: true });
            message.success("FAQ deleted successfully");
            fetchFaqs();
        } catch (error) {
            console.error("Error deleting FAQ:", error);
            message.error("Failed to delete FAQ");
        }
    };

    const handleEdit = (record) => {
        setQuestion(record.question);
        setAnswer(record.answer);
        setIsEditing(true);
        setEditId(record._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const columns = [
        {
            title: 'Question',
            dataIndex: 'question',
            key: 'question',
            width: '30%',
        },
        {
            title: 'Answer',
            dataIndex: 'answer',
            key: 'answer',
            render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <FaEdit
                        size={20}
                        className="text-green-600 cursor-pointer hover:text-green-800 transition-colors"
                        onClick={() => handleEdit(record)}
                        title="Edit FAQ"
                    />
                    <Popconfirm
                        title="Delete this FAQ?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <FaTrashAlt
                            size={18}
                            className="text-red-600 cursor-pointer hover:text-red-800 transition-colors"
                            title="Delete FAQ"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-8">
            <Card title={<Title level={3} className="m-0">{isEditing ? "Edit FAQ" : "Add New FAQ"}</Title>} className="shadow-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Question</label>
                        <Input
                            placeholder="Enter FAQ question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Answer</label>
                        <ReactQuill
                            theme="snow"
                            value={answer}
                            onChange={setAnswer}
                            modules={modules}
                            className="bg-white rounded"
                            style={{ height: '200px', marginBottom: '50px' }}
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="bg-[#ffd333] text-[#1a1a1a] hover:bg-[#edc32f] border-none font-semibold px-8"
                            size="large"
                        >
                            {isEditing ? "Update FAQ" : "Save FAQ"}
                        </Button>
                        {isEditing && (
                            <Button
                                onClick={() => {
                                    setQuestion("");
                                    setAnswer("");
                                    setIsEditing(false);
                                    setEditId(null);
                                }}
                                size="large"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </Card>

            <Card title={<Title level={4} className="m-0">Existing FAQs</Title>} className="shadow-md">
                <Table
                    columns={columns}
                    dataSource={faqs}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Card>
        </div>
    );
};

export default ServiceFaqSection;
