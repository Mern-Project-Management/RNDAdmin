import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import NotificationsDropdown from '@/navbar/NotificationDropdown';
import UserInfoDropdown from '@/navbar/UserInfoDropdown';
import ProfileDetailsModal from '@/navbar/ProfileDetail';
import EditProfileModal from '@/navbar/EditProfileModal';
import {
    useGetAdminProfileQuery,
    useUpdateAdminProfileMutation,
} from '@/slice/login/adminlogin';
import { useGetTodayNotificationsQuery } from '@/slice/notification/notification';

const Navbar = () => {
    const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileDetailsOpen, setIsProfileDetailsOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [editedUserData, setEditedUserData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        photo: '',
    });

    // Fetch admin profile
    const { data: adminProfile, error, isLoading } = useGetAdminProfileQuery();
    const [updateAdminProfile] = useUpdateAdminProfileMutation();

    // Fetch today's aggregated notifications
    const { data: notificationsData, isLoading: isMessagesLoading } = useGetTodayNotificationsQuery();

    useEffect(() => {
        if (adminProfile) {
            setEditedUserData(adminProfile.admin);
        }
    }, [adminProfile]);

    const unreadCount = notificationsData?.data?.filter(n => !n.isRead).length || 0;

    const toggleUserInfo = () => {
        setIsUserInfoOpen(!isUserInfoOpen);
        setIsNotificationsOpen(false);
        setIsProfileDetailsOpen(false);
    };

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
        setIsUserInfoOpen(false);
        setIsProfileDetailsOpen(false);
    };

    const openProfileDetails = () => {
        setIsProfileDetailsOpen(true);
        setIsUserInfoOpen(false);
        setIsNotificationsOpen(false);
    };

    const handleEditProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('firstname', editedUserData.firstname);
        formData.append('lastname', editedUserData.lastname);
        formData.append('email', editedUserData.email);

        if (editedUserData.photo instanceof File) {
            formData.append('photo', editedUserData.photo);
        }

        try {
            await updateAdminProfile(formData);
            setIsEditProfileOpen(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const admin = adminProfile?.admin;
    
    // Format username logic
    const getUsername = () => {
        if (!admin) return '';
        const fullName = [admin.firstname, admin.lastname].filter(Boolean).join(' ').trim();
        if (fullName) return fullName;
        if (admin.username) return admin.username;
        if (admin.email) {
            const prefix = admin.email.split('@')[0];
            return prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
        return 'Admin';
    };

    const username = getUsername();

    return (
        <>
            <nav className="bg-[#ffcc00] flex items-center justify-between text-[#1a1a1a] relative px-4 py-0.5 h-9 border-b border-yellow-500/20">
                <SidebarTrigger className="h-7 w-7" />
                <div className="flex w-full items-center justify-end space-x-3">
                    <NotificationsDropdown
                        notifications={notificationsData?.data || []}
                        unreadCount={unreadCount}
                        isNotificationsOpen={isNotificationsOpen}
                        toggleNotifications={toggleNotifications}
                        setIsNotificationsOpen={setIsNotificationsOpen}
                    />

                    {isLoading ? (
                        <div className="h-4 w-20 bg-yellow-400/60 animate-pulse rounded"></div>
                    ) : username ? (
                        <div className="flex items-center gap-1.5 text-right hidden sm:flex">
                            <span className="text-gray-900 font-bold text-xs">
                                {username}
                            </span>
                        </div>
                    ) : null}

                    {isLoading ? (
                        <div className="w-6 h-6 rounded-full bg-yellow-400/60 animate-pulse"></div>
                    ) : (
                        <UserInfoDropdown
                            userData={adminProfile || {}}
                            isUserInfoOpen={isUserInfoOpen}
                            toggleUserInfo={toggleUserInfo}
                            openProfileDetails={openProfileDetails}
                            setIsEditProfileOpen={setIsEditProfileOpen}
                        />
                    )}

                    {isProfileDetailsOpen && adminProfile && (
                        <ProfileDetailsModal
                            userData={adminProfile}
                            setIsProfileDetailsOpen={setIsProfileDetailsOpen}
                        />
                    )}
                </div>
            </nav>

            <EditProfileModal
                isEditProfileOpen={isEditProfileOpen}
                setIsEditProfileOpen={setIsEditProfileOpen}
                editedUserData={editedUserData}
                setEditedUserData={setEditedUserData}
                handleEditProfile={handleEditProfile}
            />
        </>
    );
};

export default Navbar;



