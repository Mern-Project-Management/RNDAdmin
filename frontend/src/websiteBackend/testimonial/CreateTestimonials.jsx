import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateTestimonials = () => {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [testimony, setTestimony] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoAlts, setPhotoAlts] = useState([]);
  const [imgtitle, setImgtitle] = useState([]);
  const [video, setVideo] = useState(null);
  const [altVideo, setVideoAlt] = useState("");
  const [videotitle, setVideotitle] = useState("");
  const [heading, setHeading] = useState("");
  const [rating, setRating] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState(true);
  
  // Category hierarchy states
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState("");
  
  const [loading, setLoading] = useState(false);
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

  // Fetch main categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/services/getAll', {
        withCredentials: true
      });
      console.log('Categories fetched:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // Handle main category change and load its subcategories
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory("");
    setSelectedSubSubCategory("");
    setSubSubCategories([]);

    if (categoryId) {
      // Find the selected category and get its subCategories
      const selectedCat = categories.find(cat => cat._id === categoryId);
      if (selectedCat && selectedCat.subCategories && selectedCat.subCategories.length > 0) {
        setSubCategories(selectedCat.subCategories);
      } else {
        setSubCategories([]);
      }
    } else {
      setSubCategories([]);
    }
  };

  // Handle subcategory change and load its sub-subcategories
  const handleSubCategoryChange = (subCategoryId) => {
    setSelectedSubCategory(subCategoryId);
    setSelectedSubSubCategory("");

    if (subCategoryId) {
      // Find the selected subcategory and get its subSubCategory
      const selectedSubCat = subCategories.find(subCat => subCat._id === subCategoryId);
      if (selectedSubCat && selectedSubCat.subSubCategory && selectedSubCat.subSubCategory.length > 0) {
        setSubSubCategories(selectedSubCat.subSubCategory);
      } else {
        setSubSubCategories([]);
      }
    } else {
      setSubSubCategories([]);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      toast.error("You can only upload up to 5 photos");
      return;
    }
    setPhotos([...photos, ...files]);
    const newPhotoAlts = Array.from({ length: files.length }, () => "");
    setPhotoAlts([...photoAlts, ...newPhotoAlts]);

    const newImgtitles = Array.from({ length: files.length }, () => "");
    setImgtitle([...imgtitle, ...newImgtitles]);
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleDeleteImage = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    setPhotoAlts((prevPhotoAlts) => prevPhotoAlts.filter((_, i) => i !== index));
    setImgtitle((prevImgtitle) => prevImgtitle.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Determine which category level to use (use the most specific one selected)
    const categoryId = selectedSubSubCategory || selectedSubCategory || selectedCategory;
    
    if (!categoryId) {
      toast.error("Please select at least one category");
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('designation', designation);
      formData.append('testimony', testimony);
      formData.append('heading', heading);
      formData.append('rating', rating);
      formData.append('categoryId', categoryId);
      formData.append('priority', priority);
      formData.append('status', status);
      formData.append('altVideo', altVideo);
      formData.append('videotitle', videotitle);
      
      photos.forEach((photo, index) => {
        formData.append('photo', photo);
        formData.append('alt', photoAlts[index] || "");
        formData.append('imgtitle', imgtitle[index] || "");
      });

      if (video) {
        formData.append('video', video);
      }

      await axios.post('/api/testimonial/insertTestinomial', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      toast.success("Testimonial added successfully!");
      
      // Reset form fields
      setName("");
      setDesignation("");
      setTestimony("");
      setHeading("");
      setRating("");
      setPriority("medium");
      setPhotos([]);
      setVideo(null);
      setVideoAlt("");
      setImgtitle([]);
      setVideotitle("");
      setStatus(true);
      setPhotoAlts([]);
      setSelectedCategory("");
      setSelectedSubCategory("");
      setSelectedSubSubCategory("");
      setSubCategories([]);
      setSubSubCategories([]);
      
      setTimeout(() => navigate('/testimonials'), 1500);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add testimonial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-4xl mx-auto">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center mb-6">
        Add Testimonial
      </h1>

      {/* Category Selection Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Category Selection</h2>
        
        {/* Main Category */}
        <div className="mb-4">
          <label htmlFor="category" className="block font-semibold mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.category}
              </option>
            ))}
          </select>
        </div>

        {/* Sub Category */}
        {subCategories.length > 0 && (
          <div className="mb-4">
            <label htmlFor="subCategory" className="block font-semibold mb-2">
              Sub Category
              <span className="text-gray-500 text-sm ml-2">(Optional)</span>
            </label>
            <select
              id="subCategory"
              value={selectedSubCategory}
              onChange={(e) => handleSubCategoryChange(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Sub Category</option>
              {subCategories.map((subCat) => (
                <option key={subCat._id} value={subCat._id}>
                  {subCat.category}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sub Sub Category */}
        {subSubCategories.length > 0 && (
          <div className="mb-4">
            <label htmlFor="subSubCategory" className="block font-semibold mb-2">
              Sub Sub Category
              <span className="text-gray-500 text-sm ml-2">(Optional)</span>
            </label>
            <select
              id="subSubCategory"
              value={selectedSubSubCategory}
              onChange={(e) => setSelectedSubSubCategory(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Sub Sub Category</option>
              {subSubCategories.map((subSubCat) => (
                <option key={subSubCat._id} value={subSubCat._id}>
                  {subSubCat.category}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Selected Category Path Display */}
        {selectedCategory && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
            <span className="font-semibold">Selected Path: </span>
            <span className="text-blue-700">
              {categories.find(c => c._id === selectedCategory)?.category}
              {selectedSubCategory && ` → ${subCategories.find(sc => sc._id === selectedSubCategory)?.category}`}
              {selectedSubSubCategory && ` → ${subSubCategories.find(ssc => ssc._id === selectedSubSubCategory)?.category}`}
            </span>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="mb-4">
        <label htmlFor="name" className="block font-semibold mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="designation" className="block font-semibold mb-2">
          Designation <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="rating" className="block font-semibold mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="rating"
          value={rating}
          onChange={(e) => setRating(parseFloat(e.target.value))}
          step="0.5"
          min="1"
          max="5"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-8">
        <label htmlFor="testimony" className="block font-semibold mb-2">
          Testimony <span className="text-red-500">*</span>
        </label>
        <ReactQuill
          value={testimony}
          onChange={setTestimony}
          modules={modules}
          className="quill bg-white"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Priority</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="high"
              checked={priority === "high"}
              onChange={() => setPriority("high")}
              className="mr-2"
            />
            High
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="medium"
              checked={priority === "medium"}
              onChange={() => setPriority("medium")}
              className="mr-2"
            />
            Medium
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="low"
              checked={priority === "low"}
              onChange={() => setPriority("low")}
              className="mr-2"
            />
            Low
          </label>
        </div>
      </div>

      {/* Photos Section */}
      <div className="mt-12">
        <label htmlFor="photo" className="block font-semibold mb-2">
          Photos <span className="text-gray-500 text-sm">(Max 5)</span>
        </label>
        <input
          type="file"
          name="photo"
          id="photo"
          multiple
          onChange={handlePhotoChange}
          className="border rounded focus:outline-none p-2"
          accept="image/*"
        />
        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group flex flex-col border rounded-lg p-3 bg-gray-50">
                <div className="relative w-full">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Testimonial ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex items-center justify-center hover:bg-red-600 focus:outline-none shadow-lg"
                  >
                    ×
                  </button>
                </div>
                <label className="block mt-3">
                  <span className="text-sm font-medium">Alternative Text:</span>
                  <input
                    type="text"
                    value={photoAlts[index] || ""}
                    onChange={(e) => {
                      const newPhotoAlts = [...photoAlts];
                      newPhotoAlts[index] = e.target.value;
                      setPhotoAlts(newPhotoAlts);
                    }}
                    className="w-full p-2 border rounded focus:outline-none mt-1"
                    placeholder="Alt text for SEO"
                  />
                </label>
                <label className="block mt-2">
                  <span className="text-sm font-medium">Title Text:</span>
                  <input
                    type="text"
                    value={imgtitle[index] || ""}
                    onChange={(e) => {
                      const newImgtitles = [...imgtitle];
                      newImgtitles[index] = e.target.value;
                      setImgtitle(newImgtitles);
                    }}
                    className="w-full p-2 border rounded focus:outline-none mt-1"
                    placeholder="Title text"
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Section */}
      <div className="mt-6">
        <label htmlFor="video" className="block font-semibold mb-2">Video</label>
        <input
          type="file"
          id="video"
          onChange={handleVideoChange}
          className="border rounded focus:outline-none p-2"
          accept="video/*"
        />
        {video && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-600 mb-3">
              Selected: {video.name}
            </p>
            <div className="mb-3">
              <label htmlFor="videoAlt" className="block font-semibold mb-2">
                Video Alt Text
              </label>
              <input
                type="text"
                id="videoAlt"
                value={altVideo}
                onChange={(e) => setVideoAlt(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none"
                placeholder="Describe the video"
              />
            </div>
            <div>
              <label htmlFor="videotitle" className="block font-semibold mb-2">
                Video Title Text
              </label>
              <input
                type="text"
                id="videotitle"
                value={videotitle}
                onChange={(e) => setVideotitle(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none"
                placeholder="Video title"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Section */}
      <div className="mt-6">
        <label className="block font-semibold mb-2">Status</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value={true}
              checked={status === true}
              onChange={() => setStatus(true)}
              className="mr-2"
            />
            Active
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value={false}
              checked={status === false}
              onChange={() => setStatus(false)}
              className="mr-2"
            />
            Inactive
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#ffd333] hover:bg-[#edc32f] text-[#1a1a1a] py-2 px-6 rounded font-semibold focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Adding..." : "Add Testimonial"}
        </button>
        <button
          type="button"
          onClick={() => navigate('/testimonials')}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded focus:outline-none transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateTestimonials;
