"use client"

import { useState, useEffect } from "react"
import EventTable from "./Event-Table"
import EventCharts from "./Events-Chart"
import { BarChart3, Activity, FileText, Users, Clock } from "lucide-react"
import axios from "axios"

export default function TrackingInfo() {
  const [activeTab, setActiveTab] = useState("table")
  const [events, setEvents] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [eventsRes, analyticsRes] = await Promise.all([
          axios.get("/api/tracking/events"),
          axios.get("/api/tracking/analytics"),
        ])
        console.log(eventsRes, analyticsRes);
        if (eventsRes.status !== 200 || analyticsRes.status !== 200) {
          throw new Error("Failed to fetch data")
        }

        const eventsData = eventsRes.data;
        const analyticsData = analyticsRes.data;

        console.log("Tracking Events Response:", eventsData);
        console.log("Tracking Analytics Response:", analyticsData);

        setEvents(eventsData.events || [])
        setAnalytics(analyticsData)
        setError(null)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium italic">Gathering event insights...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <div>
                <p className="text-red-900 font-semibold">Connection Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <p className="text-red-600 text-xs mt-2">Please check if the server is running on port 3023</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="p-1 mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
            Event Analytics
          </h1>
        </div>

        {/* Metric Cards - Matching Dashboard style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Events Card */}
          <div className="bg-emerald-500 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
            <div className="text-4xl font-bold mb-2">{analytics?.totalEvents || 0}</div>
            <div className="text-lg">Total Events</div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
              <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1zM8 11a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm9-11a1 1 0 011 1v10a1 1 0 01-1 1h-1V4h1z" />
              </svg>
            </div>
          </div>

          {/* Unique Pages Card - Using Total Chemicals Icon (Amber) */}
          <div className="bg-amber-500 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
            <div className="text-4xl font-bold mb-2">
              {analytics?.eventsByPage ? Object.keys(analytics.eventsByPage).length : 0}
            </div>
            <div className="text-lg">Unique Pages</div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
              <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>

          {/* Unique Users Card - Using Total Customers Icon (Purple) */}
          <div className="bg-indigo-600 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
            <div className="text-4xl font-bold mb-2">{analytics?.uniqueUsers || 0}</div>
            <div className="text-lg">Unique Users</div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
              <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>

          {/* Unique Sessions Card - Using Total Inquiries Icon (Blue) */}
          <div className="bg-cyan-500 text-white p-6 rounded-md shadow-lg relative overflow-hidden">
            <div className="text-4xl font-bold mb-2">{analytics?.uniqueSessions || 0}</div>
            <div className="text-lg">Unique Sessions</div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
              <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabs Container */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab("table")}
              className={`flex-1 px-6 py-4 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === "table"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
                : "text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                }`}
            >
              📊 Table View
            </button>
            <button
              onClick={() => setActiveTab("charts")}
              className={`flex-1 px-6 py-4 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === "charts"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
                : "text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                }`}
            >
              📈 Analytics View
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "table" && <EventTable data={events} />}
            {activeTab === "charts" && <EventCharts data={events} analytics={analytics} />}
          </div>
        </div>
      </div>
    </main>
  )
}