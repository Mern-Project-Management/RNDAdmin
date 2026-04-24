import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from 'react-modal';
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";

import HeadingSection from "./HeadingSection";
import TableHeader from "./TableHeader.jsx";
import SearchBar from "./FaqSearchbar.jsx";
import { FaqTableComponent } from "./FaqTableComponent.jsx";

import FaqModal from "./FaqModel.jsx";
import FAQForm from "./CreateFAQ.jsx";

Modal.setAppElement('#root');

const MainFaqSection = ({ type }) => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState({ heading: '', subheading: '' });
  const navigate = useNavigate();

  const pageSize = 20;

  const notify = () => {
    toast.success("Updated Successfully!");
  };

  const handleView = (faq) => {
    setSelectedFAQ(faq);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFAQ(null);
  };

  const fetchData = async (pageIndex) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/faq/getFaq?page=${pageIndex + 1}`, { withCredentials: true });
      const faqsWithIds = response.data.data.map((faqItem, index) => {
        // Normalize category name from various possible shapes returned by the API
        const categoryName = faqItem.category?.name || faqItem.category ||
          (faqItem.serviceparentCategoryId && (faqItem.serviceparentCategoryId.category || faqItem.serviceparentCategoryId.name)) ||
          faqItem.serviceparentCategoryId?.category;

        return {
          ...faqItem,
          id: pageIndex * pageSize + index + 1,
          categoryName: categoryName || 'Uncategorized',
        };
      });
    console.log("Fetched FAQs:", faqsWithIds);
      setFaqs(faqsWithIds);
      setPageCount(Math.ceil(response.data.total / pageSize));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFaq = async (id) => {
    try {
      await axios.delete(`/api/faq/deleteFaq?id=${id}`, { withCredentials: true });
      fetchData(pageIndex);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHeadings = async () => {
    try {
      const pageType = type === 'service' ? 'our-service-faq' : 'faq';
      const response = await axios.get(`/api/pageHeading/heading?pageType=${pageType}`, { withCredentials: true });
      const { heading, subheading } = response.data;
      setHeading(heading || '');
      setSubheading(subheading || '');
    } catch (error) {
      console.error(error);
    }
  };

  const validateForm = () => {
    const newErrors = { heading: '', subheading: '' };
    let isValid = true;

    if (!heading.trim()) {
      newErrors.heading = 'Heading is required';
      isValid = false;
    }
    if (!subheading.trim()) {
      newErrors.subheading = 'Subheading is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const saveHeadings = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const pageType = type === 'service' ? 'our-service-faq' : 'faq';
      await axios.put(`/api/pageHeading/updateHeading?pageType=${pageType}`, {
        pagetype: pageType,
        heading,
        subheading,
      }, { withCredentials: true });
      notify();
    } catch (error) {
      console.error('Error saving FAQ headings:', error);
      toast.error(error.response?.data?.message || 'Failed to save FAQ headings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pageIndex);
  }, [pageIndex, type]);

  useEffect(() => {
    fetchHeadings();
  }, [type]);

  return (
    <div className="p-4 overflow-x-auto">
      <ToastContainer />
      
      {type !== 'service' && (
        <HeadingSection 
          heading={heading}
          subheading={subheading}
          setHeading={setHeading}
          setSubheading={setSubheading}
          saveHeadings={saveHeadings}
          errors={errors}
          loading={loadings}
        />
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <FAQForm onSuccess={() => fetchData(pageIndex)} type={type} />
      </div>
      
      <TableHeader navigate={navigate} />
      
      <SearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <h2 className="text-md font-semibold mb-4">{type === 'service' ? 'Existing FAQs' : 'Manage FAQs'}</h2>
      
      {loadings ? (
        <div className="flex justify-center">
          <UseAnimations animation={loading} size={56} />
        </div>
      ) : (
        <>
          {faqs.length === 0 ? (
            <div className="flex justify-center items-center">
              <iframe 
                className="w-96 h-96" 
                src="https://lottie.host/embed/1ce6d411-765d-4361-93ca-55d98fefb13b/AonqR3e5vB.json"
              ></iframe>
            </div>
          ) : (
            <FaqTableComponent 
              faqs={faqs}
              searchTerm={searchTerm}
              navigate={navigate}
              handleView={handleView}
              deleteFaq={deleteFaq}
              simple={type === 'service'}
            />
          )}
        </>
      )}
      
      
      <FaqModal 
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        selectedFAQ={selectedFAQ}
      />
    </div>
  );
};

export default MainFaqSection;
