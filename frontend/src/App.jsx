import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import Layout from './layout/Layout';
import './App.css';

// Loading component for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400 border-solid"></div>
  </div>
);

import { useClickTracking } from './hooks/useTracking';


// Website Components - Lazy loaded
const Navbar = lazy(() => import('./website/Navbar'));
const HomePage = lazy(() => import('./website/pages/HomePage'));
const ProductCategoryPage = lazy(() => import('./website/pages/ProductCategoryPage'));
const SubCategories = lazy(() => import('./website/componets/SubCategoryPage/SubCategories'));
const AlphabetsBaseCategory = lazy(() => import('./website/componets/alphabetbaseCategory/AlphabetsBaseCategory'));
const ProductDetailPage = lazy(() => import('./website/componets/productDetailPage/ProductDetailPage'));
const ContactPage = lazy(() => import('./website/pages/ContactPage'));
const BlogPage = lazy(() => import('./website/pages/BlogPage'));
const BlogDetailPage = lazy(() => import('./website/pages/BlogDetailPage'));
const ChemicalSubcategoryPage = lazy(() => import('./website/pages/category_subcategoryPage'));

// Dashboard Components - Lazy loaded
const DashboardPage = lazy(() => import('./dashboard/DashboardPage'));
const AdminLogin = lazy(() => import('./login/LoginPage'));

// Chemical Management - Lazy loaded
const ChemicalTable = lazy(() => import('./chemical/ChemicalTablePage'));
const ChemicalFormPage = lazy(() => import('./chemical/chemicalForm/ChemcialFormPage'));
const ChemicalTypes = lazy(() => import('./chemical/ChemicalTypesTable'));
const SearchSuppliers = lazy(() => import('./chemical/SearchSuppliers'));
const UnitsPage = lazy(() => import('./chemical/UnitTable'));
const CategoriesPage = lazy(() => import('./chemical/ChemicalCategoryPage'));
const CategoryForm = lazy(() => import('./chemical/chemicalCategory/CategoryForm'));
const UpdateCategoryForm = lazy(() => import('./chemical/chemicalCategory/EditCategoryForm'));
import { ChemicalProvider } from './chemical/ChemicalContext';

// Supplier Management - Lazy loaded
const SuppliersTable = lazy(() => import('./supplier/SupplierTablePage'));
const SupplierForm = lazy(() => import('./supplier/SupplierForm'));
const ChemicalMapping = lazy(() => import('./supplier/ChemicalMapping'));
const ChemicalSearch = lazy(() => import('./supplier/SearchChamicals'));

// Customer Management - Lazy loaded
const CustomerTable = lazy(() => import('./customer/CustomerTable'));
const CustomerForm = lazy(() => import('./customer/CustomerForm'));
const CustomerChemicalMapping = lazy(() => import('./customer/ChemicalMapping'));

// Email Management - Lazy loaded
const SMTPTable = lazy(() => import('./email/smtp_setting/smtpTable'));
const EditSMTP = lazy(() => import('./email/smtp_setting/editForm'));
const CreateSMTP = lazy(() => import('./email/smtp_setting/CreateSMTP'));
const TemplateTable = lazy(() => import('./email/template/TemplateTable'));
const AddTemplateForm = lazy(() => import('./email/template/AddTemplate'));
const EditTemplateForm = lazy(() => import('./email/template/EditTemplate'));

// Inquiry Management - Lazy loaded
const InquiryList = lazy(() => import('./inquiry/InquiryTable'));
const AddInquiryForm = lazy(() => import('./inquiry/AddInquiry'));
const EditInquiryForm = lazy(() => import('./inquiry/EditInquiry'));
const SourceTable = lazy(() => import('./inquiry/source/SourceTable'));
const StatusTable = lazy(() => import('./inquiry/status/StatusTable'));

// Blog Management - Lazy loaded
const BlogCategory = lazy(() => import('./BlogCategory/BlogCategoryTable'));
const Blogcategoryform = lazy(() => import('./BlogCategory/BlogCategoryForm'));
const BlogTable = lazy(() => import('./blog/BlogPage'));
const BlogForm = lazy(() => import('./blog/BlogForm'));
const BlogFaq = lazy(() => import('./blog/BlogFaq'));
const NavbarComp = lazy(() => import('./website/componets/navbar/Navbar'));
const AlphabetBasedProduct = lazy(() => import('./website/pages/AlphabetBasedProduct'));
const Hello = lazy(() => import('./Hello'));
const Saperator = lazy(() => import('./website/Saparator'));
const BlogSaparator = lazy(() => import('./website/pages/BlogSaparator'));
const EmailForm = lazy(() => import('./email/emailForm/EmailForm'));
const EditCustomerForm = lazy(() => import('./customer/EditCustomerForm'));
const EditSupplierForm = lazy(() => import('./supplier/EditSupplierForm'));
const ProductSearchBar = lazy(() => import('./website/componets/productSearch/ProductSearchBar'));
const ProductInquiryTable = lazy(() => import('./websiteBackend/productInquiry/ProductInquiry'));
const AboutUsTable = lazy(() => import('./websiteBackend/aboutus/AboutUsTable'));
const AboutUsForm = lazy(() => import('./websiteBackend/aboutus/AboutUsForm'));
const BannerTable = lazy(() => import('./websiteBackend/banner/BannerTable'));
const AddBannerForm = lazy(() => import('./websiteBackend/banner/AddBannerForm'));
const EditBannerForm = lazy(() => import('./websiteBackend/banner/EditBannerForm'));
const VideoTable = lazy(() => import('./components/ui/VideoTable'));
const VideoForm = lazy(() => import('./components/ui/VideoForm'));
const FooterTable = lazy(() => import('./websiteBackend/footer/FooterTable'));
const FooterForm = lazy(() => import('./websiteBackend/footer/FooterForm'));
const SocialMediaTable = lazy(() => import('./components/SocialMedia/SocialMediaTable'));
const SocialMediaForm = lazy(() => import('./components/SocialMedia/SocialMediaForm'));
const AboutDescription = lazy(() => import('./website/componets/home/AboutUs'));
const Introduction = lazy(() => import('./website/pages/Introduction'));
const MainContent = lazy(() => import('./website/componets/Introduction/MainContent'));
const WorldWide = lazy(() => import('./website/pages/WorldWide'));
const CareerForm = lazy(() => import('./website/pages/Career'));
const WorldWideBackend = lazy(() => import('./websiteBackend/worldwideTables/WorlWide'));
const WorldwideForm = lazy(() => import('./websiteBackend/worldwideTables/WorldWideForm.jsx'));
const CareerTable = lazy(() => import('./websiteBackend/career/CareerTable'));
const CareerAdminForm = lazy(() => import('./websiteBackend/career/CareerForm'));
const EmailCategoryParent = lazy(() => import('./email/emailCategory/EmailCategoryParent'));
const AdvanceSearch = lazy(() => import('./website/pages/AdvanceSearchPage'));
const Logo = lazy(() => import('./websiteBackend/companyLogo/CompanyLogoTable'));
const LogoForm = lazy(() => import('./websiteBackend/companyLogo/LogoForm'));
const ContactInfoForm = lazy(() => import('./websiteBackend/contactInfo/ContactInfoData'));
const ContactForm = lazy(() => import('./websiteBackend/contactInfo/contactInfoForm'));
const MenuListingForm = lazy(() => import('./websiteBackend/MenuListing/MenuListingForm'));
const MenuListingTable = lazy(() => import('./websiteBackend/MenuListing/MenuListingTable'));
const StaticMetaForm = lazy(() => import('./websiteBackend/staticMetaKeyword/StaticMetaForm'));
const MetaList = lazy(() => import('./websiteBackend/staticMetaKeyword/StaticTable'));
const ImageUploadForm = lazy(() => import('./website/componets/slideshow/SlideShowForm'));
const SlideShowTable = lazy(() => import('./website/componets/slideshow/SlideShowTable'));
const PrivacyPolicy = lazy(() => import('./website/pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./website/pages/TermsandCondition'));
const WhatsUpInfoTable = lazy(() => import('./websiteBackend/whatsUpInfo/WhatsUpTable'));
const WhatsUpInfoForm = lazy(() => import('./websiteBackend/whatsUpInfo/WhatUpForm'));
const EventForm = lazy(() => import('./websiteBackend/event/Events'));
const CatalogueTable = lazy(() => import('./websiteBackend/catalogue/CatalogueTable'));
const CatalogueForm = lazy(() => import('./websiteBackend/catalogue/CatalogueForm'));
const PrivacyForm = lazy(() => import('./websiteBackend/privacy/PrivacyAndTerms'));
const TermsConditionForm = lazy(() => import('./websiteBackend/privacy/TermsCondtion'));
const CareerInfoForm = lazy(() => import('./websiteBackend/career/CareerInfoForm'));
const PolicyTable = lazy(() => import('./websiteBackend/policy/PolicyTable'));
const PolicyForm = lazy(() => import('./websiteBackend/policy/PolicyForm'));
const CompanyItemTable = lazy(() => import('./websiteBackend/company/CompanyItemTable'));
const CompanyItemForm = lazy(() => import('./websiteBackend/company/CompanyItemForm'));

// Life at RND Management
const LifeAtRndCategoryTable = lazy(() => import('./websiteBackend/lifeAtRnd/CategoryTable'));
const LifeAtRndCategoryForm = lazy(() => import('./websiteBackend/lifeAtRnd/CategoryForm'));
const LifeAtRndGalleryTable = lazy(() => import('./websiteBackend/lifeAtRnd/GalleryTable'));
const LifeAtRndGalleryForm = lazy(() => import('./websiteBackend/lifeAtRnd/GalleryForm'));

// Non-lazy imports
import useDocumentTitle from './websiteBackend/staticMetaKeyword/DynamicMeta';
import CriticalStyles from './website/componets/CriticalStyles';
import ImportExcel from './chemical/ImportExcel';
import TrackingInfo from './clickTrack/TrackingInfo';
import CookiesForm from './websiteBackend/privacy/Cookies';
import MainFaqSection from './websiteBackend/faq/MainFaqSection';
import ServiceFaqSection from './websiteBackend/faq/ServiceFaqSection';
import AboutFaqSection from './websiteBackend/faq/AboutFaqSection';
import FAQForm from './websiteBackend/faq/CreateFAQ';
import EditFAQ from './websiteBackend/faq/EditFAQ';
import CategoryTable from './websiteBackend/Service/ServiceCategory';
import ServiceCategoryForm from './websiteBackend/Service/ServiceCategoryForm';
import EditServiceCategory from './websiteBackend/Service/EditServiceCategory';
import PorfolioCategoryTable from './websiteBackend/portfolio/portfolioCategory';
import PortfolioCategoryForm from './websiteBackend/portfolio/CreatePortfolioCategory';
import PortfolioTable from './websiteBackend/portfolio/Portfolio';
import PortfolioForm from './websiteBackend/portfolio/CreatePortfolio';
import EditPortfolio from './websiteBackend/portfolio/EditPortFolio';
import StaffTable from './websiteBackend/ourStaff/Staff';
import StaffForm from './websiteBackend/ourStaff/CreateStaff';
import EditStaff from './websiteBackend/ourStaff/EditStaff';
import CoreValueTable from './websiteBackend/coreValue/CoreValueTable';
import AddCoreValue from './websiteBackend/coreValue/AddCoreValue';
import EditCoreValue from './websiteBackend/coreValue/EditCoreValue';
import ClientsTable from './websiteBackend/clients/ClientsTable';
import AddClientForm from './websiteBackend/clients/AddClientsForm';
import EditClientForm from './websiteBackend/clients/EditClientsForm';
import ServiceSec1Form from './websiteBackend/Service/serviceSec1/ServiceSec1Form';
import ServiceSec1Table from './websiteBackend/Service/serviceSec1/ServiceSec1Table';
import ServiceSec2Form from './websiteBackend/Service/serviceSec2/ServiceSec2Form';
import ServiceSec2Table from './websiteBackend/Service/serviceSec2/ServiceSec2Table';
import ServiceSec3Table from './websiteBackend/Service/serviceSec3/ServiceSec3Table';
import OurServiceBanner from './websiteBackend/Service/OurServiceBanner';
import ServiceSec3Form from './websiteBackend/Service/serviceSec3/ServiceSec3Form';
import CreateTestimonials from './websiteBackend/testimonial/CreateTestimonials';
import TestimonialsTable from './websiteBackend/testimonial/TestimonialTable';
import EditTestimonial from './websiteBackend/testimonial/EditTestimonial';
import WhyChooseUsCRUD from './websiteBackend/whychooseus/WhyChooseUsCRUD';
import EditPortfolioCategory from './websiteBackend/portfolio/EditPortfolioCategory';
import CareerOptionForm from './websiteBackend/careerOption/CareerOptionForm';
import CareerOptionTable from './websiteBackend/careerOption/CareerOptionTable';
import EditCareerOptionForm from './websiteBackend/careerOption/EditCareerOptionForm';
import CounterTable from './websiteBackend/counter/counterTable';
import AddCounter from './websiteBackend/counter/AddCounter';
import EditCounter from './websiteBackend/counter/EditCounter';
import TextSliderCRUD from "./websiteBackend/textSlider/TextSliderCRUD";
const AlertBarManagement = lazy(() => import('./websiteBackend/AlertBar/AlertBarManagement'));

// Auth Components
const PrivateRoute = ({ children }) => {
  const token = Cookies.get('jwt');
  return token ? children : <Navigate to="/login" replace />;
};

const LoginRoute = () => {
  const token = Cookies.get('jwt');
  return token ? <Navigate to="/dashboard" /> : <AdminLogin />;
};

// Dynamic meta function
const AppContent = () => {
  useDocumentTitle(); // Use the hook here
  const { trackEvent } = useClickTracking(); // Initialize page tracking
  const location = useLocation();

  // Helper to check if current path is an admin/dashboard route
  const isAdminPath = (pathname) => {
    const adminFragments = [
      '/login', '/dashboard', '/chemical', '/service', '/portfolio', '/smtp',
      '/email', '/inquiry', '/source', '/status', '/faq', '/blog',
      '/product-inquiry', '/about-us', '/banner', '/video', '/footer',
      '/social-media', '/worldwide', '/career', '/logo', '/contact-info',
      '/menu-listing', '/meta', '/slideShow', '/whatsUpInfo', '/events',
      '/catalogue', '/privacy', '/terms', '/import-excel', '/tracking',
      '/clients', '/core-value', '/whyChooseUs', '/JobApplication',
      '/policy', '/counter', '/text-slider', '/alert-bar', '/staff', '/list', '/table',
      '/form', '/add-', '/edit-', '/admin', '/logo-table', '/worldwide-table'
    ];
    
    return adminFragments.some(fragment =>
      pathname.toLowerCase().startsWith(fragment.toLowerCase()) ||
      pathname.toLowerCase().includes(fragment.toLowerCase())
    );
  };

  React.useEffect(() => {
    // We only want to track public website views (un-authenticated users on non-admin paths)
    if (!location.pathname.startsWith('/api') && !isAdminPath(location.pathname)) {
      const currentSlug = location.pathname === '/' ? 'Home' : location.pathname.split('/').filter(Boolean).pop() || 'Home';
      trackEvent('page_view', { 
        page: location.pathname,
        buttonName: `[${currentSlug}] Page View`
      });
    }
  }, [location.pathname, trackEvent]);

  React.useEffect(() => {
    const handleGlobalClick = (e) => {
      // Don't track clicks if we're on an admin path or user is logged in
      if (isAdminPath(location.pathname)) return;

      // Find the closest clickable element (button, link, etc)
      const clickableElement = e.target.closest('button, a, [role="button"], input[type="submit"]');

      if (clickableElement) {
        let buttonName = clickableElement.innerText || clickableElement.getAttribute('aria-label') || clickableElement.getAttribute('title') || clickableElement.value;

        // If it's a link with no text, use the href
        if (!buttonName && clickableElement.tagName === 'A') {
          buttonName = clickableElement.getAttribute('href');
        }

        // Clean up the text
        if (typeof buttonName === 'string') {
          buttonName = buttonName.trim().replace(/\n/g, ' ').substring(0, 60); // limit length
        } else {
          buttonName = 'Interactive Element';
        }

        // Only track if it has some identifying info
        if (buttonName) {
          // Get a clean slug for the current page
          const currentSlug = location.pathname === '/' ? 'Home' : location.pathname.split('/').filter(Boolean).pop() || 'Home';

          trackEvent('click', {
            buttonName: `[${currentSlug}] ${buttonName}`,
            page: location.pathname,
            metadata: {
              pageSlug: currentSlug,
              elementTag: clickableElement.tagName,
              elementId: clickableElement.id || null
            }
          });
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [location.pathname, trackEvent]);

  <CriticalStyles />
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Outlet /> {/* Render the rest of the app */}
    </Suspense>
  );
};

// Main App Component
function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <AppContent />, // Use the AppContent here
      children: [

        {
          path: 'login',
          element: <Suspense fallback={<LoadingFallback />}><LoginRoute /></Suspense>
        },
        // Protected Routes (Dashboard)
        {
          path: '',
          element: (
            <PrivateRoute>
              <Suspense fallback={<LoadingFallback />}>
                <Layout />
              </Suspense>
            </PrivateRoute>
          ),
          children: [
            { path: 'dashboard', element: <Suspense fallback={<LoadingFallback />}><DashboardPage /></Suspense> },
            // Chemical Management Routes
            {
              path: 'chemical-table',
              element: (
                <ChemicalProvider>
                  <Suspense fallback={<LoadingFallback />}><ChemicalTable /></Suspense>
                </ChemicalProvider>
              )
            },

            //Our Staff Management Routes
            { path: 'our-staff-table', element: <Suspense fallback={<LoadingFallback />}><StaffTable /></Suspense> },
            { path: 'our-staff-form', element: <Suspense fallback={<LoadingFallback />}><StaffForm /></Suspense> },
            { path: 'edit-our-staff-form/:id', element: <Suspense fallback={<LoadingFallback />}><EditStaff /></Suspense> },

            // Clients Management Routes
            { path: 'clients-table', element: <Suspense fallback={<LoadingFallback />}><ClientsTable /></Suspense> },
            { path: 'add-client', element: <Suspense fallback={<LoadingFallback />}><AddClientForm /></Suspense> },
            { path: 'edit-client/:id', element: <Suspense fallback={<LoadingFallback />}><EditClientForm /></Suspense> },

            // Core Value Management Routes
            { path: 'core-value-table', element: <Suspense fallback={<LoadingFallback />}><CoreValueTable /></Suspense> },
            { path: 'add-core-value', element: <Suspense fallback={<LoadingFallback />}><AddCoreValue /></Suspense> },
            { path: 'edit-core-value/:id', element: <Suspense fallback={<LoadingFallback />}><EditCoreValue /></Suspense> },


            //Service Management Routes
            { path: 'service-category', element: <Suspense fallback={<LoadingFallback />}><CategoryTable /></Suspense> },
            { path: 'service-category-form', element: <Suspense fallback={<LoadingFallback />}><ServiceCategoryForm /></Suspense> },
            { path: 'edit-service-category/:categoryId/:subCategoryId?/:subSubCategoryId?', element: <Suspense fallback={<LoadingFallback />}><EditServiceCategory /></Suspense> },

            // Email Management Routes
            { path: 'smtp-table', element: <Suspense fallback={<LoadingFallback />}><SMTPTable /></Suspense> },
            { path: 'add-smtp', element: <Suspense fallback={<LoadingFallback />}><CreateSMTP /></Suspense> },
            { path: 'edit-smtp-form/:id', element: <Suspense fallback={<LoadingFallback />}><EditSMTP /></Suspense> },
            { path: 'email-template-table', element: <Suspense fallback={<LoadingFallback />}><TemplateTable /></Suspense> },
            { path: 'add-template', element: <Suspense fallback={<LoadingFallback />}><AddTemplateForm /></Suspense> },
            { path: 'edit-template/:id', element: <Suspense fallback={<LoadingFallback />}><EditTemplateForm /></Suspense> },
            { path: 'email-form', element: <Suspense fallback={<LoadingFallback />}><EmailForm /></Suspense> },
            { path: 'email-category', element: <Suspense fallback={<LoadingFallback />}><EmailCategoryParent /></Suspense> },
            { path: 'email-category-form', element: <Suspense fallback={<LoadingFallback />}><EmailCategoryParent /></Suspense> },
            { path: 'edit-email-category/:id', element: <Suspense fallback={<LoadingFallback />}><EmailCategoryParent /></Suspense> },

            // Inquiry Management Routes
            { path: 'inquiry-list', element: <Suspense fallback={<LoadingFallback />}><InquiryList /></Suspense> },
            { path: 'add-inquiry', element: <Suspense fallback={<LoadingFallback />}><AddInquiryForm /></Suspense> },
            { path: 'edit-inquiry/:id', element: <Suspense fallback={<LoadingFallback />}><EditInquiryForm /></Suspense> },
            { path: 'source-table', element: <Suspense fallback={<LoadingFallback />}><SourceTable /></Suspense> },
            { path: 'status-table', element: <Suspense fallback={<LoadingFallback />}><StatusTable /></Suspense> },

            //FAQ Management Routes
            { path: 'faq', element: <Suspense fallback={<LoadingFallback />}><MainFaqSection /></Suspense> },
            { path: 'our-service-faq', element: <Suspense fallback={<LoadingFallback />}><ServiceFaqSection /></Suspense> },
            { path: 'about-faq', element: <Suspense fallback={<LoadingFallback />}><AboutFaqSection /></Suspense> },
            { path: 'faq/createFAQ', element: <Suspense fallback={<LoadingFallback />}><FAQForm /></Suspense> },
            { path: 'faq/editFAQ/:id', element: <Suspense fallback={<LoadingFallback />}><EditFAQ /></Suspense> },

            // Portfolio Management Routes
            { path: 'portfolio-category', element: <Suspense fallback={<LoadingFallback />}><PorfolioCategoryTable /></Suspense> },
            {
              path: '/portfolio-category/:categoryId/:subCategoryId?/:subSubCategoryId?', element: <Suspense fallback={<LoadingFallback />}><EditPortfolioCategory /></Suspense>
            },
            { path: 'portfolio-category-form', element: <Suspense fallback={<LoadingFallback />}><PortfolioCategoryForm /></Suspense> },

            { path: 'portfolio', element: <Suspense fallback={<LoadingFallback />}><PortfolioTable /></Suspense> },
            { path: 'portfolio-form', element: <Suspense fallback={<LoadingFallback />}><PortfolioForm /></Suspense> },
            { path: 'edit-portfolio/:id', element: <Suspense fallback={<LoadingFallback />}><EditPortfolio /></Suspense> },

            // Blog Management Routes
            { path: 'blog-category-table', element: <Suspense fallback={<LoadingFallback />}><BlogCategory /></Suspense> },
            { path: 'blog-category-form', element: <Suspense fallback={<LoadingFallback />}><Blogcategoryform /></Suspense> },
            { path: 'edit-blog-category-form/:id', element: <Suspense fallback={<LoadingFallback />}><Blogcategoryform /></Suspense> },
            { path: 'blog-table', element: <Suspense fallback={<LoadingFallback />}><BlogTable /></Suspense> },
            { path: 'blog-form', element: <Suspense fallback={<LoadingFallback />}><BlogForm /></Suspense> },
            { path: 'edit-blog-form/:id', element: <Suspense fallback={<LoadingFallback />}><BlogForm /></Suspense> },
            { path: 'blog-faq/:id', element: <Suspense fallback={<LoadingFallback />}><BlogFaq /></Suspense> },

            // Product Inquiry Routes
            { path: 'product-inquiry-table', element: <Suspense fallback={<LoadingFallback />}><ProductInquiryTable /></Suspense> },

            // About Us Routes
            { path: 'about-us-table', element: <Suspense fallback={<LoadingFallback />}><AboutUsTable /></Suspense> },
            { path: 'about-us-form', element: <Suspense fallback={<LoadingFallback />}><AboutUsForm /></Suspense> },
            { path: 'edit-about-us-form/:id', element: <Suspense fallback={<LoadingFallback />}><AboutUsForm /></Suspense> },

            // Banner Routes
            { path: 'banner-table', element: <Suspense fallback={<LoadingFallback />}><BannerTable /></Suspense> },
            { path: 'add-banner', element: <Suspense fallback={<LoadingFallback />}><AddBannerForm /></Suspense> },
            { path: 'edit-banner-form/:id', element: <Suspense fallback={<LoadingFallback />}><EditBannerForm /></Suspense> },

            // Video Routes
            { path: 'video-table', element: <Suspense fallback={<LoadingFallback />}><VideoTable /></Suspense> },
            { path: 'video-form', element: <Suspense fallback={<LoadingFallback />}><VideoForm /></Suspense> },

            // Footer Routes
            { path: 'footer-table', element: <Suspense fallback={<LoadingFallback />}><FooterTable /></Suspense> },
            { path: 'footer-form', element: <Suspense fallback={<LoadingFallback />}><FooterForm /></Suspense> },
            { path: 'edit-footer/:id', element: <Suspense fallback={<LoadingFallback />}><FooterForm /></Suspense> },

            // Social Media Routes
            { path: 'social-media', element: <Suspense fallback={<LoadingFallback />}><SocialMediaTable /></Suspense> },
            { path: 'social-media/add', element: <Suspense fallback={<LoadingFallback />}><SocialMediaForm /></Suspense> },
            { path: 'social-media/edit/:id', element: <Suspense fallback={<LoadingFallback />}><SocialMediaForm /></Suspense> },

            { path: 'worldwide-table', element: <Suspense fallback={<LoadingFallback />}><WorldWideBackend /></Suspense> },
            { path: 'worldwide/add', element: <Suspense fallback={<LoadingFallback />}><WorldwideForm /></Suspense> },
            { path: 'worldwide/edit/:id', element: <Suspense fallback={<LoadingFallback />}><WorldwideForm /></Suspense> },

            // Career Management Routes
            { path: 'career-table', element: <Suspense fallback={<LoadingFallback />}><CareerTable /></Suspense> },
            { path: 'career/application/add', element: <Suspense fallback={<LoadingFallback />}><CareerAdminForm /></Suspense> },
            { path: 'career/edit/:id', element: <Suspense fallback={<LoadingFallback />}><CareerAdminForm /></Suspense> },
            { path: 'JobApplication', element: <Suspense fallback={<LoadingFallback />}><CareerOptionTable /></Suspense> },
            { path: 'career/add', element: <Suspense fallback={<LoadingFallback />}><CareerOptionForm /></Suspense> },
            { path: 'careeroption/editCareerOption/:id', element: <Suspense fallback={<LoadingFallback />}><EditCareerOptionForm /></Suspense> },
            { path: 'career-info-form', element: <Suspense fallback={<LoadingFallback />}><CareerInfoForm /></Suspense> },

            // Logo Management Routes
            { path: 'logo-table', element: <Suspense fallback={<LoadingFallback />}><Logo /></Suspense> },
            { path: 'add-logo', element: <Suspense fallback={<LoadingFallback />}><LogoForm /></Suspense> },
            { path: 'edit-logo/:id', element: <Suspense fallback={<LoadingFallback />}><LogoForm /></Suspense> },

            // Contact Info Management Routes
            { path: 'contact-info-table', element: <Suspense fallback={<LoadingFallback />}><ContactInfoForm /></Suspense> },
            // { path: 'contact-info/add', element: <Suspense fallback={<LoadingFallback />}><ContactForm /></Suspense> },
            // { path: 'contact-info/edit/:id', element: <Suspense fallback={<LoadingFallback />}><ContactForm /></Suspense> },

            // Menu Listing Routes
            { path: 'menu-listing-table', element: <Suspense fallback={<LoadingFallback />}><MenuListingTable /></Suspense> },
            { path: 'menu-listing-form', element: <Suspense fallback={<LoadingFallback />}><MenuListingForm /></Suspense> },
            { path: 'menu-listing-form/:id', element: <Suspense fallback={<LoadingFallback />}><MenuListingForm /></Suspense> },

            // Meta Routes
            { path: 'meta-table', element: <Suspense fallback={<LoadingFallback />}><MetaList /></Suspense> },
            { path: 'meta-form', element: <Suspense fallback={<LoadingFallback />}><StaticMetaForm /></Suspense> },
            { path: 'edit-meta-form/:id', element: <Suspense fallback={<LoadingFallback />}><StaticMetaForm /></Suspense> },

            // Slide show
            { path: 'slideShow-form', element: <Suspense fallback={<LoadingFallback />}><ImageUploadForm /></Suspense> },
            { path: 'slideShow-table', element: <Suspense fallback={<LoadingFallback />}><SlideShowTable /></Suspense> },

            // WhatsUp info
            { path: 'whatsUpInfo-table', element: <Suspense fallback={<LoadingFallback />}><WhatsUpInfoTable /></Suspense> },
            { path: 'whatsUpInfo-form', element: <Suspense fallback={<LoadingFallback />}><WhatsUpInfoForm /></Suspense> },

            // Events
            { path: 'events', element: <Suspense fallback={<LoadingFallback />}><EventForm /></Suspense> },

            // Catalogue Management Routes
            { path: 'catalogue-table', element: <Suspense fallback={<LoadingFallback />}><CatalogueTable /></Suspense> },
            { path: 'catalogue-form', element: <Suspense fallback={<LoadingFallback />}><CatalogueForm /></Suspense> },
            { path: 'edit-catalogue/:id', element: <Suspense fallback={<LoadingFallback />}><CatalogueForm /></Suspense> },

            // Privacy Policy Routes
            { path: 'privacypolicy-terms', element: <Suspense fallback={<LoadingFallback />}><PrivacyForm /></Suspense> },
            { path: 'terms-and-conditions-form', element: <Suspense fallback={<LoadingFallback />}><TermsConditionForm /></Suspense> },
            { path: 'import-excel', element: <Suspense fallback={<LoadingFallback />}><ImportExcel /></Suspense> },
            { path: 'tracking', element: <Suspense fallback={<LoadingFallback />}><TrackingInfo /></Suspense> },

            // Services Section 1 Management Routes
            { path: 'serviceSec1-table', element: <Suspense fallback={<LoadingFallback />}><ServiceSec1Table /></Suspense> },
            { path: 'serviceSec1-form', element: <Suspense fallback={<LoadingFallback />}><ServiceSec1Form /></Suspense> },
            { path: 'edit-serviceSec1/:id', element: <Suspense fallback={<LoadingFallback />}><ServiceSec1Form /></Suspense> },

            // Service Section 2 Management Routes
            { path: 'serviceSec2-table', element: <Suspense fallback={<LoadingFallback />}><ServiceSec2Table /></Suspense> },
            { path: 'service-sec2-form', element: <Suspense fallback={<LoadingFallback />}><ServiceSec2Form /></Suspense> },
            { path: 'service-sec2-form/:id', element: <Suspense fallback={<LoadingFallback />}><ServiceSec2Form /></Suspense> },

            // Service Section 3 Management Routes
            { path: 'serviceSec3-table', element: <Suspense fallback={<LoadingFallback />}><ServiceSec3Table /></Suspense> },
            { path: 'service-sec3-form', element: <Suspense fallback={<LoadingFallback />}><ServiceSec3Form /></Suspense> },
            { path: 'service-sec3-form/:id', element: <Suspense fallback={<LoadingFallback />}><ServiceSec3Form /></Suspense> },

            // Our Service Banner (Page Heading)
            { path: 'our-service-banner', element: <Suspense fallback={<LoadingFallback />}><OurServiceBanner /></Suspense> },

            // Why Choose Us Management Routes
            { path: 'whyChooseUs-table', element: <Suspense fallback={<LoadingFallback />}><WhyChooseUsCRUD /></Suspense> },

            // Career Option 
            { path: '/createCareerOption', element: <Suspense fallback={<LoadingFallback />}><CareerAdminForm /></Suspense> },


            //testimonials Policy Route
            { path: 'add-testimonials', element: <Suspense fallback={<LoadingFallback />}><CreateTestimonials /></Suspense> },
            { path: 'testimonials', element: <Suspense fallback={<LoadingFallback />}><TestimonialsTable /></Suspense> },
            { path: 'testimonials/editTestimonials/:id', element: <Suspense fallback={<LoadingFallback />}><EditTestimonial /></Suspense> },
            // Cookies Policy Route 
            { path: 'cookies', element: <Suspense fallback={<LoadingFallback />}><CookiesForm /></Suspense> },
            // Unified Policies CRUD (Cookies / Terms / Privacy)
            { path: 'policy-table', element: <Suspense fallback={<LoadingFallback />}><PolicyTable /></Suspense> },
            { path: 'policy-form', element: <Suspense fallback={<LoadingFallback />}><PolicyForm /></Suspense> },
            { path: 'edit-policy/:id', element: <Suspense fallback={<LoadingFallback />}><PolicyForm /></Suspense> },
            // Counter Routes
            { path: 'counter', element: <Suspense fallback={<LoadingFallback />}><CounterTable /></Suspense> },
            { path: 'add-counter', element: <Suspense fallback={<LoadingFallback />}><AddCounter /></Suspense> },
            { path: 'edit-counter/:id', element: <Suspense fallback={<LoadingFallback />}><EditCounter /></Suspense> },

            // Text Slider Routes
            { path: 'text-slider', element: <Suspense fallback={<LoadingFallback />}><TextSliderCRUD /></Suspense> },

            // Alert Bar Routes
            { path: 'alert-bar', element: <Suspense fallback={<LoadingFallback />}><AlertBarManagement /></Suspense> },

            // Company Dropdown
            { path: 'company-item-table', element: <Suspense fallback={<LoadingFallback />}><CompanyItemTable /></Suspense> },
            { path: 'add-company-item', element: <Suspense fallback={<LoadingFallback />}><CompanyItemForm /></Suspense> },
            { path: 'edit-company-item/:id', element: <Suspense fallback={<LoadingFallback />}><CompanyItemForm /></Suspense> },

            // Life at RND Management Routes
            { path: 'life-at-rnd/categories', element: <Suspense fallback={<LoadingFallback />}><LifeAtRndCategoryTable /></Suspense> },
            { path: 'life-at-rnd/add-category', element: <Suspense fallback={<LoadingFallback />}><LifeAtRndCategoryForm /></Suspense> },
            { path: 'life-at-rnd/edit-category/:id', element: <Suspense fallback={<LoadingFallback />}><LifeAtRndCategoryForm /></Suspense> },
            { path: 'life-at-rnd/gallery', element: <Suspense fallback={<LoadingFallback />}><LifeAtRndGalleryTable /></Suspense> },
            { path: 'life-at-rnd/add-gallery', element: <Suspense fallback={<LoadingFallback />}><LifeAtRndGalleryForm /></Suspense> },
            { path: 'life-at-rnd/edit-gallery/:id', element: <Suspense fallback={<LoadingFallback />}><LifeAtRndGalleryForm /></Suspense> },

          ]
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
