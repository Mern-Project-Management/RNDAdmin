"use client"

import { useState, useMemo } from "react"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trash2, X, AlertTriangle, Search, Download, BarChart2, Activity, Globe, Users } from "lucide-react"
import axios from "axios"

export default function EventTable({ data: initialRawData }) {
  // Filter out rows where page is missing or empty
  const rawEvents = (initialRawData || []).filter(item => {
    return item.page && item.page !== "" && item.page !== "undefined" && item.page !== "null";
  });

  const [rawEventsState, setRawEventsState] = useState(rawEvents)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedActionFilter, setSelectedActionFilter] = useState("All Actions")
  const [viewMode, setViewMode] = useState("matrix") // 'matrix' | 'logs'
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: "totalClicks", direction: "desc" })
  
  // Delete modal state for log view
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  
  const itemsPerPage = 10

  // Metrics calculations for top cards
  const totalClicksCount = useMemo(() => {
    return rawEventsState.reduce((sum, e) => sum + (e.repetitionCount || 1), 0)
  }, [rawEventsState])

  const totalEventsCount = rawEventsState.length

  const activePagesCount = useMemo(() => {
    const pages = new Set(rawEventsState.map(e => e.page).filter(Boolean))
    return pages.size
  }, [rawEventsState])

  const uniqueVisitorsCount = useMemo(() => {
    const ipSet = new Set()
    rawEventsState.forEach(e => {
      if (e.ipAddress && e.ipAddress !== "unknown" && e.ipAddress !== "pending") {
        ipSet.add(e.ipAddress)
      }
    })
    return ipSet.size > 0 ? ipSet.size : 1
  }, [rawEventsState])

  // Category badge helper matching screenshot style
  const getCategoryBadge = (url) => {
    if (!url || url === "/" || url === "/home") {
      return { text: "HOME", className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
    }
    const lower = url.toLowerCase()
    if (lower.includes("contact")) {
      return { text: "CONTACT", className: "bg-purple-50 text-purple-700 border-purple-200" }
    }
    if (lower.includes("career") || lower.includes("future")) {
      return { text: "CAREER", className: "bg-blue-50 text-blue-700 border-blue-200" }
    }
    if (lower.includes("blog")) {
      return { text: "BLOG", className: "bg-amber-50 text-amber-700 border-amber-200" }
    }
    if (lower.includes("service")) {
      return { text: "SERVICE", className: "bg-teal-50 text-teal-700 border-teal-200" }
    }
    if (lower.includes("aroma") || lower.includes("chemical") || lower.includes("product") || lower.includes("fragrance") || lower.includes("flavor")) {
      const depth = url.split("/").filter(Boolean).length
      if (depth > 2) {
        return { text: "SUBCATEGORY", className: "bg-pink-50 text-pink-700 border-pink-200" }
      }
      return { text: "PRODUCT", className: "bg-indigo-50 text-indigo-700 border-indigo-200" }
    }
    return { text: "PAGE", className: "bg-gray-100 text-gray-700 border-gray-200" }
  }

  const getSlug = (url) => {
    if (!url || url === "/" || url === "") return "/home"
    return url.startsWith("/") ? url : "/" + url
  }

  // Aggregate raw click events into page matrix rows matching exact website tracking fields
  const matrixData = useMemo(() => {
    const pageMap = {}

    rawEventsState.forEach(event => {
      const pagePath = getSlug(event.page)

      if (!pageMap[pagePath]) {
        pageMap[pagePath] = {
          id: pagePath,
          page: pagePath,
          badge: getCategoryBadge(pagePath),
          totalClicks: 0,
          footerEmail: 0,
          footerPhone: 0,
          requestCall: 0,
          ctaContact: 0,
          callbackForm: 0,
          readMore: 0,
          hrEmail: 0,
          hrPhone: 0,
          careerApply: 0,
          contactEmail: 0,
          contactPhone: 0,
          contactForm: 0,
          uniqueIps: new Set()
        }
      }

      const row = pageMap[pagePath]
      const count = event.repetitionCount || 1
      row.totalClicks += count

      if (event.ipAddress && event.ipAddress !== "unknown" && event.ipAddress !== "pending") {
        row.uniqueIps.add(event.ipAddress)
      }

      const btn = (event.buttonName || "").toLowerCase()
      const target = (event.metadata && event.metadata.target ? event.metadata.target : "").toLowerCase()

      // Exact 1-to-1 matching with website tracking tags:
      if (target === "contact_email" || btn === "sales enquiry email") {
        row.contactEmail += count
      } else if (target === "contact_phone" || btn === "sales enquiry phone") {
        row.contactPhone += count
      } else if (target === "contact_form") {
        row.contactForm += count
      } else if (target === "hr_email" || btn === "hr email") {
        row.hrEmail += count
      } else if (target === "hr_phone" || btn === "hr phone") {
        row.hrPhone += count
      } else if (target === "read_more" || btn === "read more") {
        row.readMore += count
      } else if (target === "email" || btn === "footer email") {
        row.footerEmail += count
      } else if (target === "phone" || btn === "footer phone") {
        row.footerPhone += count
      } else if (target === "request_call" || btn.includes("request a call")) {
        row.requestCall += count
      } else if (target === "cta_contact" || btn.includes("footer cta contact us")) {
        row.ctaContact += count
      } else if (target === "blog_callback" || btn.includes("blog callback form") || btn.includes("callback")) {
        row.callbackForm += count
      } else if (target === "career_apply" || target === "job_apply" || btn.includes("career")) {
        row.careerApply += count
      }
    })

    return Object.values(pageMap)
  }, [rawEventsState])

  // Filter matrix data based on search term & selected action filter
  const filteredMatrixData = useMemo(() => {
    return matrixData.filter(row => {
      // 1. Search term (URL / slug matching)
      const matchesSearch = searchTerm === "" || row.page.toLowerCase().includes(searchTerm.toLowerCase().trim())
      
      if (!matchesSearch) return false

      // 2. Action filter
      if (selectedActionFilter === "Common Actions") {
        return row.footerEmail > 0 || row.footerPhone > 0 || row.requestCall > 0 || row.ctaContact > 0
      }
      if (selectedActionFilter === "Blog Actions") {
        return row.callbackForm > 0 || row.readMore > 0
      }
      if (selectedActionFilter === "Career / HR Actions") {
        return row.hrEmail > 0 || row.hrPhone > 0 || row.careerApply > 0
      }
      if (selectedActionFilter === "Contact Us Actions") {
        return row.contactEmail > 0 || row.contactPhone > 0 || row.contactForm > 0
      }

      return true
    })
  }, [matrixData, searchTerm, selectedActionFilter])

  // Sorting
  const sortedMatrixData = useMemo(() => {
    return [...filteredMatrixData].sort((a, b) => {
      if (!sortConfig) return 0
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }, [filteredMatrixData, sortConfig])

  // Pagination for Matrix Table
  const totalPages = Math.ceil(sortedMatrixData.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMatrixData = sortedMatrixData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" }
      }
      return { key, direction: "desc" }
    })
  }

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      "Page Info",
      "Total Clicks",
      "Footer Email",
      "Footer Phone",
      "Request Call",
      "CTA Contact",
      "Callback Form",
      "Read More",
      "HR Email",
      "HR Phone",
      "Career Apply",
      "Contact Email",
      "Contact Phone",
      "Contact Form"
    ]

    const csvRows = [headers.join(",")]

    sortedMatrixData.forEach(row => {
      const values = [
        `"${row.page}"`,
        row.totalClicks,
        row.footerEmail,
        row.footerPhone,
        row.requestCall,
        row.ctaContact,
        row.callbackForm,
        row.readMore,
        row.hrEmail,
        row.hrPhone,
        row.careerApply,
        row.contactEmail,
        row.contactPhone,
        row.contactForm
      ]
      csvRows.push(values.join(","))
    })

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `event_analytics_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Raw Event Delete Handler
  const handleDelete = async (eventId) => {
    setDeletingId(eventId)
    try {
      const response = await axios.delete(`/api/tracking/delete?id=${eventId}`)
      if (response.data.success) {
        setRawEventsState(prev => prev.filter(e => e._id !== eventId))
      } else {
        alert(`Failed to delete: ${response.data.message}`)
      }
    } catch (err) {
      console.error("Delete error:", err)
      alert("Error occurred while deleting event")
    } finally {
      setDeletingId(null)
      setShowDeleteModal(false)
      setEventToDelete(null)
    }
  }

  const formatValue = (val) => {
    return val > 0 ? (
      <span className="font-semibold text-gray-800">{val}</span>
    ) : (
      <span className="text-gray-300">-</span>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header Card matching User Screenshot */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100/60 text-orange-600 flex items-center justify-center flex-shrink-0 border border-orange-200/50">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Event Analytics</h1>
        </div>

        {/* Right: Search, Actions Dropdown & Export CSV */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search by Page URL */}
          <div className="relative flex-1 min-w-[220px] md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search by page URL (slug)..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Filter Dropdown */}
          <select
            value={selectedActionFilter}
            onChange={(e) => {
              setSelectedActionFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
          >
            <option value="All Actions">All Actions</option>
            <option value="Common Actions">Common Actions (Footer/Nav/CTA)</option>
            <option value="Blog Actions">Blog Actions (Callback/Read More)</option>
            <option value="Career Actions">Career Actions (HR/Apply)</option>
            <option value="Contact Actions">Contact Page Actions</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-semibold text-sm rounded-xl flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

        </div>
      </div>

      {/* Row 2: Metric Cards Row matching User Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Clicks Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Clicks</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalClicksCount}</h3>
          </div>
        </div>

        {/* Total Events Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Events</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalEventsCount}</h3>
          </div>
        </div>

        {/* Active Pages Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Active Pages</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{activePagesCount}</h3>
          </div>
        </div>

        {/* Unique Visitors Card (IP Based) */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Unique Visitors</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{uniqueVisitorsCount}</h3>
          </div>
        </div>

      </div>

      {/* MATRIX TABLE VIEW */}
      {viewMode === "matrix" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                
                {/* Row 1: Header Category Groups */}
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  
                  {/* Page Info */}
                  <th rowSpan={2} className="px-6 py-4 text-left bg-gray-50 border-r border-gray-200 min-w-[220px]">
                    <button
                      onClick={() => handleSort("page")}
                      className="flex items-center gap-1 font-bold text-gray-800 hover:text-indigo-600 transition-colors"
                    >
                      Page Info
                      {sortConfig?.key === "page" && (
                        sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>

                  {/* Total Clicks */}
                  <th rowSpan={2} className="px-4 py-4 text-center bg-gray-50 border-r border-gray-200 min-w-[90px]">
                    <button
                      onClick={() => handleSort("totalClicks")}
                      className="flex items-center justify-center gap-1 font-bold text-red-600 hover:text-red-700 transition-colors"
                    >
                      Total Clicks
                      {sortConfig?.key === "totalClicks" && (
                        sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>

                  {/* Common Actions Group (All Pages) */}
                  <th colSpan={4} className="px-4 py-2.5 text-center bg-blue-50/80 border-r border-gray-200 text-blue-800">
                    Common Actions (All Pages)
                  </th>

                  {/* Blog Actions Group */}
                  <th colSpan={2} className="px-4 py-2.5 text-center bg-amber-50/80 border-r border-gray-200 text-amber-800">
                    Blog / Content
                  </th>

                  {/* Career / HR Group */}
                  <th colSpan={3} className="px-4 py-2.5 text-center bg-purple-50/80 border-r border-gray-200 text-purple-800">
                    Career / HR Actions
                  </th>

                  {/* Contact Us Group */}
                  <th colSpan={3} className="px-4 py-2.5 text-center bg-teal-50/80 text-teal-800">
                    Contact Us Page
                  </th>
                </tr>

                {/* Row 2: Sub-column Titles */}
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500">
                  
                  {/* Common Actions Sub-columns */}
                  <th className="px-3 py-2 text-center bg-blue-50/30 border-r border-gray-100">Footer Email</th>
                  <th className="px-3 py-2 text-center bg-blue-50/30 border-r border-gray-100">Footer Phone</th>
                  <th className="px-3 py-2 text-center bg-blue-50/30 border-r border-gray-100">Request Call</th>
                  <th className="px-3 py-2 text-center bg-blue-50/30 border-r border-gray-200">CTA Contact</th>

                  {/* Blog Sub-columns */}
                  <th className="px-3 py-2 text-center bg-amber-50/30 border-r border-gray-100">Callback Form</th>
                  <th className="px-3 py-2 text-center bg-amber-50/30 border-r border-gray-200">Read More</th>

                  {/* Career Sub-columns */}
                  <th className="px-3 py-2 text-center bg-purple-50/30 border-r border-gray-100">HR Email</th>
                  <th className="px-3 py-2 text-center bg-purple-50/30 border-r border-gray-100">HR Phone</th>
                  <th className="px-3 py-2 text-center bg-purple-50/30 border-r border-gray-200">Career Apply</th>

                  {/* Contact Page Sub-columns */}
                  <th className="px-3 py-2 text-center bg-teal-50/30 border-r border-gray-100">Contact Email</th>
                  <th className="px-3 py-2 text-center bg-teal-50/30 border-r border-gray-100">Contact Phone</th>
                  <th className="px-3 py-2 text-center bg-teal-50/30">Contact Form</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedMatrixData.length > 0 ? (
                  paginatedMatrixData.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-indigo-50/20 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      {/* Page Info (URL + Category Badge) */}
                      <td className="px-6 py-3.5 border-r border-gray-200">
                        <div className="flex flex-col gap-1 items-start">
                          <a
                            href={row.page}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-900 hover:text-indigo-600 transition-colors hover:underline text-sm truncate max-w-[260px]"
                            title={row.page}
                          >
                            {row.page}
                          </a>
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider rounded border uppercase ${row.badge.className}`}>
                            {row.badge.text}
                          </span>
                        </div>
                      </td>

                      {/* Total Clicks */}
                      <td className="px-4 py-3.5 text-center font-bold text-red-600 text-base border-r border-gray-200">
                        {row.totalClicks}
                      </td>

                      {/* Common Actions */}
                      <td className="px-3 py-3.5 text-center border-r border-gray-100">{formatValue(row.footerEmail)}</td>
                      <td className="px-3 py-3.5 text-center border-r border-gray-100">{formatValue(row.footerPhone)}</td>
                      <td className="px-3 py-3.5 text-center border-r border-gray-100">{formatValue(row.requestCall)}</td>
                      <td className="px-3 py-3.5 text-center border-r border-gray-200">{formatValue(row.ctaContact)}</td>

                      {/* Blog Actions */}
                      <td className="px-3 py-3.5 text-center border-r border-gray-100">{formatValue(row.callbackForm)}</td>
                      <td className="px-3 py-3.5 text-center border-r border-gray-200">{formatValue(row.readMore)}</td>

                      {/* Career / HR */}
                      <td className="px-3 py-3.5 text-center border-r border-gray-100">{formatValue(row.hrEmail)}</td>
                      <td className="px-3 py-3.5 text-center border-r border-gray-100">{formatValue(row.hrPhone)}</td>
                      <td className="px-3 py-3.5 text-center border-r border-gray-200">{formatValue(row.careerApply)}</td>

                      {/* Contact Page */}
                      <td className="px-3 py-3.5 text-center border-r border-gray-100">{formatValue(row.contactEmail)}</td>
                      <td className="px-3 py-3.5 text-center border-r border-gray-100">{formatValue(row.contactPhone)}</td>
                      <td className="px-3 py-3.5 text-center">{formatValue(row.contactForm)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={14} className="py-12 text-center text-gray-500">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-gray-800">No matching event data found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search URL or action filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Matrix Table Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{paginatedMatrixData.length > 0 ? startIndex + 1 : 0}</span> to{" "}
              <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, sortedMatrixData.length)}</span> of{" "}
              <span className="font-bold text-gray-900">{sortedMatrixData.length}</span> active pages
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pNum
                  if (totalPages <= 5) pNum = i + 1
                  else if (currentPage <= 3) pNum = i + 1
                  else if (currentPage >= totalPages - 2) pNum = totalPages - 4 + i
                  else pNum = currentPage - 2 + i

                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        currentPage === pNum
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RAW EVENT LOGS VIEW */}
      {viewMode === "logs" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Page Path</th>
                  <th className="px-6 py-3.5">Button / Target</th>
                  <th className="px-6 py-3.5">IP Address</th>
                  <th className="px-6 py-3.5 text-right">Count</th>
                  <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rawEventsState.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((event, idx) => (
                  <tr key={event._id || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-gray-500 font-medium">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-indigo-600">{event.page}</td>
                    <td className="px-6 py-3.5 text-gray-800 font-medium">{event.buttonName || "-"}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-gray-500">{event.ipAddress || "Unknown IP"}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-emerald-600">{event.repetitionCount || 1}</td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => {
                          setEventToDelete(event)
                          setShowDeleteModal(true)
                        }}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && eventToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Event Log</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5 mb-6">
              <div className="flex justify-between"><span className="text-gray-500">Page:</span><span className="font-medium text-gray-900">{eventToDelete.page}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Button:</span><span className="font-medium text-gray-900">{eventToDelete.buttonName || "N/A"}</span></div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(eventToDelete._id)}
                disabled={deletingId === eventToDelete._id}
                className="flex-1 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === eventToDelete._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
