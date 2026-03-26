'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useGetBannerByPageSlugQuery } from '@/slice/banner/banner';
import { Link, useParams } from 'react-router-dom';
import m1 from '../../images/slide1.webp';
import m2 from '../../images/slide1.webp';

// Skeleton loader
const SkeletonLoader = () => (
  <div className="w-full h-[600px] bg-gray-200 animate-pulse rounded">
    <div className="absolute w-full top-1/2 -translate-y-1/2 px-4 sm:px-[15%]">
      <div className="w-32 h-10 bg-gray-300 animate-pulse rounded" />
    </div>
  </div>
);

const staticImages = [
  { _id: 'static-1', image: m1, title: 'Image 1', altName: 'Static Image 1' },
  { _id: 'static-2', image: m2, title: 'Image 2', altName: 'Static Image 2' },
];

const Slideshow = () => {
  const { pageSlug } = useParams();
  const slug = pageSlug || '/';
  const { data: banners, isLoading } = useGetBannerByPageSlugQuery(slug);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSmallDevice, setIsSmallDevice] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
  const slideshowRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsSmallDevice(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % (isSmallDevice ? 2 : banners?.length || 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [isSmallDevice, banners]);

  if (isLoading && !isSmallDevice) return <SkeletonLoader />;
  if (!isSmallDevice && banners?.length === 0) return <div>No banners available</div>;

  const imageSource = isSmallDevice ? staticImages : banners || [];

  return (
    <div className="relative" ref={slideshowRef}>
      <div className="relative w-full h-[300px] md:h-[600px]">
        {imageSource.map((item, index) => {
          const isVisible = index === currentImageIndex;
          if (!isVisible && index > 0) return null;

          return (
            <div
              key={item._id}
              className={`absolute inset-0 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={isSmallDevice ? item.image : `/api/image/download/${item.image}`}
                alt={item.altName || `Slide ${index + 1}`}
                className="w-full h-full object-cover"
                fetchPriority={index === 0 ? 'high' : 'low'}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          );
        })}
      </div>

      <div className="absolute w-full top-[90%] -translate-y-1/2 px-4 sm:px-[15%]">
        <Link to="/introduction">
          <Button className="bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm md:text-base font-medium sm:font-bold px-3 py-1 sm:px-4 sm:py-2 md:px-5 md:py-2 sm:flex items-center sm:mb-16 hidden gap-1 sm:gap-2">
            <span>Read More</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </Button>
        </Link>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {imageSource.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
              index === currentImageIndex ? 'bg-orange-500' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
