// src/services/analyticsService.js

// Create this new file for handling analytics
import axios from 'axios';
import {postUserTrackEvent, postUserBatchTrackEvent} from '../Unfluke_helpers/backend_helper'
// Base URL for your API
const API_URL = process.env.REACT_APP_API_URL || '';

class AnalyticsService {
  constructor() {
    this.queue = [];
    this.flushInterval = 10000; // Flush every 10 seconds
    this.anonymousId = this.getAnonymousId();
    this.setupFlushInterval();
  }

  // Get or create anonymous ID for users not logged in
  getAnonymousId() {
    let anonymousId = localStorage.getItem('anonymousId');
    if (!anonymousId) {
      anonymousId = 'anon_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('anonymousId', anonymousId);
    }
    return anonymousId;
  }

  // Setup interval to regularly send queued events
  setupFlushInterval() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  // Track an event
  track(eventType, eventData = {}) {
    const userId = JSON.parse(localStorage.getItem('authUser'))?._id; // Get from auth if available

    const event = {
      type: eventType,
      userID: userId || null,
      anonymousId: this.anonymousId,
      path: window.location.pathname,
      data: eventData,
      timestamp: new Date().toISOString()
    };

    // Add to queue for batch processing
    this.queue.push(event);

    // If queue reaches threshold, flush immediately
    if (this.queue.length >= 10) {
      this.flush();
    }

    // Also send to Google Analytics if available
    if (window.ReactGA) {
      window.ReactGA.event({
        category: 'User',
        action: eventType,
        ...eventData
      });
    }
  }

  // Send page view event
  pageView(path) {
    this.track('page_view', { path });
  }

  // Flush the queue and send events to the server
  async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      if (events.length === 1) {
        await postUserTrackEvent(events[0]);
      } else {
        await postUserBatchTrackEvent({ events });
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Put events back in queue for retry
      this.queue = [...events, ...this.queue];
    }
  }
}

export default new AnalyticsService();
