import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [dataCount, setDataCount] = useState({
    blogCount: 0,
    clientCount: 0,
    jobCount: 0,
    inquiryCount: 0,
  });

  // Fetch data count from the API
  useEffect(() => {
    const fetchDataCount = async () => {
      try {
        const response = await axios.get('/api/count/dataCount');
       console.log(response)
        // Assuming the response is structured like:
        // { blogCount, clientCount, jobCount, inquiryCount }
        setDataCount(response.data);
      } catch (error) {
        console.error('Error fetching data count:', error);
      }
    };

    fetchDataCount();
  }, []);

  return (
    <div className="w-full">
      <div>
        <h1 className="text-xl font-semibold text-purple-800 mb-4 pb-1 border-b border-purple-800">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Inquiries Card */}
        <div className="bg-emerald-500 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
          <div className="text-4xl font-bold mb-2">{dataCount.inquiryCount}</div>
          <div className="text-lg">Total Inquiries</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Total Blogs Card */}
        <div className="bg-amber-500 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
          <div className="text-4xl font-bold mb-2">{dataCount.blogCount}</div>
          <div className="text-lg">Total Blogs</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM5 4v14h14V8h-5V3H5z" />
              <path d="M7 8h5M7 12h10M7 16h10" />
            </svg>
          </div>
        </div>

        {/* Total Clients Card */}
        <div className="bg-purple-600 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
          <div className="text-4xl font-bold mb-2">{dataCount.clientCount}</div>
          <div className="text-lg">Total Clients</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
        </div>

        {/* Job Applications Card */}
        <div className="bg-blue-500 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
          <div className="text-4xl font-bold mb-2">{dataCount.jobCount}</div>
          <div className="text-lg">Job Applications</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V20a2 2 0 002 2h14a2 2 0 002-2v-6.745zM16 8V5a3 3 0 00-6 0v3h6z" />
              <path d="M9 8h6V5a3 3 0 00-6 0v3z" />
              <path d="M20 8H4v5.255A23.931 23.931 0 0012 15c3.183 0 6.22-.62 9-1.745V8z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
