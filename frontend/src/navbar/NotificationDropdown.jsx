import React, { useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

const NotificationsDropdown = ({ 
    notifications, 
    isNotificationsOpen, 
    toggleNotifications, 
    removeNotification 
}) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                toggleNotifications(false); // Close the dropdown
            }
        };

        if (isNotificationsOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isNotificationsOpen, toggleNotifications]);

    return (
        <div className="relative" ref={dropdownRef}>
            <Bell
                className="w-6 h-6 cursor-pointer"
                onClick={toggleNotifications}
            />
            {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length}
                </span>
            )}

            {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-2 z-20">
                    <div className="text-sm font-semibold text-gray-700 mb-2 border-b pb-2">
                        Notifications
                    </div>
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className="flex justify-between items-start p-2 hover:bg-gray-100 rounded border-b border-gray-50 last:border-0"
                        >
                            <div className="flex-1 pr-2">
                                <p className="text-sm text-gray-800 line-clamp-2">{notification.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <X
                                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 transition-colors mt-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification._id);
                                }}
                            />
                        </div>
                    ))}
                    {notifications.length === 0 && (
                        <div className="p-4 text-center text-gray-400 text-sm italic">
                            No new notifications
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
