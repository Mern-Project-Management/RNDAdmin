import React, { useEffect, useState } from 'react';
import { Mail, Phone, PhoneCall, MousePointerClick, FileText, Briefcase, Send, X, RefreshCw, Info, BarChart2 } from 'lucide-react';
import axios from 'axios';

const CopyStatsModal = ({ isOpen, onClose, itemName, itemPath, itemType = 'Page' }) => {
  const [stats, setStats] = useState({
    emailCopyCount: 0,
    phoneCopyCount: 0,
    requestCallCount: 0,
    ctaContactCount: 0,
    callbackFormCount: 0,
    jobApplyCount: 0,
    contactEmailCount: 0,
    contactPhoneCount: 0,
    contactFormCount: 0,
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
          requestCallCount: response.data.requestCallCount || 0,
          ctaContactCount: response.data.ctaContactCount || 0,
          callbackFormCount: response.data.callbackFormCount || 0,
          jobApplyCount: response.data.jobApplyCount || 0,
          contactEmailCount: response.data.contactEmailCount || 0,
          contactPhoneCount: response.data.contactPhoneCount || 0,
          contactFormCount: response.data.contactFormCount || 0,
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
  const isCareer = itemType === 'Career' || itemType === 'Career Application';
  const isBlog = itemType === 'Blog';
  const isContactPage = displayPath.includes('contact-us') || itemType === 'Contact Page';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="bg-white p-5 border-b border-gray-200 flex justify-between items-center">
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
              <h3 className="text-lg font-bold text-gray-900 mt-1" title={itemName}>
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
                  Page Contact Interactions & Submissions Analytics
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-3 py-1 rounded-md border border-gray-200 shadow-xs">
                  <BarChart2 size={14} className="text-gray-500" />
                  <span>Total Interactions:</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">
                    {loading ? '...' : stats.totalCopyCount}
                  </span>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* 1. Footer Email */}
                <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Footer Email</h4>
                      <p className="text-[11px] text-gray-500">Copied count</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-amber-600 font-mono">
                      {loading ? '...' : stats.emailCopyCount}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-medium">copies</span>
                  </div>
                </div>

                {/* 2. Footer Phone */}
                <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Footer Phone</h4>
                      <p className="text-[11px] text-gray-500">Copied count</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-blue-600 font-mono">
                      {loading ? '...' : stats.phoneCopyCount}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-medium">copies</span>
                  </div>
                </div>

                {/* 3. Request a Call */}
                <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                      <PhoneCall size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Request Call</h4>
                      <p className="text-[11px] text-gray-500">Button clicks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-emerald-600 font-mono">
                      {loading ? '...' : stats.requestCallCount}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-medium">clicks</span>
                  </div>
                </div>

                {/* 4. Footer CTA Contact Us Card */}
                <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:border-purple-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                      <MousePointerClick size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">CTA Contact</h4>
                      <p className="text-[11px] text-gray-500">Button clicks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-purple-600 font-mono">
                      {loading ? '...' : stats.ctaContactCount}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-medium">clicks</span>
                  </div>
                </div>

                {/* Special Contact Us Page Extra Cards */}
                {isContactPage && (
                  <>
                    {/* Contact Page Sales Enquiry Email */}
                    <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:border-orange-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
                          <Mail size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">Contact Email</h4>
                          <p className="text-[11px] text-gray-500">Sales Enquiry copies</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-orange-600 font-mono">
                          {loading ? '...' : stats.contactEmailCount}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-medium">copies</span>
                      </div>
                    </div>

                    {/* Contact Page Sales Enquiry Phone */}
                    <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:border-teal-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shrink-0">
                          <Phone size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">Contact Phone</h4>
                          <p className="text-[11px] text-gray-500">Sales Enquiry copies</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-teal-600 font-mono">
                          {loading ? '...' : stats.contactPhoneCount}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-medium">copies</span>
                      </div>
                    </div>

                    {/* Contact Page "Get in Touch" Form */}
                    <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:border-cyan-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shrink-0">
                          <Send size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">Contact Form</h4>
                          <p className="text-[11px] text-gray-500">Get in Touch submits</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-cyan-600 font-mono">
                          {loading ? '...' : stats.contactFormCount}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-medium">submits</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Blog Callback Form Card (if blog page or if callback submissions exist) */}
                {(isBlog || (!isContactPage && stats.callbackFormCount > 0)) && (
                  <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:border-rose-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Callback Form</h4>
                        <p className="text-[11px] text-gray-500">Form submits</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-rose-600 font-mono">
                        {loading ? '...' : stats.callbackFormCount}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-medium">submits</span>
                    </div>
                  </div>
                )}

                {/* Job Applications Card (if career page or if job apply submissions exist) */}
                {(isCareer || (!isContactPage && stats.jobApplyCount > 0)) && (
                  <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Job Apply</h4>
                        <p className="text-[11px] text-gray-500">Application submits</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-indigo-600 font-mono">
                        {loading ? '...' : stats.jobApplyCount}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-medium">submits</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#ffd333] hover:bg-[#edc32f] text-gray-900 font-bold rounded-lg transition-colors text-sm shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default CopyStatsModal;
