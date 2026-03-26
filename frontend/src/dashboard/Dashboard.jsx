import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  BookText, 
  MessageSquare, 
  Briefcase 
} from 'lucide-react';

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
        <h1 className="text-xl font-semibold text-[#7a6b00] mb-4 pb-1 border-b border-[#7a6b00]">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Inquiries Card */}
        <div className="bg-emerald-500 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
          <div className="text-4xl font-bold mb-2">{dataCount.inquiryCount}</div>
          <div className="text-lg">Total Inquiries</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
            <MessageSquare className="w-16 h-16" />
          </div>
        </div>

        {/* Total Blogs Card */}
        <div className="bg-amber-500 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
          <div className="text-4xl font-bold mb-2">{dataCount.blogCount}</div>
          <div className="text-lg">Total Blogs</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
            <BookText className="w-16 h-16" />
          </div>
        </div>

        {/* Total Clients Card */}
        <div className="bg-purple-600 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
          <div className="text-4xl font-bold mb-2">{dataCount.clientCount}</div>
          <div className="text-lg">Total Clients</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
            <Users className="w-16 h-16" />
          </div>
        </div>

        {/* Job Applications Card */}
        <div className="bg-blue-500 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
          <div className="text-4xl font-bold mb-2">{dataCount.jobCount}</div>
          <div className="text-lg">Job Applications</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
            <Briefcase className="w-16 h-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


