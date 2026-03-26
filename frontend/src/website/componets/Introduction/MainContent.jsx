'use client'

import React, { useState } from 'react';
import { ArrowBigLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaArrowRight } from "react-icons/fa";
import { cn } from '@/lib/utils';
import AboutDescription from '../home/AboutUs';
import MissionVision from './MissionVision';
import { useLocation, Link } from 'react-router-dom';
import { useGetBannerByPageSlugQuery } from '@/slice/banner/banner';
import img from "../../images/introduction.png";
import { Banner } from '../Banner';

const menuItems = [
  {
    title: 'Corporate Profile',
    items: [
      { title: 'Introduction', href: '/introduction', active: false },
      { title: 'Vision & Mission', href: '/vision-mission' },
    ]
  }
];

export default function MainContent() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname.replace(/^\//, '') || 'introduction'; // Remove leading slash and default to 'introduction'
  const { data: banners, isLoading } = useGetBannerByPageSlugQuery(path);

  const MenuItem = ({ title, href }) => {
    const isActive = location.pathname === href || 
                    (href === '/introduction' && location.pathname === '/');
    
    return (
      <Link
        to={href}
        className={cn(
          'flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:text-white hover:bg-[#264796]',
          'last:mb-0 mb-2',
          isActive
            ? 'bg-[#264796] text-white'
            : 'text-gray-700'
        )}
      >
        <FaArrowRight className={cn("h-4 w-4", isActive && "text-orange-500")} />
        {title}
      </Link>
    );
  };

  const breadcrumbText = location.pathname === '/vision-mission' ? 'Vision & Mission' : 'Introduction';

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {banners && banners.length > 0 ? (
        <Banner imageUrl={`/api/image/download/${banners[0].image}`} />
      ) : (
        <Banner imageUrl={img} />
      )}
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="pt-3">
          <div className="mx-auto max-w-[75rem] border-b px-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-gray-900">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/introduction" className="hover:text-gray-900">Corporate</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-orange-500">{breadcrumbText}</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[75rem] px-4 py-8">
          <h1 className='text-2xl font-bold'>
            {location.pathname === '/vision-mission' ? 'Vision & Mission' : 'Introduction'}
          </h1>
          <div className='w-16 h-1 bg-orange-500 mb-6'></div>

          <div className="lg:grid lg:grid-cols-[350px_1fr] gap-8">
            {/* Mobile Menu */}
            <div className="lg:hidden mb-6">
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full flex justify-between">
                    Corporate Profile
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(100vw-2rem)] mt-2" align="start">
                  <nav className="max-h-[80vh] overflow-auto">
                    {menuItems[0].items.map((item) => (
                      <MenuItem key={item.title} {...item} />
                    ))}
                  </nav>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-[350px]">
              <nav className="overflow-hidden border border-gray-200">
                {menuItems.map((section) => (
                  <div className="border-b border-gray-200" key={section.title}>
                    <button
                      className="flex w-full items-center justify-between bg-blue-50 px-4 py-3 text-2xl font-normal text-gray-600 hover:bg-blue-100"
                    >
                      {section.title}
                    </button>
                    <div className="bg-blue-50/50 ">
                      {section.items.map((item) => (
                        <MenuItem key={item.title} {...item} />
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            {location.pathname === '/vision-mission' ? (
              <MissionVision />
            ) : (
              <AboutDescription />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
