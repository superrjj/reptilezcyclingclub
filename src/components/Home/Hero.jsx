import React, { useEffect, useState } from 'react';

const heroImages = ['/bg_team_hero.jpg', '/bg_team_hero_1.jpg', '/bg_team_hero_2.jpg'];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const currentBackground = heroImages[currentIndex];

  return (
    <div className="@container">
      <div className="@[480px]:p-4">
        <div 
          className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] transition-all duration-700"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.6) 100%), url("${currentBackground}")`,
          }}
        >
          <div className="flex flex-col gap-2 text-center max-w-xl">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
              Ride with the Pack
            </h1>
            <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
              Exploring Trails, Building Community. Join Reptilez Cycling Club for exhilarating rides and a vibrant community.
            </h2>
          </div>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-primary text-black text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-accent hover:text-white transition-colors">
            <span className="truncate">Join the Ride</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;

