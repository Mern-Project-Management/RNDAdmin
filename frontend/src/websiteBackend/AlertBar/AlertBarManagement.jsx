import React, { useState, useEffect } from "react";
import {
  Save,
  Loader,
  ToggleLeft,
  ToggleRight,
  Info,
  X
} from "lucide-react";
import axios from "axios";

const AlertBarManagement = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    text: "",
    status: "active",
    link: "#",
    linkText: "Know More"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch data from API
  const fetchData = async () => {
    setFetching(true);
    try {
      const response = await axios.get("/api/alertBar");
      if (response.data) {
        setFormData({
          text: response.data.text || "",
          status: response.data.status || "active",
          link: response.data.link || "#",
          linkText: response.data.linkText || "Know More"
        });
      }
    } catch (err) {
      console.error("Error fetching alert bar data:", err);
      setError("Failed to load alert bar settings");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle toggle status
  const handleToggleStatus = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === "active" ? "inactive" : "active"
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/alertBar/update", formData);
      if (response.status === 200) {
        setSuccess("Alert bar settings updated successfully!");
        // Update local state just in case
        setFormData({
          text: response.data.text,
          status: response.data.status,
          link: response.data.link,
          linkText: response.data.linkText
        });
      }
    } catch (err) {
      console.error("Error updating alert bar:", err);
      setError("Failed to update alert bar settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-[#ffd333]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alert Bar Management</h1>
            <p className="text-gray-500 mt-1">Control the global notification bar shown at the top of your website.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${formData.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
              Status: {formData.status === 'active' ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={handleToggleStatus}
              className={`p-1 rounded-full transition-colors ${
                formData.status === "active" ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"
              }`}
            >
              {formData.status === "active" ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Info size={20} className="text-blue-500" />
            Live Preview
          </h2>
          {formData.status === 'active' ? (
             <div className="bg-black text-white py-3 px-4 rounded-lg flex items-center justify-between text-sm md:text-base transition-all">
                <span className="truncate">{formData.text || "Your alert message will appear here..."}</span>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <a href={formData.link} className="font-bold hover:underline">
                    {formData.linkText}
                  </a>
                  <button className="text-white hover:text-gray-300">
                    <X size={18} />
                  </button>
                </div>
             </div>
          ) : (
            <div className="bg-gray-100 text-gray-400 py-8 px-4 rounded-lg text-center border-2 border-dashed border-gray-200">
              The alert bar is currently hidden
            </div>
          )}
        </div>

        {/* Form Settings */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alert Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alert Message
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd333] focus:border-transparent transition-all outline-none"
                  placeholder="Enter the message to display in the alert bar..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Link URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Action Link (URL)
                  </label>
                  <input
                    type="text"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd333] focus:border-transparent transition-all outline-none"
                    placeholder="e.g. /contact or https://example.com"
                  />
                </div>

                {/* Link Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    name="linkText"
                    value={formData.linkText}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffd333] focus:border-transparent transition-all outline-none"
                    placeholder="e.g. Know More, Click Here"
                  />
                </div>
              </div>

              {/* Status Section in Form */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${formData.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span className="font-medium text-gray-700">Display Alert Bar on Website</span>
                   </div>
                   <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        formData.status === 'active' ? 'bg-[#ffd333]' : 'bg-gray-200'
                    }`}
                    >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                    </button>
                </div>
              </div>

              {/* Feedback messages */}
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm border border-green-100">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#ffd333] text-[#1a1a1a] font-bold px-8 py-3 rounded-lg hover:bg-[#edc32f] transform active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:active:scale-100"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                  Save All Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertBarManagement;
