const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification');

router.get('/getToday', notificationController.getTodayNotifications);
router.put('/markAsRead', notificationController.markAsRead);
router.post('/delete', notificationController.deleteNotification); // Uses POST to easily pass {id, type} from body

module.exports = router;
