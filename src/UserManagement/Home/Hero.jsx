import React, { useEffect, useState, forwardRef } from 'react';
import { getMaintenanceByType } from '../../services/maintenanceService';

const Hero = forwardRef(({ refreshFunctionsRef }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  if (loading) {
    return (
      <div className="@container">
        <div className="@[480px]:p-4">
          <div className="relative min-h-[520px] overflow-hidden @[480px]:rounded-lg shadow-[0_20px_80px_rgba(0,0,0,0.45)] w-full max-w-[160%] mx-auto bg-zinc-900">
            <div className="absolute inset-0 shimmer-bg"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-white/60 text-sm font-medium">Loading amazing races...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (heroImages.length === 0) {
    return (
      <div className="@container">
        <div className="@[480px]:p-4">
          <div className="relative min-h-[520px] overflow-hidden @[480px]:rounded-lg shadow-[0_20px_80px_rgba(0,0,0,0.45)] w-full max-w-[160%] mx-auto bg-zinc-900 flex items-center justify-center border border-primary/20">
            <div className="text-center text-white/60 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-4xl">🚴</span>
              </div>
              <p className="text-lg font-semibold">No hero images uploaded yet</p>
              <p className="text-sm mt-2">Please upload images in the admin panel</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="@container">
        <div className="@[480px]:p-4">
          <div className={`relative min-h-[520px] overflow-hidden @[480px]:rounded-lg shadow-[0_20px_80px_rgba(34,197,94,0.2)] hover:shadow-[0_30px_100px_rgba(34,197,94,0.3)] w-full max-w-[160%] mx-auto group transition-all duration-700 border border-primary/20 hover:border-primary/40 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
            </div>

            {heroImages.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={`absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat transition-all duration-1000 ${
                  index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.85) 100%), url("${image}")`,
                  transitionDelay: index === currentIndex ? '0ms' : '300ms'
                }}
              >
                {/* Animated overlay gradient */}
                <div className={`absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent transition-opacity duration-1000 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}></div>
              </div>
            ))}

            {/* Static Button - Outside the slides */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
              <button 
                onClick={() => setShowModal(true)}
                className="relative flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 @[480px]:h-14 @[480px]:px-10 bg-gradient-to-r from-primary via-green-600 to-primary bg-[length:200%_100%] bg-[position:0%_0%] hover:bg-[position:100%_0%] text-white text-base font-black leading-normal tracking-wide @[480px]:text-lg uppercase transition-all duration-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_35px_rgba(34,197,94,0.7),0_0_50px_rgba(34,197,94,0.3)] hover:scale-110 transform border-2 border-green-400/30 hover:border-green-400/70 group/btn hover:brightness-110"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>
                
                {/* Single pulse ring for subtle glow */}
                <div className="absolute inset-0 rounded-full animate-ping-slow opacity-0 group-hover/btn:opacity-20 bg-primary blur-sm"></div>
                
                <span className="relative truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] group-hover/btn:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Join Our Team</span>
              </button>
            </div>

            {/* Progress indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {heroImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentIndex 
                      ? 'w-12 bg-primary shadow-[0_0_10px_rgba(34,197,94,0.8)]' 
                      : 'w-1.5 bg-white/30 hover:bg-white/50'
                  }`}
                ></div>
              ))}
            </div>

            {/* Navigation arrows */}
            <button 
              onClick={() => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-primary/80 hover:border-primary hover:scale-110 transition-all duration-300 z-20"
            >
              <span className="text-2xl">‹</span>
            </button>
            <button 
              onClick={() => setCurrentIndex((prev) => (prev + 1) % heroImages.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-primary/80 hover:border-primary hover:scale-110 transition-all duration-300 z-20"
            >
              <span className="text-2xl">›</span>
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          @keyframes ping-slow {
            0% {
              transform: scale(1);
              opacity: 0.3;
            }
            50% {
              transform: scale(1.3);
              opacity: 0.15;
            }
            100% {
              transform: scale(1.6);
              opacity: 0;
            }
          }

          @keyframes pulse-slow {
            0%, 100% {
              transform: scale(1);
              opacity: 0.4;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.2;
            }
          }

          .shimmer-bg {
            background: linear-gradient(
              90deg,
              rgba(24, 24, 27, 1) 0%,
              rgba(34, 197, 94, 0.1) 50%,
              rgba(24, 24, 27, 1) 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
          }

          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out;
          }

          .animate-ping-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }

          .animate-pulse-slow {
            animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, transparent 70%);
            border-radius: 50%;
            animation: float 6s infinite ease-in-out;
          }

          .particle-1 {
            top: 20%;
            left: 10%;
            animation-delay: 0s;
          }

          .particle-2 {
            top: 60%;
            right: 15%;
            animation-delay: 2s;
            animation-duration: 8s;
          }

          .particle-3 {
            bottom: 30%;
            left: 70%;
            animation-delay: 4s;
            animation-duration: 7s;
          }
        `}</style>
      </div>

      {/* Available Soon Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-[#0a0a0a] border-2 border-primary/40 rounded-2xl max-w-md w-full p-8 text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 animate-pulse-slow"></div>
            
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="text-6xl">🚴</span>
              </div>
              
              <h2 className="text-3xl font-black text-white mb-3">Coming Soon!</h2>
              <p className="text-primary text-xl font-bold mb-4">Recruitment Opening Soon</p>
              <p className="text-white/60 text-base leading-relaxed mb-6">
                We're preparing to welcome new riders to the Reptilez family. Stay tuned for updates on our recruitment process!
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-bold rounded-lg transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105"
                >
                  Got It!
                </button>
                <p className="text-white/40 text-sm">Check back soon for updates</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

Hero.displayName = 'Hero';

export default Hero;