import React from 'react';
import { useGetAboutUsQuery } from '@/slice/aboutUs/aboutUs';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  const { data: aboutData, isLoading } = useGetAboutUsQuery();

  if (isLoading) return <div>Loading...</div>;

  const profileData = aboutData?.[0];
  if (!profileData) return null;

  return (
    <section className="bg-white">
      <div className="max-w-[75rem] mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-1">{profileData.title}</h1>
        <div className="w-16 h-1 bg-orange-500 mb-6"></div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side - Image */}
          <div className="md:[15%]">
            <img
              src={`/api/image/download/${profileData.image}`}
              alt={profileData.altName}
              title={profileData.title}
              className="w-full object-cover shadow-md max-h-[500px] min-h-[200px] max-w-full min-w-[300px]"
              height="500" // Explicit height
              width="300"  // Explicit width
            />
          </div>

          {/* Right side - Content */}
          <div className="md:w-[85%] flex flex-col justify-center">
            <div
              className="text-gray-600 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: profileData.shortDescription }}
            />
            <Link to="/introduction">
              <span className="text-blue-700/80 text-sm"> More...</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
