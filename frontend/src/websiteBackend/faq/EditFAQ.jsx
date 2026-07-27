import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import TipTapEditor from '@/components/TipTapEditor';

const EditFAQ = () => {
  const { id: faqId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("active");

  // Service category states
  const [serviceCategories, setServiceCategories] = useState([]);
  const [serviceParentCategoryId, setServiceParentCategoryId] = useState("");
  const [serviceSubCategoryId, setServiceSubCategoryId] = useState("");
  const [serviceSubSubCategoryId, setServiceSubSubCategoryId] = useState("");

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
    const fetchData = async () => {
      await fetchServiceCategories();
      await fetchFAQData();
    };
    fetchData();
  }, [faqId]);

  // Fetch service categories
  const fetchServiceCategories = async () => {
    try {
      const response = await axios.get('/api/services/getAll', { withCredentials: true });
      setServiceCategories(response.data);
    } catch (error) {
      console.error('Error fetching service categories:', error);
    }
  };

  // Fetch FAQ data by id
  const fetchFAQData = async () => {
    try {
      const response = await axios.get(`/api/faq/getFAQById?id=${faqId}`, { withCredentials: true });
      const { question, answer, status, serviceparentCategoryId, servicesubCategoryId, servicesubSubCategoryId } = response.data.data;
      setQuestion(question);
      setAnswer(answer);
      setStatus(status);
      setServiceParentCategoryId(serviceparentCategoryId);
      setServiceSubCategoryId(servicesubCategoryId);
      setServiceSubSubCategoryId(servicesubSubCategoryId);
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const faqData = {
        question,
        answer,
        status,
        serviceparentCategoryId: serviceParentCategoryId,
        servicesubCategoryId: serviceSubCategoryId,
        servicesubSubCategoryId: serviceSubSubCategoryId
      };

      await axios.put(`/api/faq/updateFAQ?id=${faqId}`, faqData, { withCredentials: true });
      navigate("/faq");
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const handleServiceParentCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setServiceParentCategoryId(selectedCategoryId);
    setServiceSubCategoryId("");
    setServiceSubSubCategoryId("");
  };

  const handleServiceSubCategoryChange = (e) => {
    const selectedSubCategoryId = e.target.value;
    setServiceSubCategoryId(selectedSubCategoryId);
    setServiceSubSubCategoryId("");
  };

  // Get subcategories for service categories
  const getServiceSubCategories = (categoryId) => {
    const category = serviceCategories.find(category => category.slug === categoryId);
    return category?.subCategories || [];
  };

  // Get sub-subcategories for service categories
  const getServiceSubSubCategories = (categoryId, subCategoryId) => {
    const category = serviceCategories.find(category => category.slug === categoryId);
    const subCategory = category?.subCategories.find(sub => sub.slug === subCategoryId);
    return subCategory?.subSubCategory || [];
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Edit FAQ</h1>

      {/* Service Categories */}
      <div className="mb-4">
        <label htmlFor="serviceParentCategory" className="block font-semibold mb-2">
          Service Parent Category
        </label>
        <select
          id="serviceParentCategory"
          value={serviceParentCategoryId}
          onChange={handleServiceParentCategoryChange}
          className="w-full p-2 border rounded focus:outline-none"
        >
          <option value="">Select Service Parent Category</option>
          {serviceCategories.map(category => (
            <option key={category._id} value={category.slug}>
              {category.category}
            </option>
          ))}
        </select>
      </div>

      {getServiceSubCategories(serviceParentCategoryId).length > 0 && (
        <div className="mb-4">
          <label htmlFor="serviceSubCategory" className="block font-semibold mb-2">
            Service Subcategory
          </label>
          <select
            id="serviceSubCategory"
            value={serviceSubCategoryId}
            onChange={handleServiceSubCategoryChange}
            className="w-full p-2 border rounded focus:outline-none"
          >
            <option value="">Select Service Subcategory</option>
            {getServiceSubCategories(serviceParentCategoryId).map(subCategory => (
              <option key={subCategory._id} value={subCategory.slug}>
                {subCategory.category}
              </option>
            ))}
          </select>
        </div>
      )}

      {getServiceSubSubCategories(serviceParentCategoryId, serviceSubCategoryId).length > 0 && (
        <div className="mb-4">
          <label htmlFor="serviceSubSubCategory" className="block font-semibold mb-2">
            Service Sub-Subcategory
          </label>
          <select
            id="serviceSubSubCategory"
            value={serviceSubSubCategoryId}
            onChange={(e) => setServiceSubSubCategoryId(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none"
          >
            <option value="">Select Service Sub-Subcategory</option>
            {getServiceSubSubCategories(serviceParentCategoryId, serviceSubCategoryId).map(subSubCategory => (
              <option key={subSubCategory._id} value={subSubCategory.slug}>
                {subSubCategory.category}
              </option>
            ))}
          </select>
        </div>
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
      <div className="mb-4">
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
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
        Update FAQ
      </button>
    </form>
  );
};

export default EditFAQ;
