import React, { useState } from 'react';

const ImportExcel = () => {
  // Separate file states for categories & products
  const [categoryFile, setCategoryFile] = useState(null);
  const [productFile, setProductFile] = useState(null);

  // Status messages
  const [categoryStatus, setCategoryStatus] = useState('');
  const [productStatus, setProductStatus] = useState('');

  // Helper to validate Excel files
  const isExcelFile = (file) =>
    file && (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls'));

  // Generic upload function
  const uploadFile = async (file, endpoint, setStatus) => {
    if (!file) {
      setStatus('Please select a file.');
      return;
    }

    if (!isExcelFile(file)) {
      setStatus('Please select a valid Excel file (.xlsx or .xls).');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setStatus('Uploading...');
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setStatus(`Success: ${JSON.stringify(result)}`);
      } else {
        const errorText = await response.text();
        setStatus(`Failed (${response.status}): ${errorText || response.statusText}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  // Handlers
  const handleCategoryImport = () => uploadFile(categoryFile, '/api/importFun/import-categories', setCategoryStatus);
  const handleProductImport = () => uploadFile(productFile, '/api/importFun/import-products', setProductStatus);

  return (
    <div className="max-w-7xl mx-auto mt-10 p-8 bg-gray-50 rounded-xl shadow-lg space-y-10">
      <h1 className="text-3xl font-bold text-center text-gray-800">Import Data from Excel</h1>

     <div className='flex'>
         {/* ====== Category Import ====== */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Import Categories</h2>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            setCategoryFile(e.target.files[0] || null);
            setCategoryStatus('');
          }}
          className="block w-full text-sm text-gray-600 
                     file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 
                     file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 
                     hover:file:bg-indigo-100 mb-4"
        />

        <button
          onClick={handleCategoryImport}
          disabled={!categoryFile}
          className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-md 
                     hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition"
        >
          Import Categories
        </button>

        {categoryStatus && (
          <p
            className={`mt-4 p-4 rounded-md text-sm font-medium ${
              categoryStatus.includes('Success') || categoryStatus.includes('Uploading')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {categoryStatus}
          </p>
        )}
      </section>

      {/* ====== Product Import ====== */}
      <section className="bg-white p-6  rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Import Products</h2>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            setProductFile(e.target.files[0] || null);
            setProductStatus('');
          }}
          className="block w-full text-sm text-gray-600 
                     file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 
                     file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 
                     hover:file:bg-teal-100 mb-4"
        />

        <button
          onClick={handleProductImport}
          disabled={!productFile}
          className="w-full py-3 px-4 bg-teal-600 text-white font-medium rounded-md 
                     hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition"
        >
          Import Products
        </button>

        {productStatus && (
          <p
            className={`mt-4 p-4 rounded-md text-sm font-medium ${
              productStatus.includes('Success') || productStatus.includes('Uploading')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {productStatus}
          </p>
        )}
      </section>
     </div>
    </div>
  );
};

export default ImportExcel;
