import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const SocialMediaTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Based on controller: getAllSocialMedia
      const response = await axios.get('/api/socialMedia');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      // Based on controller: deleteSocialMedia uses req.query.id
      await axios.delete(`/api/socialMedia/delete?id=${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item.');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Social Media Links</h2>
        <Link 
          to="/social-media/add" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FaPlus /> Add New
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Link</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{item.name}</td>
                  <td className="p-4 text-gray-500 truncate max-w-xs">
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {item.link}
                    </a>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-4 justify-end">
                      <Link to={`/social-media/edit/${item._id}`}>
                        <FaEdit className="h-5 w-5 text-green-500 hover:text-green-700 transition" title="Edit" />
                      </Link>
                      <button onClick={() => handleDelete(item._id)}>
                        <FaTrash className="h-5 w-5 text-red-500 hover:text-red-700 transition" title="Delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No social media links found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SocialMediaTable;
