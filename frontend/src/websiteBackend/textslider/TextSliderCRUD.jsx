import React, { useState, useEffect } from "react";
import {
  Plus,
  Save,
  X,
  Loader,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const TextSliderCRUD = () => {
  const [items, setItems] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ text: "", suffix: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState("");

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/text-slider");
      const result = await response.json();
      if (result.success && result.data) {
        setItems(result.data.items || []);
        setIsActive(
          result.data.isActive !== undefined ? result.data.isActive : true
        );
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
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

  // Reset form
  const resetForm = () => {
    setFormData({ text: "", suffix: "" });
    setEditingIndex(null);
    setError("");
  };

  // Save entire state to server (since backend replaces the array)
  const saveToServer = async (updatedItems, updatedIsActive) => {
    setLoading(true);
    try {
      const response = await fetch("/api/text-slider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedItems,
          isActive: updatedIsActive,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setItems(result.data.items);
        setIsActive(result.data.isActive);
        resetForm();
      } else {
        setError(result.message || "Failed to save");
      }
    } catch (err) {
      console.error("Error saving data:", err);
      setError("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (Add or Update item)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      alert("Text is required");
      return;
    }

    let updatedItems = [...items];
    if (editingIndex !== null) {
      // Update existing
      updatedItems[editingIndex] = formData;
    } else {
      // Add new
      updatedItems.push(formData);
    }

    saveToServer(updatedItems, isActive);
  };

  // Handle Edit click
  const handleEdit = (index) => {
    setFormData(items[index]);
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Delete click
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const updatedItems = items.filter((_, i) => i !== index);
      saveToServer(updatedItems, isActive);
    }
  };

  // Handle Global Active Toggle
  const handleToggleActive = () => {
    saveToServer(items, !isActive);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Text Slider Management
          </h1>
          <button
            onClick={handleToggleActive}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            {isActive ? "Slider Active" : "Slider Inactive"}
          </button>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingIndex !== null ? "Edit Slide" : "Add New Slide"}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text *
              </label>
              <input
                type="text"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="e.g. Creative Design"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suffix
              </label>
              <input
                type="text"
                name="suffix"
                value={formData.suffix}
                onChange={handleInputChange}
                placeholder="e.g. //"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                {editingIndex !== null ? "Update" : "Add"}
              </button>
              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  <X size={18} /> Cancel
                </button>
              )}
            </div>
          </form>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Text
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Suffix
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No slides found. Add one above!
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item._id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.text}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.suffix || "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-green-500 hover:text-green-700 transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <FaTrashAlt size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TextSliderCRUD;
