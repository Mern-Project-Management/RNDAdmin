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
import { useGetTodayMessagesQuery, useMarkAsReadMutation } from '@/slice/followUp/followUp';

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

    // Fetch today's messages
    const { data: messagesData, isLoading: isMessagesLoading } = useGetTodayMessagesQuery();
    const [markAsRead] = useMarkAsReadMutation();

    useEffect(() => {
        if (adminProfile) {
            setEditedUserData(adminProfile.admin);
        }
    }, [adminProfile]);

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id).unwrap();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

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

    if (isLoading || isMessagesLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading profile</p>;

    return (
        <>
            <nav className="bg-[#304a8a] flex items-center justify-between text-white relative">
                <SidebarTrigger />
                <div className="flex w-full items-center justify-end space-x-8">
                    <NotificationsDropdown
                        notifications={messagesData?.data || []}
                        isNotificationsOpen={isNotificationsOpen}
                        toggleNotifications={toggleNotifications}
                        removeNotification={handleMarkAsRead}
                    />

                    {adminProfile && (
                        <p className="text-gray-300">{adminProfile.admin.email}</p>
                    )}

                    <UserInfoDropdown
                        userData={adminProfile}
                        isUserInfoOpen={isUserInfoOpen}
                        toggleUserInfo={toggleUserInfo}
                        openProfileDetails={openProfileDetails}
                        setIsEditProfileOpen={setIsEditProfileOpen}
                    />

                    {isProfileDetailsOpen && (
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
