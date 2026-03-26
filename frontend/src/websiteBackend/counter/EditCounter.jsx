import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditCounter = () => {
  const [title, setTitle] = useState("");
  const [count, setCount] = useState("");
  const [sign, setSign] = useState("");
  const [icon, setIcon] = useState("");
  const [status, setStatus] = useState("active");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCounter();
  }, []);

  const fetchCounter = async () => {
    try {
      const response = await axios.get(`/api/counter/getCounterById?id=${id}`, { withCredentials: true });
      const { title, count, sign, icon, status } = response.data;
      setTitle(title);
      setCount(count);
      setSign(sign);
      setIcon(icon);
      setStatus(status);
    } catch (error) {
      console.error("Error fetching counter:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/counter/updateCounter?id=${id}`,
        { title, count, sign, icon, status },
        { withCredentials: true }
      );
      navigate("/counter");
    } catch (error) {
      console.error("Error updating counter:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto bg-white shadow-md rounded">
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center mb-4">
        Edit Counter
      </h1>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Count</label>
        <input
          type="text"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Sign</label>
        <input
          type="text"
          value={sign}
          onChange={(e) => setSign(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Icon (Class Name)</label>
        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <button type="submit" className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600">
        Update Counter
      </button>
    </form>
  );
};

export default EditCounter;
