import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCheck, Trash2, Briefcase, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMarkAsReadMutation, useDeleteNotificationMutation } from '@/slice/notification/notification';

// Helper component: renders a detail row in the expanded table
const DetailRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <tr className="border-b border-gray-100 last:border-b-0">
            <td className="py-2 pr-1 text-[10px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap align-top w-[85px]">{label}</td>
            <td className="py-2 text-xs text-gray-800 break-all font-medium leading-relaxed">{value}</td>
        </tr>
    );
};

// Renders expanded detail table based on notification type
const NotificationDetails = ({ notification }) => {
    const src = notification.sourceData;
    if (!src) return null;

    if (notification.type === 'inquiry') {
        return (
            <table className="w-full mt-2 mb-1">
                <tbody>
                    <DetailRow label="Name" value={src.name} />
                    <DetailRow label="Email" value={src.email} />
                    <DetailRow label="Service" value={src.service || src.department || <span className="text-gray-400 italic">Not specified</span>} />
                    <DetailRow label="Phone" value={src.phone} />
                    <DetailRow label="Country" value={src.country} />
                    <DetailRow label="Source" value={src.source} />
                    <DetailRow label="Status" value={src.status} />
                    <DetailRow label="URL" value={src.url} />
                    <DetailRow label="Message" value={src.message} />
                </tbody>
            </table>
        );
    }

    if (notification.type === 'career') {
        const name = src.name || `${src.firstName || ''} ${src.lastName || ''}`.trim();
        return (
            <table className="w-full mt-2 mb-1">
                <tbody>
                    <DetailRow label="Name" value={name} />
                    <DetailRow label="Email" value={src.email} />
                    <DetailRow label="Contact No" value={src.phone || src.contactNo} />
                    <DetailRow label="Role/Post" value={src.careerTitle || src.roleApplied || src.postAppliedFor} />
                    <DetailRow label="Country" value={src.country} />
                    <DetailRow label="Experience" value={src.experience} />
                    <DetailRow label="Address" value={src.address} />
                    <DetailRow label="URL" value={src.url} />
                </tbody>
            </table>
        );
    }

    if (notification.type === 'followup') {
        const inq = src.inquiryId;
        return (
            <table className="w-full mt-2 mb-1">
                <tbody>
                    <DetailRow label="Follow Up" value={src.message} />
                    <DetailRow label="Status" value={src.status} />
                    {inq && (
                        <>
                            <DetailRow label="Client Name" value={inq.name || `${inq.firstName || ''} ${inq.lastName || ''}`.trim()} />
                            <DetailRow label="Client Email" value={inq.email} />
                            <DetailRow label="Phone" value={inq.phone} />
                            <DetailRow label="Country" value={inq.country} />
                        </>
                    )}
                </tbody>
            </table>
        );
    }

    return null;
};

// Icon based on notification type
const TypeBadge = ({ type, isRead }) => {
    if (type === 'career') return <Briefcase className={`w-5 h-5 ${isRead ? 'text-gray-400' : 'text-purple-600'}`} />;
    if (type === 'inquiry') return <Mail className={`w-5 h-5 ${isRead ? 'text-gray-400' : 'text-blue-600'}`} />;
    return <AlertTriangle className={`w-5 h-5 ${isRead ? 'text-gray-400' : 'text-orange-600'}`} />;
};

const NotificationsDropdown = ({ 
    notifications, 
    unreadCount,
    isNotificationsOpen, 
    setIsNotificationsOpen,
    toggleNotifications
}) => {
    const [markAsRead] = useMarkAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();
    
    // Track expanded state for ONLY ONE notification
    const [expandedRowId, setExpandedRowId] = useState(null);

    const handleMarkAllAsRead = async () => {
        try {
            await Promise.all(
                notifications.filter(n => !n.isRead).map((notif) => markAsRead({ id: notif._id, type: notif.type }).unwrap())
            );
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const handleClearAll = async () => {
        try {
             await Promise.all(
                notifications.map((notif) => deleteNotification({ id: notif._id, type: notif.type }).unwrap())
            );
        } catch (error) {
            console.error("Failed to clear all", error);
        }
    };
    
    const toggleExpand = (id) => {
        setExpandedRowId(prevId => prevId === id ? null : id);
    };

    return (
        <div className="relative">
            <div className="relative" onClick={toggleNotifications}>
                <Bell className="w-6 h-6 cursor-pointer hover:text-gray-200 transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </div>

            <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-white p-0 border-none shadow-xl">
                    <div className="h-full flex flex-col">
                        <SheetHeader className="p-4 py-5 border-b pr-8">
                            <div className="flex justify-between items-center">
                                <SheetTitle className="text-xl font-bold text-gray-900">Notifications</SheetTitle>
                                <div className="flex gap-4 mr-6">
                                    <button 
                                        onClick={handleMarkAllAsRead}
                                        className="text-[#304a8a] text-sm font-bold hover:underline"
                                    >
                                        Mark all as read
                                    </button>
                                    <button 
                                        onClick={handleClearAll}
                                        className="text-red-600 text-sm font-bold hover:underline"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm italic flex flex-col items-center justify-center h-[50vh]">
                                    <Bell className="w-12 h-12 text-gray-300 mb-4" />
                                    No new notifications
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map((notification) => {
                                        const isExpanded = expandedRowId === notification._id;
                                        const title = notification.title;
                                        const bgColor = notification.isRead ? 'bg-white' : 'bg-blue-50/50';
                                        
                                        return (
                                            <div 
                                                key={notification._id} 
                                                className={`p-5 border-b border-gray-100 transition-colors relative group hover:bg-gray-50 ${bgColor}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <TypeBadge type={notification.type} isRead={notification.isRead} />
                                                    </div>
                                                    <div className="flex-1 pr-10">
                                                        {/* Name + Email at top */}
                                                        <div className="flex flex-col mb-1 leading-tight">
                                                            <h4 className={`text-sm font-normal ${notification.isRead ? 'text-gray-600' : 'text-gray-950'}`}>{title}</h4>
                                                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                                {notification.inquiryEmail && (
                                                                    <span className="text-[11px] text-[#304a8a] font-semibold">{notification.inquiryEmail}</span>
                                                                )}
                                                                
                                                                {/* Service/Post Highlight - Minimalist Style */}
                                                                {notification.type === 'inquiry' && (notification.sourceData?.service || notification.sourceData?.department) && (
                                                                    <span className="text-[10px] text-gray-400 font-medium lowercase">
                                                                        • {notification.sourceData?.service || notification.sourceData?.department}
                                                                    </span>
                                                                )}
                                                                {notification.type === 'career' && (notification.sourceData?.careerTitle || notification.sourceData?.roleApplied || notification.sourceData?.postAppliedFor) && (
                                                                    <span className="text-[10px] text-gray-400 font-medium lowercase">
                                                                        • {notification.sourceData?.careerTitle || notification.sourceData?.roleApplied || notification.sourceData?.postAppliedFor}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Short message preview when collapsed */}
                                                        {!isExpanded && (
                                                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{notification.message}</p>
                                                        )}
                                                        
                                                        {/* Footer: time + View More */}
                                                        <div className="flex items-center gap-4 text-[10px] font-bold mt-2">
                                                            <span className="text-gray-400 uppercase tracking-wide">
                                                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <button 
                                                                onClick={() => toggleExpand(notification._id)}
                                                                className="text-[#304a8a] hover:underline focus:outline-none flex items-center gap-1"
                                                            >
                                                                {isExpanded ? (
                                                                    <><ChevronUp className="w-3.5 h-3.5" /> View Less</>
                                                                ) : (
                                                                    <><ChevronDown className="w-3.5 h-3.5" /> View More</>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded: full detail table (now wider) */}
                                                {isExpanded && (
                                                    <div className="bg-white rounded-lg p-3 my-3 border border-gray-200 shadow-md">
                                                        <NotificationDetails notification={notification} />
                                                    </div>
                                                )}
                                                
                                                {/* Action buttons */}
                                                <div className="absolute right-4 top-4 flex flex-col gap-2.5">
                                                    {!notification.isRead && (
                                                        <button 
                                                            onClick={() => markAsRead({ id: notification._id, type: notification.type })}
                                                            title="Mark as read"
                                                            className="text-gray-400 hover:text-green-600 transition-all p-1 hover:bg-green-50 rounded"
                                                        >
                                                            <CheckCheck className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => deleteNotification({ id: notification._id, type: notification.type })}
                                                        title="Delete notification"
                                                        className="text-gray-400 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default NotificationsDropdown;
