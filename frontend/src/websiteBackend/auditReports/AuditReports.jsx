import React, { useEffect, useState } from "react";
import { Button, Popconfirm, message, Spin, Tag, Collapse } from "antd";
import { Activity, Trash2, Play, CheckCircle2, AlertCircle, AlertTriangle, Info, Calendar } from "lucide-react";
import axios from "axios";

const { Panel } = Collapse;

const AuditReports = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [activeAudit, setActiveAudit] = useState(null);

  useEffect(() => {
    fetchAudits();
  }, []);

  useEffect(() => {
    let intervalId;
    if (activeAudit && !activeAudit.completedAt) {
      intervalId = setInterval(() => {
        fetchAudits();
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeAudit]);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/seo-audit");
      if (response.data && response.data.success) {
        setAudits(response.data.data);
        if (response.data.data.length > 0) {
          setActiveAudit(response.data.data[0]);
        } else {
          setActiveAudit(null);
        }
      }
    } catch (error) {
      console.error("Error fetching audits", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    try {
      setRunning(true);
      message.loading({ content: 'Starting background audit...', key: 'auditRun' });
      await axios.post("/api/seo-audit/run");
      message.success({ content: 'Audit started in background! Check back in a few minutes.', key: 'auditRun', duration: 4 });
      fetchAudits();
    } catch (error) {
      message.error({ content: 'Failed to start audit', key: 'auditRun' });
      console.error("Run error", error);
    } finally {
      setRunning(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await axios.delete("/api/seo-audit/clear");
      message.success("Audit history cleared");
      fetchAudits();
    } catch (error) {
      message.error("Failed to clear history");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Processing...";
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "Processing...";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 border-green-500';
    if (score >= 70) return 'text-[#ffd333] border-[#ffd333]';
    return 'text-red-500 border-red-500';
  };
  
  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 70) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  // Get current date string
  const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  const todayString = new Date().toLocaleDateString('en-US', dateOptions).replace(/,/g, '');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Widget */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#fff9e6] text-[#e69b00] flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Audit Reports</h2>
            <p className="text-gray-500 text-sm">SEO crawl history and issue tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 text-sm font-medium">
            {todayString}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-1">
        <div className="text-sm text-gray-500">
          {activeAudit ? `Last run: ${formatDate(activeAudit.completedAt)}` : 'No audits found.'}
        </div>
        <div className="flex gap-3">
          <Popconfirm
            title="Are you sure to clear all audit history?"
            onConfirm={handleClearHistory}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button 
              className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 font-medium h-9 flex items-center gap-2"
            >
              <Trash2 size={16} /> Clear History
            </Button>
          </Popconfirm>
          <Button 
            className="bg-[#ffd333] hover:bg-[#edc32f] text-[#1a1a1a] border-none font-medium h-9 px-5 flex items-center gap-2 shadow-sm"
            onClick={handleRunAudit}
            loading={running}
          >
            <Play size={16} fill="currentColor" /> Run New Audit
          </Button>
        </div>
      </div>

      {loading && !activeAudit ? (
        <div className="flex justify-center p-12"><Spin size="large" /></div>
      ) : audits.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Activity size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Audits Found</h3>
          <p className="text-gray-500 mb-6">Run your first SEO audit to see the health of your website.</p>
          <Button 
            className="bg-[#ffd333] hover:bg-[#edc32f] text-[#1a1a1a] border-none font-medium h-10 px-6 rounded-lg"
            onClick={handleRunAudit}
          >
            Run New Audit
          </Button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - History */}
          <div className="w-full lg:w-1/4">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 px-1">Audit History</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[600px] overflow-y-auto">
              {audits.map((audit) => {
                const isActive = activeAudit && activeAudit._id === audit._id;
                return (
                  <div 
                    key={audit._id}
                    onClick={() => setActiveAudit(audit)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex items-center gap-4 ${isActive ? 'bg-orange-50/50 border-r-4 border-r-[#ffd333]' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg border-2 ${getScoreColor(audit.overallScore)} ${isActive ? 'bg-white' : 'bg-transparent'}`}>
                      {audit.overallScore}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{formatShortDate(audit.createdAt)}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{audit.errorsFound} errors • {audit.warningsFound} warnings</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Content */}
          <div className="w-full lg:w-3/4">
            {activeAudit && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                
                {/* Stats Row */}
                <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
                  <div className="w-full md:w-1/4 flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center flex-col bg-white ${getScoreColor(activeAudit.overallScore)}`}>
                      <span className="text-2xl font-bold leading-none">{activeAudit.overallScore}</span>
                      <span className="text-[10px] text-gray-400">/100</span>
                    </div>
                    <span className="text-xs font-bold text-[#e69b00] uppercase mt-3 text-center">
                      {activeAudit.overallScore >= 90 ? 'Excellent' : activeAudit.overallScore >= 70 ? 'Needs Improvement' : 'Poor'}
                    </span>
                  </div>
                  
                  <div className="w-full md:w-3/4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border border-gray-100 rounded-xl flex flex-col items-center justify-center p-4">
                      <CheckCircle2 className="text-green-500 mb-2" size={24} />
                      <span className="text-2xl font-bold text-gray-800">{activeAudit.pagesCrawled}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Pages Crawled</span>
                    </div>
                    <div className="border border-gray-100 rounded-xl flex flex-col items-center justify-center p-4">
                      <AlertCircle className="text-red-500 mb-2" size={24} />
                      <span className="text-2xl font-bold text-gray-800">{activeAudit.errorsFound}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Errors Found</span>
                    </div>
                    <div className="border border-gray-100 rounded-xl flex flex-col items-center justify-center p-4">
                      <AlertTriangle className="text-[#ffd333] mb-2" size={24} />
                      <span className="text-2xl font-bold text-gray-800">{activeAudit.warningsFound}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Warnings</span>
                    </div>
                    <div className="border border-gray-100 rounded-xl flex flex-col items-center justify-center p-4">
                      <Info className="text-blue-500 mb-2" size={24} />
                      <span className="text-2xl font-bold text-gray-800">{activeAudit.infoFound}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Info</span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex gap-6 text-xs text-gray-400 mb-8 border-b border-gray-100 pb-6 px-2">
                  <div className="flex items-center gap-1.5"><Calendar size={14}/> Started {formatDate(activeAudit.startedAt)}</div>
                  <div className="flex items-center gap-1.5"><Calendar size={14}/> Completed {formatDate(activeAudit.completedAt)}</div>
                </div>

                {/* Page Results */}
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity size={18} /> Page Results ({activeAudit.pageResults ? activeAudit.pageResults.length : 0})
                </h3>
                
                <div className="space-y-4">
                  {activeAudit.pageResults && activeAudit.pageResults.map((page, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="p-4 bg-white flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 flex items-center justify-center font-bold text-lg rounded-lg border ${getScoreBg(page.score)}`}>
                            {page.score}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{page.name}</h4>
                            <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-blue-500 truncate max-w-xs block">
                              {page.url}
                            </a>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500 leading-relaxed">
                          <div><span className="font-bold text-gray-700">{page.errorCount}</span> errors</div>
                          <div><span className="font-bold text-gray-700">{page.warningCount}</span> warnings</div>
                          <div><span className="font-bold text-gray-700">{page.infoCount}</span> infos</div>
                        </div>
                      </div>
                      
                      {/* Issues Dropdown list if issues > 0 */}
                      {page.issues && page.issues.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-100 p-4 space-y-2">
                          {page.issues.map((issue, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border text-sm flex justify-between items-center ${
                              issue.type === 'ERROR' ? 'bg-red-50 border-red-100 text-red-800' :
                              issue.type === 'WARNING' ? 'bg-[#fff9e6] border-[#ffe699] text-[#b37700]' :
                              'bg-blue-50 border-blue-100 text-blue-800'
                            }`}>
                              <div className="flex items-center gap-2">
                                {issue.type === 'ERROR' ? <AlertCircle size={16} className="text-red-500"/> :
                                 issue.type === 'WARNING' ? <AlertTriangle size={16} className="text-[#e69b00]"/> :
                                 <Info size={16} className="text-blue-500"/>}
                                <span className="font-medium text-xs text-gray-500 mr-2 uppercase tracking-wide">SEO ISSUE</span>
                                {issue.message}
                              </div>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                issue.type === 'ERROR' ? 'bg-red-200 text-red-700' :
                                issue.type === 'WARNING' ? 'bg-[#ffe699] text-[#b37700]' :
                                'bg-blue-200 text-blue-700'
                              }`}>{issue.type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {(!activeAudit.pageResults || activeAudit.pageResults.length === 0) && (
                    <div className="text-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                      Processing results or no pages audited yet...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditReports;
