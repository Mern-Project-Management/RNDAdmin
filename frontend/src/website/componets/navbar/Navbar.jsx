import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Search, UserCircle, LogIn, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavLink } from "./NavLink";
import { useGetAllCategoriesQuery } from "@/slice/blog/blogCategory";
import SearchBar from "./SearchBar";
import Footer from "../home/Footer";
import { useGetLogoQuery } from "@/slice/logo/LogoSlice";
import NavSection from "./NavSection";

export default function NavbarComp({ categories, serviceCategories }) {
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [blogDropdownOpen, setBlogDropdownOpen] = useState(false);
  const [corporateDropdownOpen, setCorporateDropdownOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

  const { data: blogCategories = [], isLoading } = useGetAllCategoriesQuery();

  const parsedBlogCategories = blogCategories.map((blog) => ({
    id: blog._id,
    name: blog.category,
    slug: blog.slug,
  }));

  const { pathname } = useLocation();
  const isHomeActive = pathname === "/" || pathname === "/home";
  const isProductsActive = pathname.startsWith("/categories");
  const isBlogActive = pathname.startsWith("/blogs");
  const isContactActive = pathname.startsWith("/contact-us");

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      setIsSticky(scrollPercent >= 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: logoData } = useGetLogoQuery();
  console.log("Logo Data in Navbar:", logoData);

  return (
    <>
      <header
        className={`w-full relative z-[70] ${
          isSticky ? "sticky top-0 bg-white shadow-md" : ""
        }`}
      >
        <div className="max-w-[75rem] mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <picture>
              {/* WebP source for modern browsers */}
              {logoData?.headerLogo && (
                <source
                  srcSet={`/api/logo/download/${logoData.headerLogo}`}
                  type="image/webp"
                />
              )}

              {/* Fallback image */}
              <img
                src={
                  logoData?.headerLogo
                    ? `/api/logo/download/${logoData.headerLogo}`
                    : ""
                }
                alt="Company Logo"
                title={logoData?.headerLogoName}
                className="max-w-[120px] max-h-[50px] min-w-[80px] min-h-[46px]"
                height="50" // Explicit height
                width="120" // Explicit width
              />
            </picture>
          </Link>
          <div className="w-1/2 md:mt-0 hidden md:block">
            <SearchBar />
          </div>
          <div className="flex items-center md:hidden">
            <div className="w-full">
              <SearchBar />
            </div>
            <Button
              variant="ghost"
              className="text-[#7a6b00] hover:text-orange-400 hover:bg-transparent p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        <NavSection
          categories={categories}
          serviceCategories={serviceCategories}
          parsedBlogCategories={parsedBlogCategories}
          isHomeActive={isHomeActive}
          isProductsActive={isProductsActive}
          isBlogActive={isBlogActive}
          isContactActive={isContactActive}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Mobile Menu with CSS Animation */}
        <div
          className={`
                    md:hidden fixed top-0 left-0 right-0 w-full z-[80]
                    transition-all duration-300 ease-in-out
                    ${
                      mobileMenuOpen
                        ? "opacity-100 h-screen"
                        : "opacity-0 h-0 pointer-events-none overflow-hidden"
                    }
                `}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[75]"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="relative bg-[#ffcc00] w-full px-4 py-2 space-y-2 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 bg-white -mx-4 px-4 pt-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <picture>
                  {/* WebP source for modern browsers */}
                  {logoData?.headerLogo && (
                    <source
                      srcSet={`/api/logo/download/${logoData.headerLogo}`}
                      type="image/webp"
                    />
                  )}

                  {/* Fallback image */}
                  <img
                    src={
                      logoData?.headerLogo
                        ? `/api/logo/download/${logoData.headerLogo}`
                        : ""
                    }
                    alt="Company Logo"
                    className=" max-h-[50px] min-h-[40px] max-w-[150px] min-w-[100px]"
                    height="50" // Explicit height
                    width="150" // Explicit width
                  />
                </picture>
              </Link>
              <Button
                variant="ghost"
                className="text-[#7a6b00] hover:text-orange-400 hover:bg-transparent p-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            {/* Mobile Menu Links */}
            <div className="flex flex-col space-y-2 py-4 max-h-[70vh] overflow-y-auto">
              {[
                { label: "Home", path: "/", active: isHomeActive },
                { label: "Products", path: "/categories", active: isProductsActive },
                { label: "Services", path: "/services", active: pathname.startsWith("/services") },
                { label: "Worldwide", path: "/worldwide", active: pathname === "/worldwide" },
                { label: "Careers", path: "/careers", active: pathname === "/careers" },
                { label: "Blogs", path: "/blogs", active: isBlogActive },
                { label: "Contact Us", path: "/contact-us", active: isContactActive },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg font-bold px-4 py-3 rounded-lg transition-colors ${
                    link.active ? "bg-white text-[#7a6b00] shadow-sm" : "text-[#7a6b00] hover:bg-white/20"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/advance-search"
                onClick={() => setMobileMenuOpen(false)}
                className="mx-2 text-center mt-6 bg-orange-500 text-white py-4 rounded-xl font-bold shadow-lg"
              >
                Advanced Search
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full mb-10 mx-auto">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}




