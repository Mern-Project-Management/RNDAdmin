import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useGetMessagesQuery, useUpdateMessageMutation, useDeleteMessageMutation } from '@/slice/followUp/followUp';

const DashboardFollowUpSidebar = () => {
    const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useGetMessagesQuery();
    const [updateMessage] = useUpdateMessageMutation();
    const [deleteMessage] = useDeleteMessageMutation();
    const [dataCount, setDataCount] = useState({ pendingFollowUpCount: 0, completedFollowUpCount: 0 });
    const [statusFilter, setStatusFilter] = useState('All');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const fetchCounts = async () => {
        try {
            const response = await axios.get('/api/count/dataCount');
            setDataCount(response.data);
        } catch (error) {
            console.error('Error fetching dashboard counts:', error);
        }
    };

    useEffect(() => {
        fetchCounts();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateMessage({ id, status: newStatus }).unwrap();
            await refetchMessages();
            await fetchCounts();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this follow-up?')) {
            try {
                await deleteMessage(id).unwrap();
                await refetchMessages();
                await fetchCounts();
            } catch (error) {
                console.error('Failed to delete follow-up:', error);
            }
        }
    };

    const startEditing = (id, currentMessage) => {
        setEditingId(id);
        setEditValue(currentMessage);
    };

    const handleUpdateMessage = async (id) => {
        try {
            await updateMessage({ id, message: editValue }).unwrap();
            setEditingId(null);
            await refetchMessages();
        } catch (error) {
            console.error('Failed to update message:', error);
        }
    };

    const allFollowUps = messages?.data || [];
    
    const filteredFollowUps = allFollowUps.filter(item => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Pending') return item.status !== 'Completed';
        if (statusFilter === 'Completed') return item.status === 'Completed';
        return true;
    });

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Status Selection Bar */}
            <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between gap-1 overflow-x-auto">
                <button 
                    onClick={() => setStatusFilter('All')}
                    className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-md transition-all whitespace-nowrap ${statusFilter === 'All' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    ALL ({allFollowUps.length})
                </button>
                <button 
                    onClick={() => setStatusFilter('Pending')}
                    className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-md transition-all whitespace-nowrap ${statusFilter === 'Pending' ? 'bg-orange-500 text-white shadow-md' : 'text-orange-600 hover:bg-orange-50'}`}
                >
                    PENDING ({dataCount?.pendingFollowUpCount || 0})
                </button>
                <button 
                    onClick={() => setStatusFilter('Completed')}
                    className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-md transition-all whitespace-nowrap ${statusFilter === 'Completed' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-600 hover:bg-emerald-50'}`}
                >
                    COMPLETED ({dataCount?.completedFollowUpCount || 0})
                </button>
            </div>

            {/* Follow-up List Section */}
            <div className="bg-white rounded-lg shadow-md flex-grow flex flex-col overflow-hidden min-h-[400px]">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Recent {statusFilter !== 'All' ? statusFilter : ''} Follow-ups</h3>
                </div>
                <div className="overflow-y-auto p-2 space-y-3 max-h-[600px]">
                    {messagesLoading ? (
                        <div className="p-4 text-center text-gray-400 italic">Syncing messages...</div>
                    ) : filteredFollowUps.length === 0 ? (
                        <div className="py-10 text-center text-gray-400">No {statusFilter.toLowerCase()} follow-ups recorded yet.</div>
                    ) : (
                        filteredFollowUps.slice(0, 10).map((item) => (
                            <div key={item._id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/30 transition-all shadow-sm relative">
                                {/* Action Buttons - Always Visible */}
                                <div className="absolute top-2 right-2 flex gap-1 z-10">
                                    <button 
                                        onClick={() => startEditing(item._id, item.message)}
                                        className="p-1.5 text-blue-600 bg-white border border-blue-100 hover:bg-blue-100 rounded transition-colors shadow-sm"
                                        title="Edit Message"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item._id)}
                                        className="p-1.5 text-red-600 bg-white border border-red-100 hover:bg-red-100 rounded transition-colors shadow-sm"
                                        title="Delete Follow-up"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>

                                <div className="flex justify-between items-start mb-1 pr-14">
                                    <span className="font-bold text-sm text-blue-700 truncate">
                                        {item.inquiryId?.name || 'Inquiry'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {new Date(item.date).toLocaleDateString()}
                                    </span>
                                </div>

                                {editingId === item._id ? (
                                    <div className="mt-2 space-y-2 bg-blue-50/50 p-2 rounded">
                                        <textarea 
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-full text-xs p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            rows="3"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => setEditingId(null)} 
                                                className="text-[10px] px-3 py-1 text-gray-500 hover:bg-gray-100 rounded font-bold"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateMessage(item._id)} 
                                                className="text-[10px] px-3 py-1 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-sm"
                                            >
                                                Save Updates
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed italic">
                                            "{item.message}"
                                        </p>
                                        <div className="mt-2 flex justify-end">
                                            <select
                                                value={item.status || "New"}
                                                onChange={(e) => handleStatusChange(item._id, e.target.value)}
                                                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border-none cursor-pointer outline-none transition-colors ${
                                                    item.status === 'Completed' 
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                }`}
                                            >
                                                <option value="New">New</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
                {filteredFollowUps.length > 10 && (
                    <div className="p-3 bg-gray-50/50 border-t text-center">
                         <button className="text-xs font-bold text-blue-600 hover:underline">View All {statusFilter !== 'All' ? statusFilter : ''}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardFollowUpSidebar;
