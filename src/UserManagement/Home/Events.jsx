import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUpcomingEvents } from '../../services/eventsService';

const Events = ({ refreshFunctionsRef }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

  useEffect(() => {
    fetchEvents();
  }, []);

  // Register refresh function
  useEffect(() => {
    if (refreshFunctionsRef?.current) {
      const index = refreshFunctionsRef.current.length;
      refreshFunctionsRef.current.push(fetchEvents);
      return () => {
        refreshFunctionsRef.current = refreshFunctionsRef.current.filter((_, i) => i !== index);
      };
    }
  }, [refreshFunctionsRef]);

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

  // Scroll-based animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      observer.disconnect();
    };
  }, []);

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
    if (timeString === '00:00' || timeString === '00:00:00' || timeString.startsWith('00:00')) {
      return 'TBA';
    }
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatEventDate = (event) => {
    const start = formatDate(event.event_date);
    const end = event.event_end_date ? formatDate(event.event_end_date) : null;
    
    if (end) {
      return `${start} - ${end}`;
    }

    return start;
  };

  return (
    <>
      <section 
        ref={sectionRef}
        data-animate
        className={`w-full flex flex-col items-center gap-6 py-10 sm:py-12 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="w-full max-w-5xl flex flex-col gap-3">
          <h2 className="text-gray-900 text-2xl sm:text-3xl font-black leading-tight tracking-[-0.03em]">
            Upcoming Events
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
            Join us on our next rides, races, and community gatherings. Tap an event to see full details.
          </p>
        </div>

        <div className="w-full max-w-5xl flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-reptilez-green-200 rounded-xl bg-white shadow-sm"
              >
                <div className="text-left flex-1 space-y-2">
                  <div className="h-5 w-32 bg-reptilez-green-100 rounded shimmer-bg mx-auto sm:mx-0" />
                  <div className="h-4 w-48 bg-reptilez-green-50 rounded shimmer-bg mx-auto sm:mx-0" />
                </div>
                <div className="h-10 w-28 bg-reptilez-green-100 rounded shimmer-bg" />
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-600 bg-white rounded-xl border border-reptilez-green-100 p-8">
              <p>No upcoming events scheduled.</p>
            </div>
          ) : (
            events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} onSelect={setSelectedEvent} formatEventDate={formatEventDate} />
            ))
          )}
        </div>
        <button 
          onClick={() => navigate('/events')}
          className="mt-2 flex min-w-[160px] max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-reptilez-green-600 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-reptilez-green-700 transition-colors shadow-md hover:shadow-lg"
        >
          <span className="truncate">View All Events</span>
        </button>
      </section>

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

// Event Card Component with Animation
const EventCard = ({ event, index, onSelect, formatEventDate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      data-animate
      className={`group flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-reptilez-green-200 rounded-xl bg-white backdrop-blur-sm hover:border-reptilez-green-400 hover:bg-reptilez-green-50/50 transition-all duration-700 ease-out shadow-sm hover:shadow-md ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-full sm:flex-1 text-left">
        <p className="text-gray-900 font-semibold text-base sm:text-lg group-hover:text-reptilez-green-700 transition-colors line-clamp-2">
          {event.title}
        </p>
        <p className="text-gray-600 text-sm mt-1">{formatEventDate(event)}</p>
      </div>
      <button 
        onClick={() => onSelect(event)}
        className="flex-shrink-0 w-full sm:w-auto min-w-[120px] cursor-pointer inline-flex items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-reptilez-green-600 text-white border border-reptilez-green-600 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-reptilez-green-700 hover:border-reptilez-green-700 transition-colors shadow-sm"
      >
        <span className="truncate">View Details</span>
      </button>
    </div>
  );
};

export default Events;
