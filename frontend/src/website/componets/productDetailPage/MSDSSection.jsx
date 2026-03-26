import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaWhatsapp } from "react-icons/fa";
import { useGetWhatsUpInfoQuery } from '@/slice/whatsUpInfo/WhatsUpInfo';

export default function MSDSSection({ msds, specs, name, onInquiry }) {
  const { data: whatsUpInfo, isLoading } = useGetWhatsUpInfoQuery();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (whatsUpInfo && whatsUpInfo.length > 0) {
      console.log(whatsUpInfo[0])
      setPhoneNumber(whatsUpInfo[0].number);
      setMessage(`Hi, I'm interested in ${name}`);
    }
  }, [whatsUpInfo, name]);

  const openPdf = (type) => {
    const baseUrl = type === 'msds' 
      ? `/api/image/msds/view/${encodeURIComponent(msds)}`
      : `/api/image/specs/view/${encodeURIComponent(specs)}`;
    window.open(baseUrl, '_blank');
  };

  const handleWhatsAppClick = () => {
    console.log(phoneNumber)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 p-5 shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-blue-900 border-b border-blue-200 pb-3">
        {name} MSDS (Material Safety Data Sheet) or SDS, COA and Specs
      </h2>
      <div className="flex gap-4 mb-3">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700"
          onClick={() => openPdf('specs')}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Specs
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700"
          onClick={() => openPdf('msds')}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          MSDS
        </Button>
        <Button
          onClick={onInquiry}
          className="w-1/4 bg-[#1290ca] hover:bg-[#0f7aa8] transition-colors duration-300 text-white text-md py-5 flex items-center gap-2"
        >
          Inquiry Now
        </Button>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleWhatsAppClick}
        >
          <FaWhatsapp className="text-4xl text-green-500"/>
          {/* <span className="text-green-600">Chat on WhatsApp</span> */}
        </div>
      </div>
    </div>
  );
}
