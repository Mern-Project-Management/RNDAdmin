"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

export const useClickTracking = () => {
    const [sessionId, setSessionId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [clientIp, setClientIp] = useState(null);

    useEffect(() => {
        // Generate or retrieve session ID
        const sid = sessionStorage.getItem('sessionId') || `session_${Date.now()}`;
        sessionStorage.setItem('sessionId', sid);
        setSessionId(sid);

        // Get or create user ID
        const uid = localStorage.getItem('userId') || `user_${Date.now()}`;
        localStorage.setItem('userId', uid);
        setUserId(uid);

        // Fetch client IP
        const fetchClientIp = async () => {
            try {
                const response = await axios.get('https://api.ipify.org?format=json', {
                    timeout: 5000, // Set timeout to avoid long delays
                });
                setClientIp(response.data.ip);
            } catch (error) {
                console.error('Error fetching IP address:', error);
                // Fallback to 'unknown' if IP fetch fails
                setClientIp('unknown');
            }
        };

        fetchClientIp();
    }, []);

    const trackEvent = async (eventType, eventData = {}) => {
        if (!sessionId || !userId) {
            console.warn('Tracking skipped: sessionId or userId not initialized');
            return;
        }

        try {
            const referrer = typeof document !== 'undefined' ? document.referrer : '';
            const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

            const payload = {
                eventType,
                sessionId,
                userId,

                ipAddress: clientIp || 'pending', // Use 'pending' if IP is not yet fetched
                page: eventData.page || (typeof window !== 'undefined' ? window.location.pathname : ''),
                referrer,
                userAgent,
                buttonName: eventData.buttonName || null,
                productId: eventData.productId || null,
                productName: eventData.productName || null,
                metadata: {
                    ...eventData.metadata,
                    timestamp: new Date().toISOString(),
                },
            };

            const response = await fetch('/api/tracking/track-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error('Tracking error:', response.statusText);
            }
        } catch (error) {
            console.error('Tracking failed:', error);
        }
    };

    return { trackEvent, sessionId, userId, clientIp };
};
