import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaEdit, FaTrashAlt, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";
import FaqModal from "./FaqModel.jsx";

const HomeFaqSection = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("active");
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();

  const modules = {
    toolbar: [
      [{ 'font': [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/faq/getFaq?slug=homepage', { withCredentials: true });
      if (response.data && response.data.data) {
        setFaqs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching Home FAQs:", error);
      toast.error("Failed to load FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Please fill in both Question and Answer.");
      return;
    }

    try {
      await axios.post('/api/faq/insertFAQ', {
        question,
        answer,
        status,
        slug: 'homepage'
      }, { withCredentials: true });
      
      toast.success("Home FAQ added successfully!");
      setQuestion("");
      setAnswer("");
      setStatus("active");
      fetchFaqs();
    } catch (error) {
      console.error("Error adding Home FAQ:", error);
      toast.error("Failed to add Home FAQ");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await axios.delete(`/api/faq/deleteFAQ?id=${id}`, { withCredentials: true });
      toast.success("FAQ deleted successfully!");
      fetchFaqs();
    } catch (error) {
      console.error("Error deleting Home FAQ:", error);
      toast.error("Failed to delete FAQ");
    }
  };

  const handleView = (faq) => {
    setSelectedFAQ(faq);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center mb-6">Home FAQ Management</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Add New Home FAQ</h2>
          
          <div className="mb-4">
            <label htmlFor="question" className="block font-semibold mb-2">Question</label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-8">
            <label htmlFor="answer" className="block font-semibold mb-2">Answer</label>
            <ReactQuill
              value={answer}
              onChange={setAnswer}
              modules={modules}
              className="quill focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="status" className="block font-semibold mb-2">Status</label>
            <div className="flex items-center">
              <label className="mr-4 text-green-500 flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="active"
                  checked={status === "active"}
                  onChange={() => setStatus("active")}
                  className="mr-2 cursor-pointer"
                />
                Active
              </label>
              <label className="text-red-500 flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="inactive"
                  checked={status === "inactive"}
                  onChange={() => setStatus("inactive")}
                  className="mr-2 cursor-pointer"
                />
                Inactive
              </label>
            </div>
          </div>

          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition duration-200">
            Add FAQ
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-md font-semibold mb-4 text-gray-800 border-b pb-2">Existing Home FAQs</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <UseAnimations animation={loading} size={40} />
          </div>
        ) : faqs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No Home FAQs added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg">
              <thead className="bg-[#ffd333] text-white">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider">Question</th>
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {faqs.map((faq) => (
                  <tr key={faq._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{faq.question}</td>
                    <td className="px-4 py-3 text-sm">
                      {faq.status === "active" ? (
                        <span className="flex items-center text-green-600 font-medium"><FaCheck className="mr-1" /> Active</span>
                      ) : (
                        <span className="flex items-center text-red-500 font-medium"><FaTimes className="mr-1" /> Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-3">
                        <button onClick={() => handleView(faq)} className="text-gray-600 hover:text-blue-500 transition" title="View">
                          <FaEye size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-800 transition" title="Edit">
                          <Link to={`/edit-home-faq/${faq._id}`}>
                            <FaEdit size={16} />
                          </Link>
                        </button>
                        <button onClick={() => handleDelete(faq._id)} className="text-red-500 hover:text-red-700 transition" title="Delete">
                          <FaTrashAlt size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FaqModal 
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        selectedFAQ={selectedFAQ}
      />
    </div>
  );
};

export default HomeFaqSection;
