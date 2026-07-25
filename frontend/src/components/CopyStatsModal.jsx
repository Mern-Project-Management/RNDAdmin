import React, { useEffect, useState } from 'react';
import { Mail, Phone, X, RefreshCw, Info, BarChart2 } from 'lucide-react';
import axios from 'axios';

const CopyStatsModal = ({ isOpen, onClose, itemName, itemPath, itemType = 'Page' }) => {
  const [stats, setStats] = useState({
    emailCopyCount: 0,
    phoneCopyCount: 0,
    totalCopyCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!itemPath) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `/api/tracking/page-copy-stats?pagePath=${encodeURIComponent(itemPath)}`
      );
      if (response.data && response.data.success) {
        setStats({
          emailCopyCount: response.data.emailCopyCount || 0,
          phoneCopyCount: response.data.phoneCopyCount || 0,
          totalCopyCount: response.data.totalCopyCount || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching copy stats:', err);
      setError('Failed to load tracking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, itemPath]);

  if (!isOpen) return null;

  const displayPath = itemPath.startsWith('/') ? itemPath : `/${itemPath}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ffd333]/20 flex items-center justify-center text-[#1a1a1a]">
              <Info className="w-6 h-6 text-[#d4a000]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  {itemType} Tracking Info
                </span>
                <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                  {displayPath}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-1" title={itemName}>
                {itemName}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh statistics"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-gray-600' : 'text-gray-600'} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 bg-gray-50/50">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg text-center">
              {error}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Footer Contact Copy Analytics
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-3 py-1 rounded-md border border-gray-200 shadow-xs">
                  <BarChart2 size={14} className="text-gray-500" />
                  <span>Total Copies:</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">
                    {loading ? '...' : stats.totalCopyCount}
                  </span>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Stat Card */}
                <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between shadow-xs hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-800">Footer Email</h4>
                      <p className="text-xs text-gray-500">Times copied by visitors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-amber-600 font-mono">
                      {loading ? '...' : stats.emailCopyCount}
                    </span>
                    <span className="text-xs text-gray-400 block font-medium">copies</span>
                  </div>
                </div>

                {/* Phone Stat Card */}
                <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between shadow-xs hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-800">Footer Phone</h4>
                      <p className="text-xs text-gray-500">Times copied by visitors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-blue-600 font-mono">
                      {loading ? '...' : stats.phoneCopyCount}
                    </span>
                    <span className="text-xs text-gray-400 block font-medium">copies</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#ffd333] hover:bg-[#edc32f] text-gray-900 font-bold rounded-lg transition-colors text-sm shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default CopyStatsModal;
