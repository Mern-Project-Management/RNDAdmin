import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useGetMessagesQuery, useUpdateMessageMutation, useDeleteMessageMutation } from '@/slice/followUp/followUp';
import { FaEdit, FaTrashAlt } from "react-icons/fa";

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
                                <div className="absolute top-2 right-2 flex gap-3 z-10 items-center">
                                    <button 
                                        onClick={() => startEditing(item._id, item.message)}
                                        className="text-green-500 hover:text-green-700 transition-colors"
                                        title="Edit Message"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item._id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Delete Follow-up"
                                    >
                                        <FaTrashAlt size={16} />
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
                                                className="text-[11px] px-2 py-1 rounded border border-gray-200 text-gray-700 bg-white outline-none focus:border-blue-500 transition-colors"
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
