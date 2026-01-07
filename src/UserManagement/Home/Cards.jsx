import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../../services/postsService';
import { getMembers } from '../../services/membersService';
import { getUpcomingEvents } from '../../services/eventsService';

const Cards = ({ refreshFunctionsRef }) => {
  const navigate = useNavigate();
  const [latestPost, setLatestPost] = useState(null);
  const [memberImages, setMemberImages] = useState([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [upcomingEvent, setUpcomingEvent] = useState(null);

  const cardData = [
    {
      title: "Our Members",
      description: "Meet our passionate community of riders.",
      alt: "Portrait photo of a smiling cyclist in club gear"
    },
    {
      image: "/latest_post.jpg",
      title: "Latest Posts",
      description: "Check out the latest news and ride reports.",
      alt: "Cyclist's perspective shot of a forest trail"
    },
    {
      image: "/upcoming_events.jpg",
      title: "Upcoming Events",
      description: "Join our next group adventure on the road.",
      alt: "A calendar with a date circled, signifying an event"
    },
    {
      image: "/rcc_bg.jpg",
      title: "About Us",
      description: "Learn more about our story and mission.",
      alt: "A group of cyclists posing for a photo together"
    }
  ];

  const fetchLatestPost = async () => {
    try {
      const posts = await getPosts();
      if (!Array.isArray(posts) || posts.length === 0) return;

      // Get latest published post that has an image
      const withImage = posts.filter(
        (p) => p.featured_image && p.status === 'Published'
      );
      if (withImage.length > 0) {
        setLatestPost(withImage[0]);
      }
    } catch (error) {
      console.error('Error loading latest post for cards:', error);
    }
  };

  const fetchMemberImages = async () => {
    try {
      const members = await getMembers();
      if (Array.isArray(members) && members.length > 0) {
        // Get all member images that exist
        const images = members
          .map(member => member.image_url)
          .filter(Boolean)
          .filter(url => url && url.trim() !== '');
        
        if (images.length > 0) {
          setMemberImages(images);
        }
      }
    } catch (error) {
      console.error('Error loading member images for cards:', error);
    }
  };

  const fetchUpcomingEvent = async () => {
    try {
      const events = await getUpcomingEvents();
      if (Array.isArray(events) && events.length > 0) {
        // Get the first upcoming event (sorted by date, earliest first)
        // Prefer events with images
        const withImage = events.find(e => e.image_url);
        setUpcomingEvent(withImage || events[0]);
      }
    } catch (error) {
      console.error('Error loading upcoming event for cards:', error);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchLatestPost(),
      fetchMemberImages(),
      fetchUpcomingEvent()
    ]);
  };

  useEffect(() => {
    fetchLatestPost();
    fetchMemberImages();
    fetchUpcomingEvent();
  }, []);

  // Register refresh function
  useEffect(() => {
    if (refreshFunctionsRef?.current) {
      const index = refreshFunctionsRef.current.length;
      refreshFunctionsRef.current.push(refreshAll);
      return () => {
        refreshFunctionsRef.current = refreshFunctionsRef.current.filter((_, i) => i !== index);
      };
    }
  }, [refreshFunctionsRef]);

  // Cycle through member images with fade animation
  useEffect(() => {
    if (memberImages.length === 0) return;
    
    const intervalId = setInterval(() => {
      setCurrentMemberIndex((prev) => (prev + 1) % memberImages.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [memberImages.length]);

  return (
    <section>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-4">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 pb-3 group cursor-pointer transition-transform hover:-translate-y-1"
            onClick={() => {
              if (card.title === 'Latest Posts') {
                navigate('/posts');
              } else if (card.title === 'Our Members') {
                navigate('/members');
              } else if (card.title === 'Upcoming Events') {
                navigate('/events');
              } else if (card.title === 'About Us') {
                navigate('/about-us');
              }
            }}
          >
            {(() => {
              const isLatestCard = card.title === 'Latest Posts' && latestPost;
              const isMembersCard = card.title === 'Our Members' && memberImages.length > 0;
              const isEventsCard = card.title === 'Upcoming Events' && upcomingEvent;
              
              if (isMembersCard) {
                // Members card with fade animation
                return (
                  <>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                      {memberImages.length > 0 ? (
                        memberImages.map((image, index) => (
                          <div
                            key={`${image}-${index}`}
                            className={`absolute inset-0 bg-center bg-no-repeat bg-cover transition-opacity duration-700 ${
                              index === currentMemberIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{ backgroundImage: `url("${image}")` }}
                            role="img"
                            aria-label={card.alt}
                          ></div>
                        ))
                      ) : (
                        <div 
                          className="w-full h-full bg-center bg-no-repeat bg-cover bg-gray-800 flex items-center justify-center"
                          role="img"
                          aria-label={card.alt}
                        >
                          <span className="material-symbols-outlined text-white/40 text-6xl">group</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white text-base font-medium leading-normal">{card.title}</p>
                      <p className="text-white/60 text-sm font-normal leading-normal">{card.description}</p>
                    </div>
                  </>
                );
              }
              
              if (isEventsCard) {
                // Upcoming Events card with event image
                return (
                  <>
                    <div 
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
                      style={{ backgroundImage: `url("${upcomingEvent.image_url || card.image}")` }}
                      role="img"
                      aria-label={card.alt}
                    ></div>
                    <div>
                      <p className="text-white text-base font-medium leading-normal">{card.title}</p>
                      <p className="text-white/60 text-sm font-normal leading-normal">{card.description}</p>
                    </div>
                  </>
                );
              }
              
              // Latest Posts card or other cards
              const image = isLatestCard && latestPost?.featured_image
                ? latestPost.featured_image
                : card.image;
              return (
                <>
                  <div 
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
                    style={{ backgroundImage: `url("${image}")` }}
                    role="img"
                    aria-label={card.alt}
                  ></div>
                  <div>
                    <p className="text-white text-base font-medium leading-normal">{card.title}</p>
                    <p className="text-white/60 text-sm font-normal leading-normal">{card.description}</p>
                  </div>
                </>
              );
            })()}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Cards;

