import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUpcomingEvents } from '../../services/eventsService';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getUpcomingEvents();
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatEventDate = (event) => {
    const formattedDate = formatDate(event.event_date);
    const location = event.location || '';
    
    if (location) {
      return `${formattedDate} - ${location}`;
    }
    return formattedDate;
  };

  return (
    <>
      <section className="flex flex-col items-center gap-6 px-4 py-8">
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] sm:text-3xl">Upcoming Events</h2>
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-primary/30 rounded-lg bg-black/40 backdrop-blur-sm">
                <div className="text-center sm:text-left flex-1 space-y-2">
                  <div className="h-5 w-32 bg-primary/20 rounded shimmer-bg mx-auto sm:mx-0" />
                  <div className="h-4 w-48 bg-primary/10 rounded shimmer-bg mx-auto sm:mx-0" />
                </div>
                <div className="h-10 w-24 bg-primary/20 rounded shimmer-bg" />
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <p>No upcoming events scheduled.</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-primary/30 rounded-lg bg-black/40 backdrop-blur-sm">
                <div className="text-center sm:text-left">
                  <p className="text-white font-semibold">{event.title}</p>
                  <p className="text-white/60 text-sm">{formatEventDate(event)}</p>
                </div>
                <button 
                  onClick={() => setSelectedEvent(event)}
                  className="flex-shrink-0 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/20 text-primary border border-primary/50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary hover:text-white transition-colors"
                >
                  <span className="truncate">View Details</span>
                </button>
              </div>
            ))
          )}
        </div>
        <button 
          onClick={() => navigate('/events')}
          className="mt-4 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-green-700 transition-colors"
        >
          <span className="truncate">View All Events</span>
        </button>
      </section>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-background-dark/95 p-6 shadow-[0_40px_140px_rgba(0,0,0,0.85)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Event Details</h2>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {selectedEvent.image_url && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  className="w-full h-96 object-contain bg-black/20"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-white text-xl font-bold mb-2">{selectedEvent.title}</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">calendar_today</span>
                  <div>
                    <p className="text-white/60 text-sm">Date</p>
                    <p className="text-white font-medium">{formatDate(selectedEvent.event_date)}</p>
                  </div>
                </div>

                {selectedEvent.event_time && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">schedule</span>
                    <div>
                      <p className="text-white/60 text-sm">Time</p>
                      <p className="text-white font-medium">{formatTime(selectedEvent.event_time)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">location_on</span>
                  <div>
                    <p className="text-white/60 text-sm">Location</p>
                    <p className="text-white font-medium">{selectedEvent.location}</p>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">description</span>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Description</p>
                      <p className="text-white whitespace-pre-line">{selectedEvent.description}</p>
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

export default Events;

