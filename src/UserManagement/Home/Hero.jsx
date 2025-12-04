import React, { useEffect, useState } from 'react';
import { getMaintenanceByType } from '../../services/maintenanceService';

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroImages = async () => {
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

    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [heroImages.length]);

  if (loading) {
    return (
      <div className="@container">
        <div className="@[480px]:p-4">
          <div className="relative min-h-[520px] overflow-hidden @[480px]:rounded-lg shadow-[0_20px_80px_rgba(0,0,0,0.45)] w-full max-w-[160%] mx-auto bg-zinc-900 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (heroImages.length === 0) {
    return (
      <div className="@container">
        <div className="@[480px]:p-4">
          <div className="relative min-h-[520px] overflow-hidden @[480px]:rounded-lg shadow-[0_20px_80px_rgba(0,0,0,0.45)] w-full max-w-[160%] mx-auto bg-zinc-900 flex items-center justify-center">
            <div className="text-center text-white/60">
              <p className="text-lg font-semibold">No hero images uploaded yet</p>
              <p className="text-sm mt-2">Please upload images in the admin panel</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="@container">
      <div className="@[480px]:p-4">
        <div className="relative min-h-[520px] overflow-hidden @[480px]:rounded-lg shadow-[0_20px_80px_rgba(0,0,0,0.45)] w-full max-w-[160%] mx-auto">
          {heroImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`absolute inset-0 flex h-full w-full flex-col items-center justify-end gap-6 bg-cover bg-center bg-no-repeat transition-opacity duration-700 pb-12 md:pb-16 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.6) 100%), url("${image}")`,
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
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-green-700 transition-colors">
                <span className="truncate">Join the Ride</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;

