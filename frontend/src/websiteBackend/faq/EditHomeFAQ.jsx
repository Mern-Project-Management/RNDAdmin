import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditHomeFAQ = () => {
  const { id: faqId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const fetchFAQData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/faq/getFAQById?id=${faqId}`, { withCredentials: true });
        if (response.data && response.data.data) {
          const { question, answer, status } = response.data.data;
          setQuestion(question);
          setAnswer(answer);
          setStatus(status);
        }
      } catch (error) {
        console.error('Error fetching Home FAQ data:', error);
        toast.error("Failed to load FAQ details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFAQData();
  }, [faqId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Please fill in both Question and Answer.");
      return;
    }

    try {
      await axios.put(`/api/faq/updateFaq?id=${faqId}`, {
        question,
        answer,
        status,
        slug: 'homepage'
      }, { withCredentials: true });
      
      toast.success("Home FAQ updated successfully!");
      setTimeout(() => {
        navigate("/home-faq");
      }, 1500);
    } catch (error) {
      console.error('Error updating Home FAQ:', error);
      toast.error("Failed to update FAQ.");
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center mb-6">Edit Home FAQ</h1>

      {isLoading ? (
        <p className="text-gray-500 text-center py-4">Loading FAQ details...</p>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition duration-200">
                Update FAQ
              </button>
              <button 
                type="button" 
                onClick={() => navigate("/home-faq")} 
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditHomeFAQ;
