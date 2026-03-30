// components/TableHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from "react-icons/fa";

const TableHeader = ({ navigate }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-bold text-gray-700 font-serif uppercase">FAQs</h1>
      <button className="px-5 py-2.5 bg-[#ffd333] text-[#1a1a1a] rounded-lg hover:bg-[#edc32f] transition duration-300 font-semibold shadow-md inline-flex items-center justify-center">
        <Link to="/faq/createFAQ" className="flex items-center gap-2"><FaPlus size={12} /> Add FAQ</Link>
      </button>
    </div>
  );
};

export default TableHeader;
