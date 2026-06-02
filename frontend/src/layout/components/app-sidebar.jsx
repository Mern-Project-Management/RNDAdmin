import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, LayoutDashboard, PlusSquare, List, Settings, ArrowLeftRightIcon, UsersRoundIcon, Truck, Mail, FileQuestion, GanttChart, FlaskConical, Globe, Image, Menu, Newspaper, Contact, Briefcase, Info, Search, FileText, Send, SlidersHorizontal, FileType, Building, Handshake, ShoppingCart, ShieldQuestion, FileCheck, KeyRound, Link as LinkIcon, BookCopy, Lock, FileLock, MessageSquareQuote, Users, Edit3, Calculator, Video, PanelBottom, PanelTop, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

// Updated JSON structure with parent-child relationships
const menuData = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",

  },

  {
    title: "Services",
    icon: FlaskConical,
    children: [
      // { title: "ServiceList", icon: List, url: "/chemical-table" },
      { title: "ServiceSec1 Table", icon: PlusSquare, url: "/serviceSec1-table" },
      { title: "ServiceSec2 Table", icon: PlusSquare, url: "/serviceSec2-table" },

      { title: "ServiceSec3 Table", icon: PlusSquare, url: "/serviceSec3-table" },
      { title: "Our Service Banner", icon: Image, url: "/our-service-banner" },
      { title: "Why Choose Us", icon: PlusSquare, url: "/whyChooseUs-table" },
      { title: "Category", icon: GanttChart, url: "/service-category" },
      { title: "Testimonials", icon: FileText, url: "/testimonials" },
      { title: "Our Service FAQ", icon: FileQuestion, url: "/our-service-faq" }
    ]
  },
  {
    title: "Portfolio",
    icon: ShoppingCart,
    children: [
      { title: "Portfolio List", icon: List, url: "/portfolio" },
      { title: "Add New", icon: PlusSquare, url: "/portfolio-form" },
      { title: "Category", icon: GanttChart, url: "/portfolio-category" },
    ]
  },

  {
    title: "Email",
    icon: Mail,
    children: [
      { title: "SMTP Setting", icon: List, url: "/smtp-table" },
      { title: "Email Template", icon: PlusSquare, url: "/email-template-table" },
      { title: "Send Email ", icon: ArrowLeftRightIcon, url: "/email-form" },
      { title: "Email Category", icon: ArrowLeftRightIcon, url: "/email-category" },
    ]
  },
  {
    title: "Inquiry",
    icon: FileQuestion,
    children: [
      { title: "List", icon: List, url: "/inquiry-list" },
      { title: "Add New", icon: PlusSquare, url: "/add-inquiry" },
      { title: "Inquiry Sources", icon: List, url: "/source-table" },
      { title: "Inquiry Status", icon: List, url: "/status-table" },

    ]
  },
  {
    title: "SEO Management",
    icon: Search,
    children: [
      { title: "Pages / Meta Tags", icon: KeyRound, url: "/meta-table" },
      { title: "Global Settings", icon: Settings, url: "/global-settings" },
      { title: "Redirects", icon: ArrowLeftRightIcon, url: "/redirects" },
      { title: "Audit Reports", icon: List, url: "/audit-reports" },
      {
        title: "Blog",
        icon: Newspaper,
        children: [
          { title: "Blog Categories", icon: List, url: "/blog-category-table" },
          { title: "Blog", icon: PlusSquare, url: "/blog-table" },
        ]
      },
    ]
  },
  {
    title: "Website",
    icon: Globe,
    children: [
      {
        title: "Tracking Info",
        icon: Activity,
        url: "/tracking",
      },
      {
        title: "Logo", icon: Image,
        children: [

          { title: "Logo Form", icon: PlusSquare, url: "/add-logo" },
        ]
      },
      {
        title: "Stripe",
        icon: SlidersHorizontal,
        children: [
          { title: "Manage Stripe", icon: List, url: "/text-slider" },
        ]
      },

      {
        title: "Faq",
        icon: FileQuestion,
        children: [
          { title: "List", icon: List, url: "/faq" },
        ]
      },
      {
        title: "Home FAQ",
        icon: FileQuestion,
        url: "/home-faq"
      },
      {
        title: "Clients",
        icon: Users,
        children: [
          { title: "Client List", icon: List, url: "/clients-table" },
          { title: "Add New", icon: PlusSquare, url: "/add-client" }
        ]
      },

      {
        title: "About Us",
        icon: Building,
        children: [
          { title: "List", icon: List, url: "/about-us-table" },
          { title: "About FAQ", icon: FileQuestion, url: "/about-faq" },
          // { title: "Add New", icon: PlusSquare, url: "/about-us-form" },
        ]
      },
      {
        title: "Life at RND",
        icon: Image,
        children: [
          { title: "Categories", icon: List, url: "/life-at-rnd/categories" },
          { title: "Gallery", icon: Image, url: "/life-at-rnd/gallery" },
        ]
      },
      {
        title: "Company Dropdown",
        icon: LinkIcon,
        children: [
          { title: "List", icon: List, url: "/company-item-table" },
          { title: "Add New", icon: PlusSquare, url: "/add-company-item" },
        ]
      },
      {
        title: "Core Value",
        icon: UsersRoundIcon,
        children: [
          { title: "Core Value List", icon: List, url: "/core-value-table" },
          { title: "Add New", icon: PlusSquare, url: "/add-core-value" },
        ]
      },
      {
        title: "Banner",
        icon: Image,
        children: [
          {
            title: "List", icon: List, url:
              "/banner-table"
          },
          { title: "Add New", icon: PlusSquare, url: "/add-banner" },

        ]
      },

      {
        title: "Video",
        icon: Video,
        children: [
          { title: "Video List", icon: List, url: "/video-table" },
          { title: "Add New", icon: PlusSquare, url: "/video-form" },
        ]
      },
      {
        title: "Footer",
        icon: PanelBottom,
        children: [
          { title: "Footer List", icon: List, url: "/footer-table" },
          { title: "Add New", icon: PlusSquare, url: "/footer-form" },
        ]
      },
      {
        title: "Social Media",
        icon: LinkIcon,
        children: [
          { title: "Social Media List", icon: List, url: "/social-media" },
          { title: "Add New", icon: PlusSquare, url: "/social-media/add" },
        ]
      },
      {
        title: "Counter",
        icon: Calculator,
        children: [
          { title: "List", icon: List, url: "/counter" },
          { title: "Add New", icon: PlusSquare, url: "/add-counter" },
        ]
      },
      {
        title: "Our Staff", icon: Users, children: [
          { title: "Staff List", icon: List, url: "/our-staff-table" },
          { title: "Add New", icon: PlusSquare, url: "/our-staff-form" },
        ]
      },
      {
        title: "Career",
        icon: Briefcase,
        children: [
          { title: "List", icon: List, url: "/career-table" },
          { title: "Career Info", icon: PlusSquare, url: "/career-info-form" },
          { title: "Career Option", icon: PlusSquare, url: "/JobApplication" },
        ]
      },
      {
        title: "Contact Info",
        icon: Contact,
        children: [
          { title: "List", icon: List, url: "/contact-info-table" },
          // { title: "Add New", icon: PlusSquare, url: "/contact-info/add" },
        ]
      },

      {
        title: "WhatsUp Info",
        icon: MessageSquareQuote,
        children: [
          // {title:"List",icon:List,url:"/whatsUpInfo-table"},
          { title: "Add New", icon: PlusSquare, url: "/whatsUpInfo-form" }
        ]
      },


      {
        title: "catalogue Management",
        icon: BookCopy,
        children: [
          { title: "Catalogue List", icon: List, url: "/catalogue-table" },
          { title: "Add New", icon: PlusSquare, url: "/catalogue-form" }
        ]
      },
      {
        title: "PrivacyPolicy and Terms",
        icon: ShieldQuestion,
        children: [
          { title: "Privacy Policy", icon: List, url: "/privacypolicy-terms" },
          { title: "Terms and Condition", icon: PlusSquare, url: "/terms-and-conditions-form" },
          { title: "Cookies", icon: Lock, url: "/cookies" },
        ]
      },
      {
        title: "Alert Bar",
        icon: PanelTop,
        url: "/alert-bar",
      },
      {
        title: "Thank You",
        icon: FileCheck,
        url: "/thank-you",
      }
    ],
  },
];

export default function AppSidebar() {
  const [openSections, setOpenSections] = useState({ Website: true });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoData, setLogoData] = useState({ url: '', alt: 'Company Logo' });

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get("/api/companyLogo/get-logo");
        if (response.data.success && response.data.data) {
          const { headerLogo, headerLogoAltName } = response.data.data;
          // Construct the full URL for the logo image
          const imageUrl = `${headerLogo}`;
          setLogoData({ url: imageUrl, alt: headerLogoAltName || 'Company Logo' });
        }
      } catch (error) {
        console.error("Failed to fetch logo:", error);
        // You could set a fallback logo here if needed
      }
    };

    fetchLogo();
  }, []);


  const toggleUserMenu = () => {
    setUserMenuOpen((prev) => !prev);
  };
  const location = useLocation();

  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (url) => location.pathname === url;

  const renderMenuItems = (items) =>
    items.map((item) => {
      const isParentActive = item.children?.some((child) => isActive(child.url));
      const isChildActive = isActive(item.url);
      const activeClass = isParentActive || isChildActive ? "text-[#dbaf00] font-semibold" : "text-gray-600";

      return (
        <SidebarMenuItem key={item.title}>
          {item.children?.length ? (
            <Collapsible open={openSections[item.title]} onOpenChange={() => toggleSection(item.title)}>
              <CollapsibleTrigger asChild title={item.title}>
                <Button variant="ghost" className={`w-full justify-start gap-2 hover:text-[#dbaf00] font-normal overflow-hidden ${activeClass}`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1 text-left">{item.title}</span>
                  <ChevronDown className={cn("w-4 h-4 ml-auto shrink-0 transition-transform hover:text-[#dbaf00]", { "-rotate-90": !openSections[item.title] })} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-1">
                {renderMenuItems(item.children)}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuButton asChild title={item.title}>
              <Link to={item.url} className={`pl-4 flex items-center gap-2 hover:text-[#dbaf00] overflow-hidden ${activeClass}`}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 text-left">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar >
      <SidebarContent>

        <div className="p-4 border-b">
          {logoData.url && <img src={`/api/logo/download/${logoData.url}`} alt={logoData.alt} className="h-16 mx-auto" />}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarMenu>{renderMenuItems(menuData)}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {/* <Separator className="my-4" /> */}
      {/* <ScrollArea className="p-4">
      <ScrollArea className="p-4">
        <Button variant="ghost" className="w-full justify-start gap-2 font-normal" onClick={toggleUserMenu}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">SC</span>
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">shadcn</div>
              <div className="text-xs text-muted-foreground">m@example.com</div>
            </div>
            <ChevronDown className={cn("w-4 h-4 ml-auto transition-transform", { "-rotate-180": userMenuOpen })} />
          </div>
        </Button>

      
        {userMenuOpen && (
          <div className="mt-2 pl-8">
            <Button variant="ghost" className="w-full justify-start gap-2 font-normal text-sm">
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 font-normal text-sm">
              Account Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 font-normal text-sm text-red-600">
              Logout
            </Button>
          </div>
        )}
      </ScrollArea> 
      </ScrollArea> */}
    </Sidebar>
  );
}




