import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddCounter = () => {
  const [title, setTitle] = useState("");
  const [count, setCount] = useState("");
  const [sign, setSign] = useState("+");
  const [icon, setIcon] = useState("");
  const [status, setStatus] = useState("active");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/counter/createCounter",
        { title, count, sign, icon, status },
        { withCredentials: true }
      );
      navigate("/counter");
    } catch (error) {
      console.error("Error adding counter:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-start pt-10">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Add Counter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
                placeholder="e.g. Happy Clients"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
              <input
                type="text"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
                placeholder="e.g. 150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sign</label>
              <input
                type="text"
                value={sign}
                onChange={(e) => setSign(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g. +"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Class Name)</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g. fa fa-user"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/counter')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#ffd333] text-[#1a1a1a] font-semibold border-none rounded-md hover:bg-[#edc32f] transition"
            >
              Add Counter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCounter;
