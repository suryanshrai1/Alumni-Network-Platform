import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AddEvent = ({ eventId, onSuccess }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    location: '',
    description: '',
  });

  // Load user from localStorage and fetch event details if editing
  useEffect(() => {
    const storedUser = localStorage.getItem('alumniUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (eventId) {
          fetchEventDetails(eventId, parsedUser);
        }
      } catch (err) {
        console.error('Failed to parse user:', err);
        setUser(null);
      }
    }
  }, [eventId]);

  // Fetch event details for editing, only if user owns the event
  const fetchEventDetails = async (id, currentUser) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('title, description, location, event_date, user_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      setMessage('Failed to fetch event details.');
      setLoading(false);
      return;
    }

    if (data.user_id !== currentUser.id) {
      setMessage('You do not have permission to edit this event.');
      setLoading(false);
      return;
    }

    setFormData({
      title: data.title,
      event_date: data.event_date ? data.event_date.slice(0, 16) : '',
      location: data.location || '',
      description: data.description || '',
    });

    setLoading(false);
  };

  // Update form data on input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit new or updated event to Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!user) {
      setMessage('You must be logged in to post an event.');
      return;
    }

    if (!user.id) {
      setMessage('User ID is missing. Please log in again.');
      return;
    }

    if (!formData.title.trim() || !formData.event_date) {
      setMessage('Please fill in the required fields: Title and Event Date.');
      return;
    }

    setLoading(true);

    const eventPayload = {
      title: formData.title.trim(),
      event_date: new Date(formData.event_date).toISOString(),
      location: formData.location.trim(),
      description: formData.description.trim(),
      user_id: user.id,
    };

    try {
      let response;
      if (eventId) {
        response = await supabase
          .from('events')
          .update(eventPayload)
          .eq('id', eventId)
          .eq('user_id', user.id);
      } else {
        response = await supabase.from('events').insert(eventPayload);
      }

      if (response.error) {
        setMessage(`Error: ${response.error.message}`);
      } else {
        setMessage(eventId ? 'Event updated successfully!' : 'Event added successfully!');
        if (onSuccess) onSuccess();
        if (!eventId) {
          setFormData({ title: '', event_date: '', location: '', description: '' });
        }
      }
    } catch (err) {
      setMessage(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg text-center text-red-600 font-semibold">
        {message || 'Please log in to add or edit events.'}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-3xl font-semibold text-indigo-700 mb-8 border-b border-indigo-200 pb-3">
        {eventId ? 'Edit Event' : 'Add New Event'}
      </h2>

      {message && (
        <p
          className={`mb-6 text-center font-semibold ${
            message.toLowerCase().includes('error') ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block font-medium text-gray-700 mb-2">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Event title"
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
          />
        </div>

        <div>
          <label htmlFor="event_date" className="block font-medium text-gray-700 mb-2">
            Event Date & Time <span className="text-red-600">*</span>
          </label>
          <input
            type="datetime-local"
            id="event_date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
          />
        </div>

        <div>
          <label htmlFor="location" className="block font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Where is the event?"
            maxLength={150}
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe the event"
            maxLength={1000}
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-md transition duration-200"
        >
          {loading ? (eventId ? 'Updating...' : 'Adding...') : eventId ? 'Update Event' : 'Add Event'}
        </button>
      </form>
    </div>
  );
};

export default AddEvent;
