import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUpcomingEvents } from '../../services/eventsService';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
                onClick={() => navigate('/members')}
                className="flex-shrink-0 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/20 text-primary border border-primary/50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary hover:text-white transition-colors"
              >
                <span className="truncate">View Details</span>
              </button>
            </div>
          ))
        )}
      </div>
      <button className="mt-4 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-green-700 transition-colors">
        <span className="truncate">View All Events</span>
      </button>
    </section>
  );
};

export default Events;

