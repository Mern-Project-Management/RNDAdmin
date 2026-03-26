import { useState } from "react";
import { Link } from "react-router-dom";
import { NavLink } from "./NavLink";
import { useGetAllCompanyItemsQuery } from "@/slice/companyItemSlice";

const NavSection = ({ 
    categories, 
    parsedBlogCategories, 
    isHomeActive, 
    isProductsActive, 
    isBlogActive, 
    isContactActive,
    mobileMenuOpen, 
    setMobileMenuOpen 
}) => {
    const [corporateDropdownOpen, setCorporateDropdownOpen] = useState(false);
    const [blogDropdownOpen, setBlogDropdownOpen] = useState(false);
    const [hoveredCompanyItem, setHoveredCompanyItem] = useState(null);

    const { data: companyItems = [] } = useGetAllCompanyItemsQuery();

    const isCompanyActive = companyItems.some(item => window.location.pathname === item.link);

    return (
        <nav className="bg-[#ffcc00] text-[#1a1a1a]">
            <div className="max-w-[75rem] mx-auto px-4 flex items-center justify-evenly">
                <div className="space-x-2 lg:space-x-3 hidden md:flex text-sm items-center lg:text-[16px] font-bold">
                    {/* Company Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => {
                            setCorporateDropdownOpen(true);
                            if (companyItems.length > 0 && !hoveredCompanyItem) {
                                setHoveredCompanyItem(companyItems[0]);
                            }
                        }}
                        onMouseLeave={() => setCorporateDropdownOpen(false)}
                    >
                        <div
                            className={`block py-2 px-4 hover:text-orange-400 transition-colors cursor-pointer ${isCompanyActive ? "text-orange-400" : ""}`}
                        >
                            Company
                        </div>
                        <div
                            className={`
                                absolute left-0 w-[500px] bg-white text-gray-800 shadow-xl z-50 font-normal
                                transition-all duration-300 ease-in-out flex rounded-b-lg overflow-hidden
                                ${corporateDropdownOpen 
                                    ? 'opacity-100 translate-y-0 visible' 
                                    : 'opacity-0 -translate-y-2 invisible pointer-events-none'}
                            `}
                        >
                            {/* Left List */}
                            <div className="w-2/5 border-r border-gray-100 py-2">
                                {companyItems.map((item) => (
                                    <Link
                                        key={item._id}
                                        to={item.link}
                                        onMouseEnter={() => setHoveredCompanyItem(item)}
                                        className={`flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors ${hoveredCompanyItem?._id === item._id ? 'bg-gray-50 border-l-4 border-orange-400' : 'border-l-4 border-transparent'}`}
                                    >
                                        <span className="font-medium text-gray-700">{item.name}</span>
                                    </Link>
                                ))}
                                {companyItems.length === 0 && (
                                    <p className="px-6 py-4 text-sm text-gray-400">No items available</p>
                                )}
                            </div>

                            {/* Right Image Preview */}
                            <div className="w-3/5 bg-gray-50 p-6 flex items-center justify-center">
                                {hoveredCompanyItem?.image ? (
                                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-md">
                                        <img
                                            src={`/api/image/download/${hoveredCompanyItem.image}`}
                                            alt={hoveredCompanyItem.name}
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                            <p className="text-white font-bold">{hoveredCompanyItem.name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-300 flex flex-col items-center">
                                        <span className="text-4xl mb-2">ðŸ¢</span>
                                        <p className="text-sm italic">Preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products Dropdown */}
                    <NavLink
                        href="/categories"
                        hasDropdown={true}
                        categories={categories}
                        state={{ categoryName: "Products" }}
                        className={() => `font-bold ${isProductsActive ? "text-orange-400" : ""}`}
                    >
                        Products
                    </NavLink>

                    {/* Static Links */}
                    <NavLink 
                        href="/worldwide"
                        className={({ isActive }) => isActive ? "text-orange-400" : ""}
                    >
                        Worldwide
                    </NavLink>
                    <NavLink 
                        href="/careers"
                        className={({ isActive }) => isActive ? "text-orange-400" : ""}
                    >
                        Careers
                    </NavLink>

                    {/* Blog Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setBlogDropdownOpen(true)}
                        onMouseLeave={() => setBlogDropdownOpen(false)}
                    >
                        <NavLink 
                            href="/blogs"
                            className={() => `block py-2 px-4 hover:text-orange-400 transition-colors ${isBlogActive ? "text-orange-400" : ""}`}
                        >
                            Blogs
                        </NavLink>
                        <div
                            className={`
                                absolute left-0 w-64 bg-blue-800 text-white shadow-lg z-50 font-normal
                                transition-all duration-200 ease-in-out
                                ${blogDropdownOpen 
                                    ? 'opacity-100 translate-y-0' 
                                    : 'opacity-0 -translate-y-2 pointer-events-none'}
                            `}
                        >
                            {parsedBlogCategories.length > 0 ? (
                                parsedBlogCategories.map((category) => (
                                    <Link
                                        key={category.id}
                                        to={`/blog/${category.slug}`}
                                        className="block px-4 py-2 hover:bg-blue-600 transition-colors"
                                    >
                                        {category.name}
                                    </Link>
                                ))
                            ) : (
                                <p className="px-4 py-2">No blog categories available</p>
                            )}
                        </div>
                    </div>

                    {/* Contact Us Link */}
                    <NavLink 
                        href="/contact-us"
                        className={() => isContactActive ? "text-orange-400" : ""}
                    >
                        Contact Us
                    </NavLink>

                    {/* Advanced Search Button */}
                    {!mobileMenuOpen && (
                        <div className="hidden md:flex justify-center items-center">
                            <Link 
                                to="/advance-search"
                                className="text-white bg-orange-500 rounded-none px-4 lg:px-7 py-6 lg:py-8 hover:bg-orange-500 hover:text-white text-sm lg:text-[16px] font-bold"
                            >
                                Advanced Search
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavSection;



