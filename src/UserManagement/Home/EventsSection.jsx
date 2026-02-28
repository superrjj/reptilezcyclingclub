import React, { useState, useEffect, useRef } from 'react';
import { getEvents } from '../../services/eventsService';
import GradientText from '../../components/ui/gradient-text';

const EventsSection = ({ refreshFunctionsRef }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

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

        const currentRef = sectionRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
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

    const upcomingEvents = events.filter(e => isUpcoming(e.event_date));
    const pastEvents = events.filter(e => isPast(e.event_date));

    // Limit how many cards show in a row
    const MAX_UPCOMING_DISPLAY = 2; // 1 row (2 cols on desktop)
    const MAX_PAST_DISPLAY = 2;     // 1 row (2 cols on desktop)

    const visibleUpcomingEvents = upcomingEvents.slice(0, MAX_UPCOMING_DISPLAY);
    const visiblePastEvents = pastEvents.slice(0, MAX_PAST_DISPLAY);

    return (
        <>
            <section
                id="events"
                ref={sectionRef}
                data-animate
                style={{ scrollMarginTop: '6rem' }}
                className={`w-full flex flex-col items-center gap-6 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
            >
                <div className="w-full max-w-6xl flex flex-col gap-4 sm:gap-6 md:gap-8">
                    {/* Animated Title with Gradient */}
                    <div className={`text-center space-y-2 transition-all duration-1000 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
                    }`}>
                        <GradientText
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight"
                        animationDuration={2}
                        >
                        Events Race
                        </GradientText>
                        <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-reptilez-green-600 to-transparent rounded-full"></div>
                    </div>

                    {/* Upcoming Events */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                            {Array.from({ length: 4 }).map((_, index) => (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {visibleUpcomingEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-white border border-reptilez-green-200 rounded-xl overflow-hidden hover:border-reptilez-green-400 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                                    onClick={() => setSelectedEvent(event)}
                                >
                                    <div className="relative h-60 bg-gradient-to-br from-reptilez-green-50 to-reptilez-green-100 overflow-hidden">
                                        {event.image_url ? (
                                            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-6xl text-reptilez-green-300">event</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-reptilez-green-600 text-white">Upcoming</span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-3">
                                        <h3 className="text-gray-900 text-lg font-bold line-clamp-2 group-hover:text-reptilez-green-700 transition-colors">{event.title}</h3>
                                        <div className="flex flex-col gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-reptilez-green-600 text-base">calendar_today</span>
                                                <p className="text-gray-600">
                                                    {event.event_end_date ? `${formatDate(event.event_date)} - ${formatDate(event.event_end_date)}` : formatDate(event.event_date)}
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
                                            <p className="text-gray-600 text-sm line-clamp-2 mt-1">{event.description}</p>
                                        )}
                                        <button className="mt-2 w-full py-2 px-4 bg-reptilez-green-600 text-white border border-reptilez-green-600 rounded-lg text-sm font-semibold hover:bg-reptilez-green-700 hover:border-reptilez-green-700 transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Past Events */}
                    {!loading && pastEvents.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-reptilez-green-200">
                            <h3 className="text-gray-900 text-2xl sm:text-3xl font-black leading-tight tracking-[-0.033em] mb-6">Past Events</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {visiblePastEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="bg-white border border-reptilez-green-100 rounded-xl overflow-hidden hover:border-reptilez-green-300 transition-all cursor-pointer group opacity-75 shadow-sm"
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        <div className="relative h-60 bg-gradient-to-br from-reptilez-green-50 to-reptilez-green-100 overflow-hidden">
                                            {event.image_url ? (
                                                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-6xl text-reptilez-green-200">event</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col gap-3">
                                            <h3 className="text-gray-700 text-lg font-bold line-clamp-2">{event.title}</h3>
                                            <div className="flex flex-col gap-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-reptilez-green-500 text-base">calendar_today</span>
                                                    <p className="text-gray-500">
                                                        {event.event_end_date ? `${formatDate(event.event_date)} - ${formatDate(event.event_end_date)}` : formatDate(event.event_date)}
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
                    )}
                </div>
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
                                <img src={selectedEvent.image_url} alt={selectedEvent.title} className="w-full h-96 object-contain bg-reptilez-green-50" />
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

export default EventsSection;
