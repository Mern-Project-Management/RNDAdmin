import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/layout/components/app-sidebar"; // Ensure correct path to AppSidebar
import { Outlet } from "react-router-dom";
import Navbar from './components/Navbar';

function Layout() {
  return (
    <SidebarProvider className="overflow-hidden">
      <div className="flex w-full">
        {/* Sidebar */}
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header / Navbar */}
          <header className="bg-[#ffcc00]">
            <Navbar />
          </header>

          {/* Main content rendered via Outlet */}
          <div className="px-5 py-2 overflow-auto">
            {/* This is where child components like Pera will render */}
            <Outlet />
         
          </div>
         
        </main>
      </div>
    </SidebarProvider>
  );
}

export default Layout;



