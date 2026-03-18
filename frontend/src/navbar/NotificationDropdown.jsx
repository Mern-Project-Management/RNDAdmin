import React from 'react';
import { Bell, X, AlertTriangle, CheckCheck, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMarkAsReadMutation, useDeleteNotificationMutation } from '@/slice/notification/notification';

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
                                        const isLongMessage = notification.message && notification.message.length > 100;
                                        const title = notification.title;
                                        const bgColor = notification.isRead ? 'bg-white' : 'bg-orange-50/40';
                                            
                                        return (
                                            <div 
                                                key={notification._id} 
                                                className={`p-5 border-b border-gray-100 transition-colors flex gap-4 relative group hover:bg-orange-50 ${bgColor}`}
                                            >
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <AlertTriangle className={`w-5 h-5 ${notification.isRead ? 'text-gray-400' : 'text-orange-500'}`} />
                                                </div>
                                                <div className="flex-1 pr-6">
                                                    <div className="flex flex-col mb-1.5">
                                                        <h4 className={`font-semibold text-base ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{title}</h4>
                                                        {notification.inquiryEmail && (
                                                            <span className="text-xs text-blue-600 font-medium">{notification.inquiryEmail}</span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="mb-3">
                                                        <p className={`text-sm text-gray-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                                                            {notification.message}
                                                        </p>
                                                        {isLongMessage && (
                                                            <button 
                                                                onClick={() => toggleExpand(notification._id)}
                                                                className="text-[#304a8a] text-xs font-semibold mt-1 hover:underline focus:outline-none"
                                                            >
                                                                {isExpanded ? "View Less" : "View More"}
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex gap-4 text-xs font-medium">
                                                        <span className="text-gray-500">
                                                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
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
