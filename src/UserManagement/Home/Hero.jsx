import React, { useEffect, useState, forwardRef } from 'react';
import { getMaintenanceByType } from '../../services/maintenanceService';

const Hero = forwardRef(({ refreshFunctionsRef }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const fetchHeroImages = async () => {
    setLoading(true);
    try {
      const maintenanceData = await getMaintenanceByType('Hero');
      if (maintenanceData && maintenanceData.length > 0) {
        const images = maintenanceData.map(item => item.image_url).filter(Boolean);
        setHeroImages(images);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImages();
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Register refresh function
  useEffect(() => {
    if (refreshFunctionsRef?.current) {
      const index = refreshFunctionsRef.current.length;
      refreshFunctionsRef.current.push(fetchHeroImages);
      return () => {
        refreshFunctionsRef.current = refreshFunctionsRef.current.filter((_, i) => i !== index);
      };
    }
  }, [refreshFunctionsRef]);

  useEffect(() => {
    if (heroImages.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [heroImages.length]);

  const fullScreenClasses = 'min-h-screen w-screen relative left-1/2 -translate-x-1/2 overflow-hidden -mt-24';

  if (loading) {
    return (
      <div className={`${fullScreenClasses} mb-8 sm:mb-12`}>
        <div className="absolute inset-0 shimmer-bg bg-reptilez-green-50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-reptilez-green-300 border-t-reptilez-green-600 rounded-full animate-spin" />
            <p className="text-gray-600 text-sm font-medium">Loading amazing races...</p>
          </div>
        </div>
      </div>
    );
  }

  if (heroImages.length === 0) {
    return (
      <div className={`${fullScreenClasses} mb-8 sm:mb-12 bg-reptilez-green-50 flex items-center justify-center`}>
        <div className="text-center text-gray-600 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-reptilez-green-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-4xl">🚴</span>
          </div>
          <p className="text-lg font-semibold">No hero images uploaded yet</p>
          <p className="text-sm mt-2">Please upload images in the admin</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${fullScreenClasses} mb-8 sm:mb-12 group transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {heroImages.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className={`absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat transition-all duration-1000 ${index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          style={{
            backgroundImage: `url("${image}")`,
            transitionDelay: index === currentIndex ? '0ms' : '300ms'
          }}
        />
      ))}

      {/* Support our Team Text */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
        <div className="relative flex min-w-[140px] items-center justify-center rounded-full h-10 px-6 sm:h-11 sm:px-8 bg-gradient-to-r from-reptilez-green-600 via-reptilez-green-500 to-reptilez-green-600 text-white text-sm font-black leading-normal tracking-wide sm:text-base uppercase border-2 border-reptilez-green-400/30 shadow-lg">
          <span className="relative truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">Support our Team</span>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroImages.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex
                ? 'w-12 bg-reptilez-green-600 shadow-[0_0_10px_rgba(22,163,74,0.6)]'
                : 'w-1.5 bg-white/50 hover:bg-white/70'
              }`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-reptilez-green-200 flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 hover:bg-reptilez-green-600 hover:border-reptilez-green-600 hover:text-white hover:scale-110 transition-all duration-300 z-20 shadow-lg"
      >
        <span className="text-2xl">‹</span>
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % heroImages.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-reptilez-green-200 flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 hover:bg-reptilez-green-600 hover:border-reptilez-green-600 hover:text-white hover:scale-110 transition-all duration-300 z-20 shadow-lg"
      >
        <span className="text-2xl">›</span>
      </button>
    </div>
  );
});

Hero.displayName = 'Hero';

export default Hero;
