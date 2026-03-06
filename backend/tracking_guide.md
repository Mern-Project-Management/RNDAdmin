# Tracking API Documentation & Postman Guide

This guide explains how to use and test the tracking system.

## Database Information
- **Type**: MongoDB Atlas
- **Cluster**: `userinfo.lmbsytd.mongodb.net`
- **Database Name**: `RNDNext`
- **Collection**: `clickevents`

---

## Postman Testing Guide

### 1. Track a New Event (POST)
Capture a user interaction (page view or click).

- **URL**: `http://localhost:3030/api/tracking/track-event` (Adjust port if needed)
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body** (JSON):
```json
{
    "eventType": "click",
    "userId": "user_123456",
    "sessionId": "session_7890",
    "ipAddress": "1.2.3.4",
    "page": "/home",
    "buttonName": "Submit Inquiry",
    "userAgent": "PostmanRuntime/7.29.2",
    "referrer": "https://google.com"
}
```

### 2. Get All Tracking Data (GET)
Retrieve the list of all tracked events with pagination.

- **URL**: `http://localhost:3030/api/tracking/events?page=1&limit=10`
- **Method**: `GET`

### 3. Get Analytics (GET)
Get summarized data (total events, unique users, page breakdowns, etc.).

- **URL**: `http://localhost:3030/api/tracking/analytics`
- **Method**: `GET`

### 4. Delete an Event (DELETE)
Remove an event record by its ID.

- **URL**: `http://localhost:3030/api/tracking/delete?id=EVENT_ID_HERE`
- **Method**: `DELETE`

---

## Important Note on "Repetition"
If you send the exact same `POST` payload multiple times (same `userId`, `sessionId`, `page`, and `buttonName`), the API will **not** create a new row. Instead, it will increment the `repetitionCount` of the existing record to keep your database clean.
