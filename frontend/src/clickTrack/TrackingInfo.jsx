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
          axios.get("/api/tracking/events?limit=10000"),
          axios.get("/api/tracking/analytics"),
        ])
        
        if (eventsRes.status !== 200 || analyticsRes.status !== 200) {
          throw new Error("Failed to fetch data")
        }

        const eventsData = eventsRes.data;
        const analyticsData = analyticsRes.data;

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

  // Calculate unique IP count directly from events array for Unique Visitors metric
  const uniqueVisitorsCount = (() => {
    if (!events || events.length === 0) return analytics?.uniqueVisitors || 0;
    const ipSet = new Set();
    events.forEach(e => {
      if (e.ipAddress && e.ipAddress !== 'unknown' && e.ipAddress !== 'pending') {
        ipSet.add(e.ipAddress);
      }
    });
    return ipSet.size > 0 ? ipSet.size : (analytics?.uniqueVisitors || analytics?.uniqueUsers || 0);
  })();

  const totalClicksCount = (() => {
    if (!events || events.length === 0) return analytics?.totalClicks || analytics?.totalEvents || 0;
    return events.reduce((sum, e) => sum + (e.repetitionCount || 1), 0);
  })();

  const activePagesCount = (() => {
    if (!events || events.length === 0) return analytics?.eventsByPage ? Object.keys(analytics.eventsByPage).length : 0;
    const pageSet = new Set(events.map(e => e.page).filter(Boolean));
    return pageSet.size;
  })();

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
                <p className="text-red-600 text-xs mt-2">Please check if the server is running on port 3028</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50/50 p-2 md:p-6">
      <div className="max-w-[1550px] mx-auto space-y-6">
        <EventTable data={events} />
      </div>
    </main>
  )
}
