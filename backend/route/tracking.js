// routes/tracking.js
const express = require('express');
const router = express.Router();
const ClickEvent = require('../model/clickEvent');
const mongoose = require('mongoose');

// Track event
router.post('/track-event', async (req, res) => {
  try {
    const {
      eventType,
      userId,
      sessionId,
      page,
      buttonName,
      productId,
      productName,
      userAgent,
      referrer,
      metadata
    } = req.body;

    const ipAddress = req.body.ipAddress || req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    // Validate required field
    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: 'eventType is required'
      });
    }

    // Define fields to check for duplicates
    const duplicateQuery = {
      eventType,
      page: page || null,
      buttonName: buttonName || null,
      productId: productId || null,
      productName: productName || null,
      userId: userId || null,
      sessionId: sessionId || null
    };

    // Look for existing event
    const existingEvent = await ClickEvent.findOne(duplicateQuery);

    if (existingEvent) {
      // Increment repetition count for existing event
      existingEvent.repetitionCount += 1;
      existingEvent.timestamp = new Date(); // Update timestamp
      await existingEvent.save();

      return res.json({
        success: true,
        message: 'Event repetition recorded',
        eventId: existingEvent._id,
        repetitionCount: existingEvent.repetitionCount
      });
    }

    // Create new event if no duplicate found
    const event = new ClickEvent({
      eventType,
      userId,
      sessionId,
      page,
      buttonName,
      productId,
      productName,
      userAgent,
      ipAddress,
      referrer,
      metadata,
      timestamp: new Date(),
      repetitionCount: 1
    });

    // Save to database
    await event.save();

    res.json({
      success: true,
      message: 'Event tracked successfully',
      eventId: event._id,
      repetitionCount: event.repetitionCount
    });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get analytics with filtering
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate, eventType, buttonName, productName } = req.query;

    let query = {};

    // Date filtering
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Event type filtering
    if (eventType) query.eventType = eventType;

    // Button name filtering
    if (buttonName) query.buttonName = buttonName;

    // Product filtering
    if (productName) query.productName = productName;

    const events = await ClickEvent.find(query).sort({ timestamp: -1 });

    const analytics = {
      totalEvents: events.length,
      eventsByType: {},
      eventsByPage: {},
      eventsByButton: {},
      // productViews: {},
      uniqueSessions: new Set(events.map(e => e.sessionId)).size,
      uniqueUsers: new Set(events.map(e => e.userId)).size
    };

    events.forEach(event => {
      // By type
      analytics.eventsByType[event.eventType] = (analytics.eventsByType[event.eventType] || 0) + 1;

      // By page
      analytics.eventsByPage[event.page] = (analytics.eventsByPage[event.page] || 0) + 1;

      // By button
      if (event.buttonName) {
        analytics.eventsByButton[event.buttonName] = (analytics.eventsByButton[event.buttonName] || 0) + 1;
      }

      // By product
      // if (event.productName) {
      //   analytics.productViews[event.productName] = (analytics.productViews[event.productName] || 0) + 1;
      // }
    });

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all events with pagination
router.get('/events', async (req, res) => {
  try {
    const { page = 1, limit = 50, eventType, buttonName } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (eventType) query.eventType = eventType;
    if (buttonName) query.buttonName = buttonName;

    const events = await ClickEvent.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ClickEvent.countDocuments(query);

    res.json({
      events,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific button click analytics
router.get('/button-analytics/:buttonName', async (req, res) => {
  try {
    const { buttonName } = req.params;
    const { startDate, endDate } = req.query;

    let query = { buttonName };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const events = await ClickEvent.find(query).sort({ timestamp: -1 });

    const analytics = {
      buttonName,
      totalClicks: events.length,
      uniqueSessions: new Set(events.map(e => e.sessionId)).size,
      uniqueUsers: new Set(events.map(e => e.userId)).size,
      clicksByPage: {},
      recentClicks: events.slice(0, 10)
    };

    events.forEach(event => {
      analytics.clicksByPage[event.page] = (analytics.clicksByPage[event.page] || 0) + 1;
    });

    res.json(analytics);
  } catch (error) {
    console.error('Button analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product view analytics
router.get('/product-analytics/:productName', async (req, res) => {
  try {
    const { productName } = req.params;
    const { startDate, endDate } = req.query;

    let query = { productName };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const events = await ClickEvent.find(query).sort({ timestamp: -1 });

    const analytics = {
      productName,
      totalViews: events.length,
      uniqueSessions: new Set(events.map(e => e.sessionId)).size,
      uniqueUsers: new Set(events.map(e => e.userId)).size,
      eventTypes: {},
      recentViews: events.slice(0, 10)
    };

    events.forEach(event => {
      analytics.eventTypes[event.eventType] = (analytics.eventTypes[event.eventType] || 0) + 1;
    });

    res.json(analytics);
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a single event by ID
router.delete('/delete', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }

    const deletedEvent = await ClickEvent.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully',
      deletedEventId: id
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
