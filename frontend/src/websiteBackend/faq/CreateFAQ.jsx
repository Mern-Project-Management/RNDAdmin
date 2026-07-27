import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import TipTapEditor from '@/components/TipTapEditor';

const FAQForm = ({ onSuccess, type }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("active");

  // Service category state
  const [serviceCategories, setServiceCategories] = useState([]);
  const [serviceparentCategoryId, setServiceParentCategoryId] = useState("");
  const [servicesubCategoryId, setServiceSubCategoryId] = useState("");
  const [servicesubSubCategoryId, setServiceSubSubCategoryId] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/faq/insertFAQ', {
        question,
        answer,
        status,
        serviceparentCategoryId,
        servicesubCategoryId,
        servicesubSubCategoryId
      }, { withCredentials: true });

      setQuestion("");
      setAnswer("");
      setStatus("active");
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/faq');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchServiceCategories();
  }, []);

  // Fetch all service categories
  const fetchServiceCategories = async () => {
    try {
      const response = await axios.get('/api/services/getAll', { withCredentials: true });
      setServiceCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Render options for the parent, sub, and sub-sub categories
  const renderCategoryOptions = (category) => (
    <option key={category._id} value={category._id}>
      {category.category}
    </option>
  );

  // Handle changes for service parent category
  const handleServiceParentCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setServiceParentCategoryId(selectedCategoryId);
    setServiceSubCategoryId(""); // Reset subcategory selection
    setServiceSubSubCategoryId(""); // Reset sub-subcategory selection
  };

  // Handle changes for service subcategory
  const handleServiceSubCategoryChange = (e) => {
    const selectedSubCategoryId = e.target.value;
    setServiceSubCategoryId(selectedSubCategoryId);
    setServiceSubSubCategoryId(""); // Reset sub-subcategory selection
  };

  // Handle changes for service sub-subcategory
  const handleServiceSubSubCategoryChange = (e) => {
    const selectedSubSubCategoryId = e.target.value;
    setServiceSubSubCategoryId(selectedSubSubCategoryId);
  };

  // Find categories recursively
  const findCategoryById = (categories, id) => {
    for (const category of categories) {
      if (category._id === id) return category;
      if (category.subCategories) {
        const subCategory = findCategoryById(category.subCategories, id);
        if (subCategory) return subCategory;
      }
    }
    return null;
  };

  // Get subcategories and sub-subcategories for services
  const subServiceCategories = serviceparentCategoryId ? findCategoryById(serviceCategories, serviceparentCategoryId)?.subCategories || [] : [];
  const subSubServiceCategories = (serviceparentCategoryId && servicesubCategoryId) ? findCategoryById(serviceCategories, serviceparentCategoryId)?.subCategories.find(sub => sub._id === servicesubCategoryId)?.subSubCategory || [] : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
        Add New FAQ
      </h2>

      {/* Service Categories */}
      {type !== 'service' && (
        <>
          <div className="mb-4">
            <label htmlFor="serviceParentCategory" className="block font-semibold mb-2">
              Parent Service Category
            </label>
            <select
              id="serviceParentCategory"
              value={serviceparentCategoryId}
              onChange={handleServiceParentCategoryChange}
              className="w-full p-2 border rounded focus:outline-none"
            >
              <option value="">Select Parent Service Category</option>
              {serviceCategories.map(renderCategoryOptions)}
            </select>
          </div>

          {subServiceCategories.length > 0 && (
            <div className="mb-4">
              <label htmlFor="serviceSubCategory" className="block font-semibold mb-2">
                Sub-Service Category (optional)
              </label>
              <select
                id="serviceSubCategory"
                value={servicesubCategoryId}
                onChange={handleServiceSubCategoryChange}
                className="w-full p-2 border rounded focus:outline-none"
              >
                <option value="">Select Sub-Service Category</option>
                {subServiceCategories.map(renderCategoryOptions)}
              </select>
            </div>
          )}

          {subSubServiceCategories.length > 0 && (
            <div className="mb-4">
              <label htmlFor="serviceSubSubCategory" className="block font-semibold mb-2">
                Sub-Sub-Service Category (optional)
              </label>
              <select
                id="serviceSubSubCategory"
                value={servicesubSubCategoryId}
                onChange={handleServiceSubSubCategoryChange}
                className="w-full p-2 border rounded focus:outline-none"
              >
                <option value="">Select Sub-Sub-Service Category</option>
                {subSubServiceCategories.map(renderCategoryOptions)}
              </select>
            </div>
          )}
        </>
      )}

      {/* Question and Answer */}
      <div className="mb-4">
        <label htmlFor="question" className="block font-semibold mb-2">
          Question
        </label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          required
        />
      </div>

      <div className="mb-8">
        <label htmlFor="answer" className="block font-semibold mb-2">
          Answer
        </label>
        <TipTapEditor
          value={answer}
          onChange={setAnswer}
        />
      </div>

      {/* Status */}
      <div className="mb-4">
        <label htmlFor="status" className="block font-semibold mb-2">
          Status
        </label>
        <div className="flex items-center">
          <label className="mr-4 text-green-500">
            <input
              type="radio"
              value="active"
              checked={status === "active"}
              onChange={() => setStatus("active")}
              className="mr-2"
            />
            Active
          </label>
          <label className="text-red-500">
            <input
              type="radio"
              value="inactive"
              checked={status === "inactive"}
              onChange={() => setStatus("inactive")}
              className="mr-2"
            />
            Inactive
          </label>
        </div>
      </div>

      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
        Add FAQ
      </button>
    </form>
  );
};

export default FAQForm;
