import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Footer() {
  const [footerData, setFooterData] = useState(null);
  
  useEffect(() => {
    axios.get('/api/footer/get')
      .then((response) => {
        if (response.data.data && response.data.data.length > 0) {
          setFooterData(response.data.data[0]);
        }
      })
      .catch((error) => {
        console.error('Error fetching footer data:', error);
      });
  }, []);

  if (!footerData) {
    return (
      <footer className="text-[#1a1a1a] py-12 bg-[#ffcc00]">
        <div className="max-w-[75rem] mx-auto px-4 text-center">Loading...</div>
      </footer>
    );
  }

  return (
    <>
      <footer
        className="text-[#1a1a1a] py-12 bg-[#ffcc00]" // Add a bg color as fallback
      >
        <div className="max-w-[75rem] mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <p className="text-base mb-6 max-w-2xl">{footerData.description}</p>
            <div className="flex gap-6 text-2xl">
              {footerData.social.map((item, index) => (
                <a key={index} href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 transition-colors">
                  <i className={item.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <div className="w-full bg-black/95 p-2">
        <div className="max-w-[75rem] mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} RnD Technosoft. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}



