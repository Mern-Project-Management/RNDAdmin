import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SeoDashboardWidget = () => {
  const [latestAudit, setLatestAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestAudit = async () => {
      try {
        const response = await axios.get('/api/seo-audit');
        if (response.data && response.data.success && response.data.data.length > 0) {
          setLatestAudit(response.data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching SEO audit for dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestAudit();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500';
    if (score >= 50) return 'text-[#ffd333] border-[#ffd333]';
    return 'text-red-500 border-red-500';
  };

  if (loading) {
    return <div className="p-4 bg-white rounded-md shadow flex items-center justify-center min-h-[200px]">Loading SEO data...</div>;
  }

  if (!latestAudit) {
    return <div className="p-4 bg-white rounded-md shadow flex items-center justify-center min-h-[200px]">No SEO audits found.</div>;
  }

  // Calculate stats for SEO Health Overview
  let goodScore = 0;
  let needsWorkScore = 0;
  let criticalScore = 0;
  let noIndexCount = 0;
  const totalPages = latestAudit.pagesCrawled || (latestAudit.pageResults ? latestAudit.pageResults.length : 0);

  if (latestAudit.pageResults) {
    latestAudit.pageResults.forEach(page => {
      if (page.noIndex) noIndexCount++;
      if (page.score >= 80) goodScore++;
      else if (page.score >= 50) needsWorkScore++;
      else criticalScore++;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {/* Latest Audit Card */}
      <div className="bg-white p-5 rounded-md shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Latest Audit</h2>
          <Link to="/audit-reports" className="text-emerald-600 text-sm font-medium flex items-center hover:underline">
            View all <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        
        <div className="flex items-center gap-6 mb-4">
          <div className={`w-24 h-24 rounded-full border-[6px] flex items-center justify-center flex-col ${getScoreColor(latestAudit.overallScore)}`}>
            <span className="text-3xl font-bold">{latestAudit.overallScore}</span>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
              <div className="flex items-center text-gray-600"><CheckCircle2 size={16} className="text-emerald-500 mr-2" /> Pages crawled</div>
              <div className="font-bold">{totalPages}</div>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
              <div className="flex items-center text-gray-600"><AlertCircle size={16} className="text-red-500 mr-2" /> Errors</div>
              <div className="font-bold text-red-500">{latestAudit.errorsFound}</div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center text-gray-600"><AlertTriangle size={16} className="text-amber-400 mr-2" /> Warnings</div>
              <div className="font-bold text-amber-500">{latestAudit.warningsFound}</div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mt-auto border-t border-gray-50 pt-3">
          Completed {formatDate(latestAudit.completedAt)}
        </div>
      </div>

      {/* SEO Health Overview Card */}
      <div className="bg-white p-5 rounded-md shadow-sm border border-gray-100 flex flex-col justify-between">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">SEO Health Overview</h2>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span> Score ≥ 80 (Good)
            </div>
            <div className="text-gray-800">{goodScore} / {totalPages}</div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-2"></span> Score 50–79 (Needs Work)
            </div>
            <div className="text-gray-800">{needsWorkScore} / {totalPages}</div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></span> Score {'<'} 50 (Critical)
            </div>
            <div className="text-gray-800">{criticalScore} / {totalPages}</div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-2"></span> noIndex (Hidden from Google)
            </div>
            <div className="text-gray-800">{noIndexCount} / {totalPages}</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex mt-auto">
          {totalPages > 0 && (
            <>
              <div className="h-full bg-emerald-500" style={{ width: `${(goodScore / totalPages) * 100}%` }}></div>
              <div className="h-full bg-amber-400" style={{ width: `${(needsWorkScore / totalPages) * 100}%` }}></div>
              <div className="h-full bg-red-500" style={{ width: `${(criticalScore / totalPages) * 100}%` }}></div>
              <div className="h-full bg-slate-400" style={{ width: `${(noIndexCount / totalPages) * 100}%` }}></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeoDashboardWidget;
