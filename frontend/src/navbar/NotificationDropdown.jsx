import React from 'react';
import { Bell, X, AlertTriangle, CheckCheck, Trash2, Briefcase, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMarkAsReadMutation, useDeleteNotificationMutation } from '@/slice/notification/notification';

// Helper component: renders a detail row in the expanded table
const DetailRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <tr className="border-b border-gray-100 last:border-b-0">
            <td className="py-1.5 pr-3 text-xs font-semibold text-gray-500 whitespace-nowrap align-top">{label}</td>
            <td className="py-1.5 text-xs text-gray-800 break-all">{value}</td>
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
        return (
            <table className="w-full mt-2 mb-1">
                <tbody>
                    <DetailRow label="Name" value={src.name} />
                    <DetailRow label="Email" value={src.email} />
                    <DetailRow label="Contact No" value={src.contactNo} />
                    <DetailRow label="Post Applied For" value={src.postAppliedFor} />
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
                            <DetailRow label="Client Name" value={inq.firstName || inq.name} />
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

// Badge icon based on notification type
const TypeBadge = ({ type, isRead }) => {
    if (type === 'career') return <Briefcase className={`w-5 h-5 ${isRead ? 'text-gray-400' : 'text-purple-500'}`} />;
    if (type === 'inquiry') return <Mail className={`w-5 h-5 ${isRead ? 'text-gray-400' : 'text-blue-500'}`} />;
    return <AlertTriangle className={`w-5 h-5 ${isRead ? 'text-gray-400' : 'text-orange-500'}`} />;
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
    
    // Track expanded state for individual notifications
    const [expandedNotifs, setExpandedNotifs] = React.useState({});

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
        setExpandedNotifs(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
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
                                <SheetTitle className="text-xl font-bold text-gray-800">Notifications</SheetTitle>
                                <div className="flex gap-4 mr-6">
                                    <button 
                                        onClick={handleMarkAllAsRead}
                                        className="text-[#304a8a] text-sm font-medium hover:underline flex items-center gap-1"
                                    >
                                        Mark all as read
                                    </button>
                                    <button 
                                        onClick={handleClearAll}
                                        className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm italic flex flex-col items-center justify-center h-[50vh]">
                                    <Bell className="w-12 h-12 text-gray-300 mb-4" />
                                    No new notifications
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map((notification) => {
                                        const isExpanded = expandedNotifs[notification._id];
                                        const title = notification.title;
                                        const bgColor = notification.isRead ? 'bg-white' : 'bg-orange-50/40';
                                        
                                        // Short summary line (message preview)
                                        const shortMessage = notification.message && notification.message.length > 80
                                            ? notification.message.substring(0, 80) + '...'
                                            : notification.message;
                                            
                                        return (
                                            <div 
                                                key={notification._id} 
                                                className={`p-5 border-b border-gray-100 transition-colors relative group hover:bg-orange-50 ${bgColor}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <TypeBadge type={notification.type} isRead={notification.isRead} />
                                                    </div>
                                                    <div className="flex-1 pr-6">
                                                        {/* Name + Email at top */}
                                                        <div className="flex flex-col mb-1">
                                                            <h4 className={`font-semibold text-base ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{title}</h4>
                                                            {notification.inquiryEmail && (
                                                                <span className="text-xs text-blue-600 font-medium">{notification.inquiryEmail}</span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Short message preview when collapsed */}
                                                        {!isExpanded && (
                                                            <p className="text-sm text-gray-600 leading-relaxed mb-2">{shortMessage}</p>
                                                        )}
                                                        
                                                        {/* Expanded: full detail table */}
                                                        {isExpanded && (
                                                            <div className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
                                                                <NotificationDetails notification={notification} />
                                                            </div>
                                                        )}
                                                        
                                                        {/* Footer: time + View More */}
                                                        <div className="flex items-center gap-4 text-xs font-medium">
                                                            <span className="text-gray-500">
                                                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <button 
                                                                onClick={() => toggleExpand(notification._id)}
                                                                className="text-[#304a8a] font-semibold hover:underline focus:outline-none flex items-center gap-0.5"
                                                            >
                                                                {isExpanded ? (
                                                                    <><ChevronUp className="w-3 h-3" /> View Less</>
                                                                ) : (
                                                                    <><ChevronDown className="w-3 h-3" /> View More</>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Action buttons */}
                                                {!notification.isRead && (
                                                    <button 
                                                        onClick={() => markAsRead({ id: notification._id, type: notification.type })}
                                                        title="Mark as read"
                                                        className="absolute right-4 top-4 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded p-1 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <CheckCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => deleteNotification({ id: notification._id, type: notification.type })}
                                                    title="Delete notification"
                                                    className="absolute right-4 bottom-4 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
