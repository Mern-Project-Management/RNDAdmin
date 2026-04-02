import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategorySlider = ({ images, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [images.length]);

    if (!images || images.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 p-20 text-center italic">
                No images uploaded for this section yet.
            </div>
        );
    }

    return (
        <div className="relative w-full h-full group overflow-hidden">
            {images.map((img, index) => (
                <div
                    key={img._id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                        index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
                    }`}
                >
                    <img
                        src={`/api/image/download/${img.image}`}
                        alt={img.title || title}
                        className="w-full h-full object-cover"
                    />
                    {img.title && index === currentIndex && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 pt-20">
                            <p className="text-white text-xl font-medium transform translate-y-0 transition-transform duration-500">
                                {img.title}
                            </p>
                        </div>
                    )}
                </div>
            ))}

            {images.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const LifeAtRndGallery = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Optimized single call to get everything nested
                const response = await axios.get('/api/lifeAtRndCategory/website/getData');
                setCategories(response.data || []);
            } catch (error) {
                console.error("Error fetching Life At RND data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading Our Culture...</p>
            </div>
        );
    }

    return (
        <section className="w-full bg-[#fbfbfb] py-20 lg:py-32 overflow-hidden">
            <div className="max-w-[85rem] mx-auto px-6">
                {categories.length === 0 ? (
                    <div className="text-center text-gray-400 py-20 italic bg-white rounded-3xl border border-dashed border-gray-200">
                        No sections published yet. Add them from the admin dashboard!
                    </div>
                ) : (
                    categories.map((category, index) => (
                        <div 
                            key={category._id} 
                            className={`mb-32 last:mb-0 flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 lg:gap-24 items-center`}
                        >
                            {/* Content Side */}
                            <div className="w-full lg:w-5/12 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-[2px] bg-orange-500"></div>
                                        <span className="text-orange-600 font-bold tracking-[0.2em] uppercase text-xs">
                                            {category.subtitle}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl lg:text-6xl font-extrabold text-[#111] leading-[1.1] font-serif tracking-tight">
                                        {category.title}
                                    </h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed text-xl font-light">
                                    {category.description}
                                </p>
                                <div className={`pt-4 flex ${index % 2 === 0 ? 'justify-start' : 'justify-start lg:justify-end'}`}>
                                     <div className="h-1 shadow-sm w-20 bg-orange-500/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 w-1/3 animate-ping"></div>
                                     </div>
                                </div>
                            </div>

                            {/* Slider Side */}
                            <div className="w-full lg:w-7/12 relative group">
                                <div className="absolute -inset-4 bg-orange-500/5 rounded-[2.5rem] blur-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-700"></div>
                                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white border border-white/20">
                                    <CategorySlider images={category.gallery_images || []} title={category.title} />
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </section>
    );
};

export default LifeAtRndGallery;
