import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const FooterTable = () => {
  const [footers, setFooters] = useState([]);
  const navigate = useNavigate();

  const fetchFooters = async () => {
    try {
      const response = await axios.get('/api/footer/get');
      setFooters(response.data.data);
    } catch (error) {
      console.error("Error fetching footers:", error);
    }
  };

  useEffect(() => {
    fetchFooters();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this footer?")) {
      try {
        await axios.delete(`/api/footer/delete?id=${id}`);
        fetchFooters();
      } catch (error) {
        console.error("Error deleting footer:", error);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-footer/${id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Footer Management</h1>
        <Button onClick={() => navigate('/footer-form')}>
          <Plus className="mr-2 h-4 w-4" /> Add New Footer
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Social Links</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {footers.length > 0 ? (
              footers.map((footer) => (
                <tr key={footer._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 truncate max-w-xs">{footer.description}</td>
                  <td className="px-6 py-4">{footer.social?.length || 0}</td>
                  <td className="px-6 py-4 flex gap-4">
                    <button onClick={() => handleEdit(footer._id)}>
                      <FaEdit className="h-5 w-5 text-green-500 hover:text-green-700 transition" />
                    </button>
                    <button onClick={() => handleDelete(footer._id)}>
                      <FaTrashAlt className="h-5 w-5 text-red-500 hover:text-red-700 transition" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No footers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FooterTable;
