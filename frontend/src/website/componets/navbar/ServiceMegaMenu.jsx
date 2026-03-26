import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const ServiceMegaMenu = ({ serviceCategories = [] }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(serviceCategories[0] || null);

  const handleLinkClick = (path) => {
    navigate(path);
  };

  if (!serviceCategories || serviceCategories.length === 0) return null;

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-full w-[1000px] bg-white text-gray-800 shadow-2xl rounded-b-xl overflow-hidden border-t-4 border-[#ffcc00] flex animate-in fade-in slide-in-from-top-2 duration-300 z-50">
      {/* Left Sidebar: Main Categories */}
      <div className="w-1/3 bg-gray-50 border-r border-gray-100 py-6 px-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
          Our Services
        </h3>
        <div className="space-y-1">
          {serviceCategories.map((category) => (
            <div
              key={category._id}
              onMouseEnter={() => setActiveCategory(category)}
              onClick={() => handleLinkClick(`/services/${category.slug}`)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                activeCategory?._id === category._id
                  ? "bg-[#ffcc00] text-white shadow-md font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span>{category.category}</span>
              <ChevronRight className={`size-4 ${activeCategory?._id === category._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Middle/Main Area: Subcategories and Featured Image */}
      <div className="flex-1 flex bg-white">
        {/* Subcategories List */}
        <div className="w-1/2 p-8 overflow-y-auto max-h-[500px]">
          {activeCategory && (
            <>
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                {activeCategory.category}
                <div className="h-1 w-10 bg-[#ffcc00] rounded-full"></div>
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {activeCategory.subCategories && activeCategory.subCategories.length > 0 ? (
                  activeCategory.subCategories.map((sub) => (
                    <div
                      key={sub._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLinkClick(`/services/${activeCategory.slug}/${sub.slug}`);
                      }}
                      className="group flex flex-col cursor-pointer"
                    >
                      <span className="text-base font-medium text-gray-700 group-hover:text-[#ffcc00] transition-colors">
                        {sub.category}
                      </span>
                      <span className="text-xs text-gray-400 line-clamp-1">
                        Professional {sub.category} solutions
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    Explore our professional {activeCategory.category} services.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Featured Image Section - This is where dropdownPhoto is used! */}
        <div className="w-1/2 p-6 bg-gray-50 flex flex-col">
          <div className="relative flex-1 rounded-xl overflow-hidden shadow-inner group">
            {activeCategory && (
              <>
                <img
                  src={activeCategory.dropdownPhoto ? `/api/logo/download/${activeCategory.dropdownPhoto}` : "/api/logo/download/default-service.webp"}
                  alt={activeCategory.dropdownPhotoAlt || activeCategory.category}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs font-medium text-[#ffcc00] uppercase tracking-wider mb-1">Featured Service</p>
                  <h5 className="text-lg font-bold leading-tight uppercase">{activeCategory.category}</h5>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={() => handleLinkClick(`/services/${activeCategory?.slug}`)}
            className="mt-4 w-full py-3 bg-white border-2 border-[#ffcc00] text-[#7a6b00] font-bold rounded-lg hover:bg-[#ffcc00] hover:text-white transition-all duration-300 text-sm uppercase tracking-wide shadow-sm"
          >
            View All Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceMegaMenu;
