import React from 'react';

const AboutUsPage = () => {
  const values = [
    {
      title: 'Passion for Cycling',
      description: 'We ride with heart, pushing boundaries and celebrating every mile.',
      icon: 'pedal_bike',
      color: 'text-emerald-400',
    },
    {
      title: 'Community First',
      description: 'Building lasting friendships and supporting each other on and off the road.',
      icon: 'groups',
      color: 'text-primary',
    },
    {
      title: 'Excellence',
      description: 'Striving for personal bests while maintaining sportsmanship and respect.',
      icon: 'star',
      color: 'text-yellow-400',
    },
    {
      title: 'Adventure',
      description: 'Exploring new routes, challenging terrains, and creating unforgettable memories.',
      icon: 'explore',
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <div className="flex flex-col gap-6">
        <div className="relative w-full h-80 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden border border-primary/30">
          <div 
            className="absolute inset-0 bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: 'url("/about_us_bg.jpg")' }}
            role="img"
            aria-label="Reptilez Cycling Club team photo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-[-0.033em] mb-2">
              About Reptilez Cycling Club
            </h1>
            <p className="text-primary/90 text-base md:text-lg font-normal leading-relaxed max-w-3xl">
              We are more than just a cycling club. We are a community dedicated to nurturing young talents, 
              developing competitive athletes, and serving as a source of pride for Tarlac and Pangasinan.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/40 border border-primary/30 rounded-2xl p-8 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-4xl">flag</span>
            <h2 className="text-white text-2xl font-bold">Our Mission</h2>
          </div>
          <p className="text-white/80 text-base leading-relaxed mb-4">
            To nurture and develop young and youth riders into competitive athletes who will become 
            a source of pride for Tarlac and Pangasinan. We are committed to providing comprehensive 
            training that develops not just athletic prowess, but also instills good manners and right 
            conduct in every rider.
          </p>
          <p className="text-white/80 text-base leading-relaxed">
            Through dedicated coaching, structured programs, and a supportive community, we transform 
            promising young cyclists into disciplined athletes who excel both on and off the bike, 
            representing our provinces with honor and integrity.
          </p>
        </div>

        <div className="bg-black/40 border border-primary/30 rounded-2xl p-8 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-4xl">visibility</span>
            <h2 className="text-white text-2xl font-bold">Our Vision</h2>
          </div>
          <p className="text-white/80 text-base leading-relaxed mb-4">
            To establish a premier Amateur cycling team in Tarlac Province that competes at the highest 
            national level races. We envision RCC as a model club and team that serves as an inspiration 
            and blueprint for upcoming amateur teams across the country.
          </p>
          <p className="text-white/80 text-base leading-relaxed">
            We strive to be recognized not only for our competitive achievements but also for our 
            commitment to youth development, character building, and excellence in sportsmanship. 
            Our goal is to create a legacy that inspires future generations of cyclists.
          </p>
        </div>
      </div>

      {/* Our Goals */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            Our Core Objectives
          </h2>
          <p className="text-primary/70 text-base font-normal leading-normal">
            The pillars that guide our journey and define our purpose.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 border border-primary/30 rounded-xl p-6 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-black/60 border border-primary/30 text-primary group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-2xl">sports</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-xl font-bold mb-2">Youth Development</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Nurturing young and youth riders to develop into competitive athletes who will become 
                  a source of pride for Tarlac and Pangasinan. We provide comprehensive training programs 
                  designed to unlock their full potential.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-primary/30 rounded-xl p-6 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-black/60 border border-primary/30 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-xl font-bold mb-2">Character Building</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  While developing their athletic talents, we coach our riders to have good manners and 
                  right conduct. We believe that true champions are defined not just by their victories, 
                  but by their character and integrity.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-primary/30 rounded-xl p-6 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-black/60 border border-primary/30 text-yellow-400 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-2xl">emoji_events</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-xl font-bold mb-2">National Competition</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Establishing a premier Amateur team in Tarlac Province that races competitively at 
                  the national level. We compete in major races across the country, showcasing the 
                  talent and determination of our riders.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-primary/30 rounded-xl p-6 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-black/60 border border-primary/30 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-xl font-bold mb-2">Model Club</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Serving as a model club and team that inspires upcoming amateur teams. We share our 
                  knowledge, best practices, and experiences to help build a stronger cycling community 
                  nationwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            Our Core Values
          </h2>
          <p className="text-primary/70 text-base font-normal leading-normal">
            The principles that guide everything we do.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-black/40 border border-primary/30 rounded-xl p-6 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-black/60 border border-primary/30 ${value.color} group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-2xl">{value.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{value.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border border-primary/50">
            <span className="material-symbols-outlined text-primary text-4xl">directions_bike</span>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-white text-3xl md:text-4xl font-black leading-tight">
              Ready to Join the Ride?
            </h2>
            <p className="text-primary/80 text-base md:text-lg max-w-2xl leading-relaxed">
              Whether you're a seasoned cyclist or just starting your journey, we welcome riders 
              of all levels. Join us for our next ride and become part of the Reptilez family.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">mail</span>
              Contact Us
            </button>
            <button className="px-6 py-3 bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">event</span>
              View Events
            </button>
          </div>
        </div>
      </div>

      {/* Footer Credit */}
      <div className="flex justify-center items-center pt-8 border-t border-primary/20">
        <p className="text-white/50 text-sm font-normal">
          Developed by <span className="text-primary/70 font-semibold">John Harvee Quirido</span>
        </p>
      </div>
    </div>
  );
};

export default AboutUsPage;

