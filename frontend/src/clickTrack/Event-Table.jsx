"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trash2, X, AlertTriangle } from "lucide-react"
import axios from "axios"

export default function EventTable({ data: initialData }) {
  const [data, setData] = useState(initialData)
  const [sortConfig, setSortConfig] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const itemsPerPage = 10

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: "asc" }
    })
    setCurrentPage(1)
  }

  const handleDelete = async (eventId) => {
    setDeletingId(eventId)

    try {
      const response = await axios.delete(`/api/tracking/delete?id=${eventId}`)

      const result = response.data

      if (result.success) {
        // Remove the deleted item from local state
        setData(prevData => prevData.filter(event => event._id !== eventId))

        // Adjust current page if needed
        const newTotalPages = Math.ceil((data.length - 1) / itemsPerPage)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
      } else {
        alert(`Failed to delete event: ${result.message}`)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('An error occurred while deleting the event')
    } finally {
      setDeletingId(null)
      setShowDeleteModal(false)
      setEventToDelete(null)
    }
  }

  const openDeleteModal = (event) => {
    setEventToDelete(event)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setEventToDelete(null)
  }

  const SortIcon = ({ column }) => {
    if (sortConfig?.key !== column) {
      return <ChevronUp className="w-4 h-4 opacity-40" />
    }
    return sortConfig.direction === "asc" ?
      <ChevronUp className="w-4 h-4" /> :
      <ChevronDown className="w-4 h-4" />
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const truncateUrl = (url, maxLength = 35) => {
    if (!url) return ''
    return url.length > maxLength ? url.substring(0, maxLength) + "…" : url
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📭</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
        <p className="text-gray-600">There are no tracked events to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Event Details</h2>
        <p className="text-gray-600">Complete list of all tracked events with detailed information</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("timestamp")}
                  className="flex items-center gap-2 font-semibold text-gray-900 hover:text-red-600 transition-colors"
                >
                  Timestamp
                  <SortIcon column="timestamp" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("page")}
                  className="flex items-center gap-2 font-semibold text-gray-900 hover:text-red-600 transition-colors"
                >
                  Page
                  <SortIcon column="page" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("buttonName")}
                  className="flex items-center gap-2 font-semibold text-gray-900 hover:text-red-600 transition-colors"
                >
                  Button Name
                  <SortIcon column="buttonName" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("ipAddress")}
                  className="flex items-center gap-2 font-semibold text-gray-900 hover:text-red-600 transition-colors"
                >
                  IP Address
                  <SortIcon column="ipAddress" />
                </button>
              </th>
              <th className="px-6 py-4 text-right font-semibold text-gray-900">Count</th>
              <th className="px-6 py-4 text-center font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((event, idx) => (
              <tr
                key={event._id}
                className={`border-b border-gray-200 transition-colors ${idx % 2 === 0
                    ? "bg-white hover:bg-gray-50"
                    : "bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {formatDate(event.timestamp)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <a
                    href={"https://apurvachemicals.com" + event.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 font-medium hover:underline"
                    title={event.page}
                  >
                    {truncateUrl(event.page)}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium" title={event.buttonName}>
                  {truncateUrl(event.buttonName)}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">{event.ipAddress}</td>
                <td className="px-6 py-4 text-right font-bold text-red-600 text-lg">
                  {event.repetitionCount}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => openDeleteModal(event)}
                    disabled={deletingId === event._id}
                    className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete event"
                  >
                    {deletingId === event._id ? (
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <p className="text-sm text-gray-600 font-medium">
          Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{" "}
          <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, sortedData.length)}</span> of{" "}
          <span className="font-bold text-gray-900">{sortedData.length}</span> events
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page
              if (totalPages <= 5) {
                page = i + 1
              } else if (currentPage <= 3) {
                page = i + 1
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i
              } else {
                page = currentPage - 2 + i
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${currentPage === page
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                >
                  {page}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Event</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Page:</span>
                <span className="font-medium text-gray-900">{eventToDelete.page}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Button:</span>
                <span className="font-medium text-gray-900">{eventToDelete.buttonName || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Count:</span>
                <span className="font-bold text-red-600">{eventToDelete.repetitionCount}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deletingId === eventToDelete._id}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(eventToDelete._id)}
                disabled={deletingId === eventToDelete._id}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId === eventToDelete._id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}