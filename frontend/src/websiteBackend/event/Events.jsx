import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, message } from 'antd';
import JoditEditor from 'jodit-react';

const EventForm = () => {
  const [form] = Form.useForm();
  const [events, setEvents] = useState('');
  const [eventId, setEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const editorRef = useRef(null);
   
  const config = {
    uploader: { insertImageAsBase64URI: true },
    toolbarAdaptive: false,
    toolbarSticky: false,
    buttons: [
      'bold',
      'italic',
      'underline',
      'ul',
      'ol',
      'fontsize',
      'paragraph',
      'link',
      'image',
      'video',
      'table',
      'align',
      'undo',
      'redo',
    ],
  };

  const fetchEvent = async () => {
    try {
      setLoading(true);
      // Add timestamp to prevent caching
      const response = await axios.get(`/api/events/getEvent?t=${new Date().getTime()}`);
      const eventData = response.data[0];
      setEventId(eventData._id);
      setEvents(eventData.events);
      form.setFieldsValue({ events: eventData.events });
    } catch (error) {
      console.error('Failed to fetch event:', error);
      message.error('Failed to fetch event.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [form]); // Keep form in dependencies

  const onFinish = async () => {
    try {
      if (!eventId) {
        message.error('No event ID available');
        return;
      }

      setLoading(true);
      await axios.put(`/api/events/editEvent/${eventId}`, {
        events: events,
      });
      message.success('Event updated successfully!');
      
      // Refetch data after successful update
      await fetchEvent();
    } catch (error) {
      console.error('Failed to update event:', error);
      message.error('Failed to update event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form 
      form={form} 
      layout="vertical" 
      onFinish={onFinish}
      name="event_form"
    >
      <Form.Item
        name="events"
        label="Event Description"
        rules={[{ required: true, message: 'Please input the event details!' }]}
      >
        <JoditEditor 
          ref={editorRef} 
          value={events} 
          config={config} 
          onChange={(newContent) => {
            setEvents(newContent);
            form.setFieldsValue({ events: newContent });
          }}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Update Event
        </Button>
        <Button 
          onClick={fetchEvent} 
         className="ml-2"
          loading={loading}
        >
          Refresh Data
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EventForm;
