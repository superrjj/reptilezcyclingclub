import React, { useState, useEffect } from 'react';
import { getEvents } from '../../services/eventsService';
import { useTabVisibility } from '../../hooks/useTabVisibility';
import { usePageMeta } from '../../hooks/usePageMeta';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-refresh when tab becomes visible
  useTabVisibility(fetchEvents);
  usePageMeta('Events');

  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedEvent]);

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

  const isUpcoming = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    return event >= today;
  };

  const isPast = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    return event < today;
  };

  // Separate events into upcoming and past
  const upcomingEvents = events.filter(e => isUpcoming(e.event_date));
  const pastEvents = events.filter(e => isPast(e.event_date));

  return (
    <>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <h1 className="text-gray-900 text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Upcoming Events</h1>
          <p className="text-gray-600 text-sm sm:text-base font-normal leading-normal">
            Join us for our next cycling adventures and community gatherings.
          </p>
        </div>

        {/* Upcoming Events */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white border border-reptilez-green-200 rounded-xl overflow-hidden shadow-sm">
                <div className="h-48 bg-reptilez-green-50 shimmer-bg" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded-full shimmer-bg" />
                  <div className="h-4 w-1/2 rounded-full shimmer-bg" />
                  <div className="h-4 w-2/3 rounded-full shimmer-bg" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-600 bg-white rounded-xl border border-reptilez-green-100 p-8">
            <span className="material-symbols-outlined text-6xl text-reptilez-green-300 mb-4 block">event_busy</span>
            <p className="text-lg">No upcoming events scheduled.</p>
            <p className="text-sm mt-2">Check back soon for new events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-reptilez-green-200 rounded-xl overflow-hidden hover:border-reptilez-green-400 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                onClick={() => setSelectedEvent(event)}
              >
                {/* Event Image */}
                <div className="relative h-60 bg-gradient-to-br from-reptilez-green-50 to-reptilez-green-100 overflow-hidden">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-reptilez-green-300">event</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-reptilez-green-600 text-white">
                      Upcoming
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-4 flex flex-col gap-3">
                  <h3 className="text-gray-900 text-lg font-bold line-clamp-2 group-hover:text-reptilez-green-700 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-reptilez-green-600 text-base">calendar_today</span>
                      <p className="text-gray-600">
                        {event.event_end_date
                          ? `${formatDate(event.event_date)} - ${formatDate(event.event_end_date)}`
                          : formatDate(event.event_date)}
                      </p>
                    </div>
                    {event.event_time && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-reptilez-green-600 text-base">schedule</span>
                        <p className="text-gray-600">{formatTime(event.event_time)}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-reptilez-green-600 text-base">location_on</span>
                      <p className="text-gray-600 line-clamp-1">{event.location}</p>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                      {event.description}
                    </p>
                  )}

                  <button className="mt-2 w-full py-2 px-4 bg-reptilez-green-600 text-white border border-reptilez-green-600 rounded-lg text-sm font-semibold hover:bg-reptilez-green-700 hover:border-reptilez-green-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past Events Section */}
        {!loading && pastEvents.length > 0 && (
          <>
            <div className="mt-12 pt-8 border-t border-reptilez-green-200">
              <h2 className="text-gray-900 text-3xl font-black leading-tight tracking-[-0.033em] mb-6">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {pastEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white border border-reptilez-green-100 rounded-xl overflow-hidden hover:border-reptilez-green-300 transition-all cursor-pointer group opacity-75 shadow-sm"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Event Image */}
                    <div className="relative h-60 bg-gradient-to-br from-reptilez-green-50 to-reptilez-green-100 overflow-hidden">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-reptilez-green-200">event</span>
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="p-4 flex flex-col gap-3">
                      <h3 className="text-gray-700 text-lg font-bold line-clamp-2">
                        {event.title}
                      </h3>
                      
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-reptilez-green-500 text-base">calendar_today</span>
                          <p className="text-gray-500">
                            {event.event_end_date
                              ? `${formatDate(event.event_date)} - ${formatDate(event.event_end_date)}`
                              : formatDate(event.event_date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-reptilez-green-500 text-base">location_on</span>
                          <p className="text-gray-500 line-clamp-1">{event.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-reptilez-green-200 bg-white p-6 shadow-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {selectedEvent.image_url && (
              <div className="mb-6 rounded-lg overflow-hidden border border-reptilez-green-100">
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  className="w-full h-96 object-contain bg-reptilez-green-50"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-gray-900 text-xl font-bold mb-2">{selectedEvent.title}</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-reptilez-green-600 text-xl mt-0.5">calendar_today</span>
                  <div>
                    <p className="text-gray-600 text-sm">Date</p>
                    <p className="text-gray-900 font-medium">
                      {selectedEvent.event_end_date
                        ? `${formatDate(selectedEvent.event_date)} - ${formatDate(selectedEvent.event_end_date)}`
                        : formatDate(selectedEvent.event_date)}
                    </p>
                  </div>
                </div>

                {selectedEvent.event_time && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-reptilez-green-600 text-xl mt-0.5">schedule</span>
                    <div>
                      <p className="text-gray-600 text-sm">Time</p>
                      <p className="text-gray-900 font-medium">{formatTime(selectedEvent.event_time)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-reptilez-green-600 text-xl mt-0.5">location_on</span>
                  <div>
                    <p className="text-gray-600 text-sm">Location</p>
                    <p className="text-gray-900 font-medium">{selectedEvent.location}</p>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-reptilez-green-600 text-xl mt-0.5">description</span>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Description</p>
                      <p className="text-gray-700 whitespace-pre-line">{selectedEvent.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventsPage;

