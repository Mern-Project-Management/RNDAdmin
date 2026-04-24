// components/TableHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from "react-icons/fa";

const TableHeader = ({ navigate }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-bold text-gray-700 font-serif uppercase">FAQ List</h1>
    </div>
  );
};

export default TableHeader;
