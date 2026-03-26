import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OurServiceBanner = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [headingPhoto, setHeadingPhoto] = useState("");
  const [alt, setAlt] = useState("");
  const [imgTitle, setImgTitle] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const fetchHeadings = async () => {
    try {
      const response = await axios.get(
        "/api/pageHeading/heading?pageType=our-service",
        { withCredentials: true }
      );
      const { heading, subheading, photo, alt, imgTitle } = response.data;
      setHeading(heading || "");
      setSubheading(subheading || "");
      setHeadingPhoto(photo || "");
      setAlt(alt || "");
      setImgTitle(imgTitle || "");
      setHasChanges(false);
    } catch (error) {
      console.error("Error fetching headings:", error);
    }
  };

  const saveHeadings = async () => {
    const formData = new FormData();
    formData.append("heading", heading);
    formData.append("subheading", subheading);
    formData.append("alt", alt);
    formData.append("imgTitle", imgTitle);
    if (headingPhoto instanceof File) {
      formData.append("photo", headingPhoto);
    }
    try {
      await axios.put(
        "/api/pageHeading/updateHeading?pageType=our-service",
        formData,
        { withCredentials: true }
      );
      toast.success("Our Service Banner updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Re-fetch from server so state stays in sync (persists after navigation)
      await fetchHeadings();
    } catch (error) {
      console.error("Error saving headings:", error);
      toast.error("Failed to update. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    fetchHeadings();
  }, []);

  const markChanged = () => setHasChanges(true);

  return (
    <div className="p-4 overflow-x-auto">
      <ToastContainer />
      <h1 className="text-xl font-bold text-gray-700 font-serif uppercase mb-6">
        Our Service Banner
      </h1>
      <div className="mb-8 border border-gray-200 shadow-lg p-4 rounded">
        <h2 className="text-lg font-semibold text-gray-600 font-serif mb-4">
          Edit Page Headings
        </h2>
        <div className="grid md:grid-cols-2 md:gap-4 grid-cols-1">
          {/* Heading */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">
              Heading
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => { setHeading(e.target.value); markChanged(); }}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
              placeholder="Enter page heading..."
            />
          </div>

          {/* Subheading */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">
              Subheading
            </label>
            <input
              type="text"
              value={subheading}
              onChange={(e) => { setSubheading(e.target.value); markChanged(); }}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
              placeholder="Enter subheading..."
            />
          </div>

          {/* Upload Image */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => { setHeadingPhoto(e.target.files[0]); markChanged(); }}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
            {headingPhoto && (
              <div className="mt-2">
                <img
                  src={
                    headingPhoto instanceof File
                      ? URL.createObjectURL(headingPhoto)
                      : `/api/logo/download/${headingPhoto}`
                  }
                  alt={alt}
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>

          {/* Alt Text */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">
              Alt Text
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => { setAlt(e.target.value); markChanged(); }}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
              placeholder="Enter image alt text..."
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={saveHeadings}
            disabled={!hasChanges}
            className="px-4 py-2 bg-[#ffcc00] text-[#1a1a1a] rounded hover:bg-[#e6b800] transition duration-300 font-serif disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Headings
          </button>
          {!hasChanges && (
            <span className="text-gray-400 text-sm">No changes to save</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OurServiceBanner;




