import React, { useState, useEffect } from 'react';

export const ExpandingCards = ({
  cards = [],
  gap = 'gap-3 md:gap-5',
  height = 'h-[350px] md:h-[450px]',
  classNames = {},
  breakpoints = [],
  transitionDuration = 0.4,
  activeIndex = 0,
  onIndexChange,
}) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCardWidths = () => {
    if (breakpoints.length === 0) {
      return { active: 300, inactive: 120 };
    }

    const sortedBreakpoints = [...breakpoints].sort((a, b) => b.maxWidth - a.maxWidth);
    
    for (const bp of sortedBreakpoints) {
      if (windowWidth <= bp.maxWidth) {
        return { active: bp.activeWidth, inactive: bp.inactiveWidth };
      }
    }

    const largestBp = sortedBreakpoints[0];
    return { active: largestBp?.activeWidth || 300, inactive: largestBp?.inactiveWidth || 120 };
  };

  const { active: activeWidth, inactive: inactiveWidth } = getCardWidths();

  if (!cards || cards.length === 0) {
    return null;
  }

  const handlePrev = () => {
    if (onIndexChange && activeIndex > 0) {
      onIndexChange(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (onIndexChange && activeIndex < cards.length - 1) {
      onIndexChange(activeIndex + 1);
    }
  };

  return (
    <>
      <style>{`
        .expanding-cards-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="relative w-full">
        {/* Previous Arrow */}
        {activeIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 hover:bg-primary/80 backdrop-blur-sm border border-white/10 hover:border-primary/50 text-white transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-lg"
            aria-label="Previous"
          >
            <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_left</span>
          </button>
        )}

        {/* Cards Container */}
        <div className={`expanding-cards-scroll flex ${gap} justify-center items-center w-full overflow-x-auto px-4 ${classNames.container || ''}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {cards.map((card, index) => {
              const isActive = activeIndex === index;
              const cardWidth = isActive ? activeWidth : inactiveWidth;

              return (
                <div
                  key={index}
                  className={`relative cursor-default transition-all ease-out rounded-xl overflow-hidden ${height} ${classNames.card || ''}`}
                  style={{
                    width: `${cardWidth}px`,
                    minWidth: `${cardWidth}px`,
                    transitionDuration: `${transitionDuration}s`,
                  }}
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${card.image || card.src || ''})`,
                      transform: isActive ? 'scale(1)' : 'scale(1.1)',
                      transition: `transform ${transitionDuration}s ease-out`,
                    }}
                  />

                  {/* Overlay Gradient */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                    style={{
                      opacity: isActive ? 1 : 0.7,
                      transition: `opacity ${transitionDuration}s ease-out`,
                    }}
                  />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                    <h3
                      className={`font-extrabold tracking-wide truncate mb-2 ${classNames.title || ''}`}
                      style={{
                        fontSize: titleSize,
                        transform: isActive ? 'translateY(0)' : 'translateY(10px)',
                        opacity: isActive ? 1 : 0.9,
                        transition: `all ${transitionDuration * 1.5}s ease-out`,
                      }}
                    >
                      {card.title || `Gallery ${index + 1}`}
                    </h3>
                    {card.description && (
                      <p
                        className={`font-medium text-gray-200 overflow-hidden ${classNames.description || ''}`}
                        style={{
                          fontSize: isActive ? '14px' : '0px',
                          maxHeight: isActive ? '100px' : '0px',
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? 'translateY(0)' : 'translateY(10px)',
                          transition: `all ${transitionDuration * 1.5}s ease-out`,
                        }}
                      >
                        {card.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Arrow */}
        {activeIndex < cards.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 hover:bg-primary/80 backdrop-blur-sm border border-white/10 hover:border-primary/50 text-white transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-lg"
            aria-label="Next"
          >
            <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_right</span>
          </button>
        )}
      </div>
    </>
  );
};

