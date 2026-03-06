"use client"

import { useState, useEffect } from "react"
import EventTable from "./Event-Table"
import EventCharts from "./Events-Chart"
import { BarChart3 } from "lucide-react"
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
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-red-500 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading analytics data...</p>
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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-200 rounded-lg">
              <BarChart3 className="w-6 h-6 text-gray-700" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Event Analytics
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-11">
            Track and analyze user interactions across your application
          </p>
        </div>

        {/* Tabs Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab("table")}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-300 ${activeTab === "table"
                ? "text-red-600 border-b-2 border-red-500 bg-white"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              📊 Table View
            </button>
            <button
              onClick={() => setActiveTab("charts")}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-300 ${activeTab === "charts"
                ? "text-red-600 border-b-2 border-red-500 bg-white"
                : "text-gray-600 hover:text-gray-900"
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