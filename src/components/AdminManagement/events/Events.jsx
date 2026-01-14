import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../AdminLayout';
import { getEvents, searchEvents, createEvent, updateEvent, deleteEvent } from '../../../services/eventsService';
import { uploadImage } from '../../../services/imageUploadService';
import { useTabVisibility } from '../../../hooks/useTabVisibility';

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ visible: false, type: '', message: '' });
  const [formData, setFormData] = useState({
    title: '',
    eventDate: '',
    eventEndDate: '',  
    eventTime: '',
    isTimeTBA: false, 
    location: '',
    picture: null,
    picturePreview: null,
    description: ''
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const searchQueryRef = useRef('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let data;
      const query = searchQueryRef.current;
      if (query) {
        data = await searchEvents(query);
      } else {
        data = await getEvents();
      }
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchQueryRef.current = searchQuery;
    fetchEvents();
  }, [searchQuery]);

  // Auto-refresh when tab becomes visible
  useTabVisibility(fetchEvents);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        picture: file,
        picturePreview: URL.createObjectURL(file)
      }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      picture: null,
      picturePreview: null
    }));
  };

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Check for TBA time (00:00 or 00:00:00)
    if (timeString === '00:00' || timeString === '00:00:00' || timeString.startsWith('00:00')) {
      return 'TBA';
    }
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showToast('error', 'Please enter an event title');
      return;
    }

    if (!formData.eventDate) {
      showToast('error', 'Please select an event date');
      return;
    }

    // Validate that date is not in the past (only for new events, allow past dates when editing)
    if (!editingEvent) {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
    
      if (selectedDate < today) {
        showToast('error', 'Please select a future date. Past dates are not allowed for new events.');
        return;
      }
    }
    
    // Validate date range kung may end date
    if (formData.eventEndDate) {
      const start = new Date(formData.eventDate);
      const end = new Date(formData.eventEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
    
      if (end < start) {
        showToast('error', 'End date cannot be before start date.');
        return;
      }
    }
    
    if (!formData.location.trim()) {
      showToast('error', 'Please enter a location');
      return;
    }

    setUploading(true);
    
    try {
      let imageUrl = null;

      // Upload image if a new file is selected
      if (formData.picture) {
        try {
          imageUrl = await uploadImage(formData.picture, 'events');
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          showToast('error', 'Error uploading image. Please try again.');
          setUploading(false);
          return;
        }
      }

      const eventData = {
        title: formData.title.trim(),
        event_date: formData.eventDate,
        event_end_date: formData.eventEndDate || null,                           
        event_time: formData.isTimeTBA ? '00:00' : (formData.eventTime || null),  
        location: formData.location.trim(),
        image_url: imageUrl,
        description: formData.description.trim() || null
      };

      if (editingEvent) {
        // Update existing event
        await updateEvent(editingEvent.id, {
          ...eventData,
          image_url: imageUrl || editingEvent.image_url
        });
        showToast('success', 'Event updated successfully!');
      } else {
        // Create new event
        await createEvent(eventData);
        showToast('success', 'Event added successfully!');
      }
      
      // Refresh events list
      const data = await getEvents();
      setEvents(data || []);
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error?.message || 'Error creating event. Please try again.';
      showToast('error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      eventDate: '',
      eventEndDate: '', 
      eventTime: '',
      isTimeTBA: false,
      location: '',
      picture: null,
      picturePreview: null,
      description: ''
    });
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    // Check if time is TBA (00:00 or 00:00:00)
    const isTBA = event.event_time === '00:00' || event.event_time === '00:00:00' || 
                  (event.event_time && event.event_time.startsWith('00:00'));
    
    setFormData({
      title: event.title || '',
      eventDate: event.event_date || '',
      eventEndDate: event.event_end_date || '',                        
      eventTime: isTBA ? '' : (event.event_time || ''),                                                          
      isTimeTBA: isTBA,                        
      location: event.location || '',
      picture: null,
      picturePreview: event.image_url || null,
      description: event.description || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (event) => {
    setDeleteTarget(event);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteEvent(deleteTarget.id);
      const data = await getEvents();
      setEvents(data || []);
      showToast('success', 'Event deleted successfully!');
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('error', 'Error deleting event. Please try again.');
    }
  };

  const filteredEvents = events.filter(event => {
    if (!event || !event.title) return false;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const isUpcoming = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    return event >= today;
  };

  return (
    <AdminLayout>
      {/* Toast Notification */}
      {toast.visible && (
        <div
            className={`fixed right-4 md:right-6 top-20 z-50 flex items-center gap-3 rounded-lg border px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold shadow-lg ${
            toast.type === 'success'
              ? 'border-green-400/60 bg-green-500/10 text-green-700 dark:text-green-200'
              : 'border-red-400/60 bg-red-500/10 text-red-700 dark:text-red-200'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p>{toast.message}</p>
        </div>
      )}

      <main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background-light dark:bg-background-dark pb-4 md:pb-6 mb-4 md:mb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between items-start sm:items-center gap-3 md:gap-4">
                <h1 className="text-gray-900 dark:text-white text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">Event Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-48 md:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">search</span>
                    <input
                      className="w-full h-10 px-10 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm focus:ring-primary focus:border-primary"
                      placeholder="Search events..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-gray-900 dark:text-[#1e2210] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-600 transition-colors"
                  >
                    <span className="truncate">Add New Event</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal">Total Events</p>
                <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">{events.length}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal">Upcoming Events</p>
                <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                  {events.filter(e => isUpcoming(e.event_date)).length}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((skeleton) => (
                  <div key={skeleton} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 shimmer-bg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 w-3/4 rounded-full shimmer-bg" />
                      <div className="h-4 w-1/2 rounded-full shimmer-bg" />
                      <div className="h-4 w-2/3 rounded-full shimmer-bg" />
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-800 p-2 flex items-center justify-end">
                      <div className="flex gap-1">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <div className="w-5 h-5 rounded shimmer-bg" />
                        </div>
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <div className="w-5 h-5 rounded shimmer-bg" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No events found matching your search.' : 'No events found.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Event Image */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-primary/30">event</span>
                        </div>
                      )}
                      {isUpcoming(event.event_date) && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/90 text-gray-900">
                            Upcoming
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-grow p-4 flex flex-col gap-3">
                      <h3 className="text-gray-900 dark:text-white text-lg font-bold line-clamp-2">
                        {event.title}
                      </h3>
                      
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-primary text-base mt-0.5">calendar_today</span>
                          <div className="flex-1">
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              {event.event_end_date
                                ? `${formatDate(event.event_date)} - ${formatDate(event.event_end_date)}`
                                : formatDate(event.event_date)}
                            </p>
                            {event.event_time && (
                              <p className="text-gray-500 dark:text-gray-500 text-xs mt-0.5">
                                Time: {formatTime(event.event_time)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-primary text-base mt-0.5">location_on</span>
                          <p className="text-gray-600 dark:text-gray-400 flex-1">
                            {event.location}
                          </p>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-gray-500 dark:text-gray-500 text-sm line-clamp-2 mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-200 dark:border-gray-800 p-2 flex items-center justify-end bg-white dark:bg-gray-900/60">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(event)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add New Event Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4 py-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-background-dark/95 p-4 md:p-6 shadow-[0_40px_140px_rgba(0,0,0,0.85)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-primary mb-1">EVENT MANAGEMENT</p>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <p className="text-white/60 text-sm">
                  {editingEvent ? 'Update event information.' : 'Create a new cycling event for the club.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="text-white/60 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="title">
                  Event Title
                </label>
                <input
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900 dark:text-white"
                  id="title"
                  name="title"
                  placeholder="e.g., Larga Pilipinas"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="eventDate">
                    Start Date
                  </label>
                  <input
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900 dark:text-white"
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    min={editingEvent ? undefined : new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="eventEndDate">
                    End Date (Optional)
                  </label>
                  <input
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900 dark:text-white"
                    id="eventEndDate"
                    name="eventEndDate"
                    type="date"
                    value={formData.eventEndDate}
                    onChange={handleInputChange}
                    min={formData.eventDate || undefined}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="eventTime">
                    Event Time (Optional)
                  </label>
                  <input
                    className={`w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900 dark:text-white ${formData.isTimeTBA ? 'opacity-50 cursor-not-allowed' : ''}`}
                    id="eventTime"
                    name="eventTime"
                    type="time"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    disabled={formData.isTimeTBA}
                    placeholder={formData.isTimeTBA ? 'TBA' : ''}
                  />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary transition-colors">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.isTimeTBA}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            isTimeTBA: e.target.checked,
                            eventTime: e.target.checked ? '' : prev.eventTime
                          }))
                        }
                      />
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                        formData.isTimeTBA 
                          ? 'bg-primary border-primary' 
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                      }`}>
                        {formData.isTimeTBA && (
                          <span className="material-symbols-outlined text-white text-sm">check</span>
                        )}
                      </div>
                    </div>
                    <span className="select-none">Time TBA (To Be Announced)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="location">
                  Location
                </label>
                <input
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900 dark:text-white"
                  id="location"
                  name="location"
                  placeholder="e.g., Nampicuan, Nueva Ecija"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Picture</label>
                {formData.picturePreview ? (
                  <div className="relative mt-1 overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
                    <img
                      src={formData.picturePreview}
                      alt="Preview"
                      className="h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-3 top-3 rounded-full bg-red-500 p-2 text-white shadow-md hover:bg-red-600"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                ) : (
                  <div
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
                    onClick={() => document.getElementById('event-picture').click()}
                  >
                    <div className="space-y-1 text-center">
                      <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500">upload_file</span>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <p>Click to upload or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">JPG/PNG, max 30MB</p>
                    </div>
                  </div>
                )}
                <input
                  id="event-picture"
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900 dark:text-white resize-none"
                  id="description"
                  name="description"
                  placeholder="Add event details, route information, or special notes..."
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-gray-900 dark:text-[#1e2210] font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                      {editingEvent ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingEvent ? 'Update Event' : 'Add Event'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-background-dark/95 px-6 py-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.85)]">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full border border-red-400/60 bg-red-500/15 text-red-400">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Delete event?</p>
                <p className="text-xs text-white/60">
                  This action cannot be undone. The event will be permanently removed.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-white/20 px-4 py-2 text-white/80 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 transition-colors"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Events;
