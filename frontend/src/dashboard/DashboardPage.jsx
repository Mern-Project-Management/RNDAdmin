import { useState } from 'react'
import Dashboard from './Dashboard'
import BigCalendarView from './calender/big-calendar-view'
import InquiryLineChart from './chart/LineChart'
import DashboardFollowUpSidebar from './DashboardFollowUpSidebar'
 
const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6 px-0 py-2 bg-gray-50/10 min-h-screen">
      <Dashboard />
      
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
        <div className="lg:col-span-5 bg-white p-4 rounded-lg shadow-md border border-gray-100 min-h-[600px]">
          <BigCalendarView />
        </div>
        
        <div className="lg:col-span-3">
          <DashboardFollowUpSidebar />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
        <InquiryLineChart />
      </div>
    </div>
  )
}

export default DashboardPage
