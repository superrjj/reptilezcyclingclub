import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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
        const withImage = events.find(e => e.image_url);
        setUpcomingEvent(withImage || events[0]);
      }
    } catch (error) {
      console.error('Error loading upcoming event for cards:', error);
    }
  };

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchLatestPost(),
      fetchMemberImages(),
      fetchUpcomingEvent()
    ]);
  }, []);

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
  }, [refreshFunctionsRef, refreshAll]);

  // Cycle through member images with fade animation
  useEffect(() => {
    if (memberImages.length === 0) return;
    
    const intervalId = setInterval(() => {
      setCurrentMemberIndex((prev) => (prev + 1) % memberImages.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [memberImages.length]);

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

  return (
    <section 
      ref={sectionRef}
      data-animate
      className={`w-full py-8 sm:py-12 transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 sm:gap-6">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 pb-3 group cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl bg-white rounded-xl p-4 border border-reptilez-green-100"
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
                return (
                  <>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-reptilez-green-100">
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
                          className="w-full h-full bg-center bg-no-repeat bg-cover bg-reptilez-green-50 flex items-center justify-center"
                          role="img"
                          aria-label={card.alt}
                        >
                          <span className="material-symbols-outlined text-reptilez-green-400 text-6xl">group</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 text-base font-semibold leading-normal group-hover:text-reptilez-green-700 transition-colors">{card.title}</p>
                      <p className="text-gray-600 text-sm font-normal leading-normal">{card.description}</p>
                    </div>
                  </>
                );
              }
              
              if (isEventsCard) {
                return (
                  <>
                    <div 
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg border border-reptilez-green-100"
                      style={{ backgroundImage: `url("${upcomingEvent.image_url || card.image}")` }}
                      role="img"
                      aria-label={card.alt}
                    ></div>
                    <div>
                      <p className="text-gray-900 text-base font-semibold leading-normal group-hover:text-reptilez-green-700 transition-colors">{card.title}</p>
                      <p className="text-gray-600 text-sm font-normal leading-normal">{card.description}</p>
                    </div>
                  </>
                );
              }
              
              const image = isLatestCard && latestPost?.featured_image
                ? latestPost.featured_image
                : card.image;
              return (
                <>
                  <div 
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg border border-reptilez-green-100"
                    style={{ backgroundImage: `url("${image}")` }}
                    role="img"
                    aria-label={card.alt}
                  ></div>
                  <div>
                    <p className="text-gray-900 text-base font-semibold leading-normal group-hover:text-reptilez-green-700 transition-colors">{card.title}</p>
                    <p className="text-gray-600 text-sm font-normal leading-normal">{card.description}</p>
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
