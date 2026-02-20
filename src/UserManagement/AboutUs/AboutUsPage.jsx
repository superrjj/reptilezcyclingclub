import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../../hooks/usePageMeta';

const AboutUsPage = () => {
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState({});

  usePageMeta('About Us');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (navigator.onLine) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          await fetch('https://www.google.com/favicon.ico', {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          setTimeout(() => setLoading(false), 300);
        } else {
          setTimeout(() => setLoading(false), 1000);
        }
      } catch (error) {
        setTimeout(() => setLoading(false), 800);
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if (!loading) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setVisibleSections(prev => ({
              ...prev,
              [entry.target.id]: entry.isIntersecting
            }));
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      document.querySelectorAll('[data-animate]').forEach((el) => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }
  }, [loading]);

  const values = [
    {
      title: 'Passion for Cycling',
      description: 'We ride with heart, pushing boundaries and celebrating every mile.',
      icon: 'pedal_bike',
      color: 'text-emerald-600',
      glowColor: ''
    },
    {
      title: 'Community First',
      description: 'Building lasting friendships and supporting each other on and off the road.',
      icon: 'groups',
      color: 'text-reptilez-green-600',
      glowColor: ''
    },
    {
      title: 'Excellence',
      description: 'Striving for personal bests while maintaining sportsmanship and respect.',
      icon: 'star',
      color: 'text-yellow-600',
      glowColor: ''
    },
    {
      title: 'Adventure',
      description: 'Exploring new routes, challenging terrains, and creating unforgettable memories.',
      icon: 'explore',
      color: 'text-blue-600',
      glowColor: ''
    },
  ];

  const objectives = [
    {
      title: 'Youth Development',
      description: 'Nurturing young and youth riders to develop into competitive athletes who will become a source of pride for Tarlac and Pangasinan. We provide comprehensive training programs designed to unlock their full potential.',
      icon: 'sports',
      color: 'text-reptilez-green-600',
      bgGlow: 'bg-reptilez-green-50'
    },
    {
      title: 'Character Building',
      description: 'While developing their athletic talents, we coach our riders to have good manners and right conduct. We believe that true champions are defined not just by their victories, but by their character and integrity.',
      icon: 'school',
      color: 'text-emerald-600',
      bgGlow: 'bg-emerald-50'
    },
    {
      title: 'National Competition',
      description: 'Establishing a premier Amateur team in Tarlac Province that races competitively at the national level. We compete in major races across the country, showcasing the talent and determination of our riders.',
      icon: 'emoji_events',
      color: 'text-yellow-600',
      bgGlow: 'bg-yellow-50'
    },
    {
      title: 'Model Club',
      description: 'Serving as a model club and team that inspires upcoming amateur teams. We share our knowledge, best practices, and experiences to help build a stronger cycling community nationwide.',
      icon: 'auto_awesome',
      color: 'text-blue-600',
      bgGlow: 'bg-blue-50'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 sm:gap-8 md:gap-12 pb-6 sm:pb-8 md:pb-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
          <div className="relative w-full h-80 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden border border-reptilez-green-200 shimmer-bg bg-white" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((item) => (
            <div key={item} className="bg-white border border-reptilez-green-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full shimmer-bg" />
                <div className="h-6 w-32 rounded-full shimmer-bg" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded-full shimmer-bg" />
                <div className="h-4 w-full rounded-full shimmer-bg" />
                <div className="h-4 w-5/6 rounded-full shimmer-bg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      {/* Hero Section with Parallax Effect */}
      <div 
        id="hero" 
        data-animate
        className={`flex flex-col gap-6 transition-all duration-1000 ${
          visibleSections['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[670px] rounded-xl sm:rounded-2xl overflow-hidden border border-reptilez-green-200 group shadow-lg hover:shadow-xl transition-all duration-700 bg-white">
          <div 
            className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: 'url("/rcc_bg.jpg")' }}
            role="img"
            aria-label="Reptilez Cycling Club team photo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-white/30 to-transparent" />
        </div>
      </div>

      {/* Mission & Vision with Flip Animation */}
      <div 
        id="mission-vision" 
        data-animate
        className={`grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 transition-all duration-1000 ${
          visibleSections['mission-vision'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="bg-white border border-reptilez-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm hover:border-reptilez-green-400 transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="material-symbols-outlined text-reptilez-green-600 text-3xl sm:text-4xl">flag</span>
            <h2 className="text-gray-900 text-xl sm:text-2xl font-bold">Our Mission</h2>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
            To nurture and develop young and youth riders into competitive athletes who will become 
            a source of pride for Tarlac and Pangasinan. We are committed to providing comprehensive 
            training that develops not just athletic prowess, but also instills good manners and right 
            conduct in every rider.
          </p>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            Through dedicated coaching, structured programs, and a supportive community, we transform 
            promising young cyclists into disciplined athletes who excel both on and off the bike, 
            representing our provinces with honor and integrity.
          </p>
        </div>

        <div className="bg-white border border-reptilez-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm hover:border-reptilez-green-400 transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="material-symbols-outlined text-reptilez-green-600 text-3xl sm:text-4xl">visibility</span>
            <h2 className="text-gray-900 text-xl sm:text-2xl font-bold">Our Vision</h2>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
            To establish a premier Amateur cycling team in Tarlac Province that competes at the highest 
            national level races. We envision RCC as a model club and team that serves as an inspiration 
            and blueprint for upcoming amateur teams across the country.
          </p>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            We strive to be recognized not only for our competitive achievements but also for our 
            commitment to youth development, character building, and excellence in sportsmanship. 
            Our goal is to create a legacy that inspires future generations of cyclists.
          </p>
        </div>
      </div>

      {/* Objectives with Stagger Animation */}
      <div 
        id="objectives" 
        data-animate
        className={`flex flex-col gap-6 transition-all duration-1000 ${
          visibleSections['objectives'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-gray-900 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            Our Core Objectives
          </h2>
          <p className="text-gray-600 text-base font-normal leading-normal">
            The pillars that guide our journey and define our purpose.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {objectives.map((objective, index) => (
            <div
              key={index}
              className={`bg-white border border-reptilez-green-200 rounded-xl p-6 backdrop-blur-sm hover:border-reptilez-green-400 transition-all duration-300 ${
                visibleSections['objectives'] ? 'animate-fadeInUp' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-reptilez-green-50 border border-reptilez-green-300 ${objective.color} ${objective.bgGlow}`}>
                  <span className="material-symbols-outlined text-2xl">{objective.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 text-xl font-bold mb-2">{objective.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {objective.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values with Glow Effect */}
      <div 
        id="values" 
        data-animate
        className={`flex flex-col gap-6 transition-all duration-1000 ${
          visibleSections['values'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-gray-900 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            Our Core Values
          </h2>
          <p className="text-gray-600 text-base font-normal leading-normal">
            The principles that guide everything we do.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className={`bg-white border border-reptilez-green-200 rounded-xl p-6 backdrop-blur-sm hover:border-reptilez-green-400 transition-all duration-300 ${
                visibleSections['values'] ? 'animate-fadeInUp' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-reptilez-green-50 border border-reptilez-green-300 ${value.color}`}>
                  <span className="material-symbols-outlined text-2xl">{value.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Footer with Fade In */}
      <div 
        id="footer" 
        data-animate
        className={`flex justify-center items-center pt-12 pb-6 border-t border-reptilez-green-200 transition-all duration-1000 ${
          visibleSections['footer'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="text-center space-y-2">
          <p className="text-gray-600 text-sm font-normal">
            Developed with passion by
          </p>
          <p className="text-gray-900 text-base font-semibold">
            <span className="text-reptilez-green-700 hover:text-reptilez-green-800 transition-colors duration-300 cursor-pointer">
              John Harvee Quirido
            </span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .shimmer-bg {
          background: linear-gradient(
            90deg,
            rgba(250, 250, 250, 1) 0%,
            rgba(240, 253, 244, 1) 20%,
            rgba(250, 250, 250, 1) 40%,
            rgba(250, 250, 250, 1) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUsPage;