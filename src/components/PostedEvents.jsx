import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const PostedEvent = () => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: ''
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const user = JSON.parse(localStorage.getItem('alumniUser'));
      if (!user || !user.id) {
        toast.error("User is not logged in or the user ID is invalid.");
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        toast.error("Failed to load events: " + error.message);
      } else {
        setEvents(data);
      }
    };

    fetchEvents();
  }, []);

  const handleEditClick = (event) => {
    setEditingEvent(event);
    setNewEventData({
      title: event.title,
      description: event.description,
      location: event.location,
      event_date: event.event_date
    });
  };

  const handleInputChange = (e) => {
    setNewEventData({
      ...newEventData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveChanges = async () => {
    if (!editingEvent) return;

    const { error } = await supabase
      .from('events')
      .update({
        title: newEventData.title,
        description: newEventData.description,
        location: newEventData.location,
        event_date: newEventData.event_date
      })
      .eq('id', editingEvent.id);

    if (error) {
      toast.error("Failed to update event: " + error.message);
    } else {
      toast.success("Event updated successfully!");
      setEditingEvent(null);
      setEvents((prevEvents) =>
        prevEvents.map(event =>
          event.id === editingEvent.id ? { ...event, ...newEventData } : event
        )
      );
    }
  };

  const handleCancelEdit = () => setEditingEvent(null);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete event: " + error.message);
    } else {
      toast.success("Event deleted successfully!");
      setEvents(events.filter((event) => event.id !== id));
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 sm:p-10 my-10">
      <h2 className="text-3xl font-extrabold text-indigo-700 mb-8 border-b border-indigo-200 pb-3 text-center">
        Your Posted Events
      </h2>

      {editingEvent ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-8">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-2">
            Edit Event
          </h3>
          <p className="text-gray-500 mb-6 border-b pb-4">
            Update your event details below.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Event Title</label>
              <input
                type="text"
                name="title"
                value={newEventData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={newEventData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-3 h-28 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Describe the event"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={newEventData.location}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. New York, NY"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Event Date & Time</label>
              <input
                type="datetime-local"
                name="event_date"
                value={newEventData.event_date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={handleCancelEdit}
              className="bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <ul className="space-y-8">
          {events.length === 0 ? (
            <p className="text-gray-600 text-center italic">No events posted yet.</p>
          ) : (
            events.map((event) => (
              <li
                key={event.id}
                className="border rounded-lg p-6 hover:shadow-xl transition-all duration-300 bg-white cursor-pointer max-h-[300px] flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <h3 className="text-2xl font-semibold text-indigo-800">{event.title}</h3>
                  <div className="mt-2 sm:mt-0 p-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium text-sm w-max">
                    {formatDate(event.event_date)}
                  </div>
                </div>

                {event.location && (
                  <p className="mt-2 text-gray-600 italic text-sm">📍 {event.location}</p>
                )}

                <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line text-sm overflow-hidden text-ellipsis max-h-16">
                  {event.description || "No description provided."}
                </p>

                <div className="flex justify-end mt-5 gap-4">
                  <button
                    onClick={() => handleEditClick(event)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default PostedEvent;
