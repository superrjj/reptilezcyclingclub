import React, { useEffect, useState } from 'react';
import { getMaintenanceByType } from '../../services/maintenanceService';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const maintenanceData = await getMaintenanceByType('Gallery');
        if (maintenanceData && maintenanceData.length > 0) {
          const galleryImages = maintenanceData.slice(0, 9).map(item => ({
            src: item.image_url,
            alt: 'Gallery image'
          }));
          setImages(galleryImages);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  return (
    <section className="flex flex-col items-center gap-6 py-8">
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] sm:text-3xl">From the Roads</h2>
      {loading ? (
        <div className="columns-2 md:columns-3 gap-4 p-4 w-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="mb-4 w-full h-48 rounded-lg bg-zinc-900 animate-pulse shimmer-bg"></div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="w-full py-12 text-center text-white/60">
          <p className="text-lg font-semibold">No gallery images uploaded yet</p>
          <p className="text-sm mt-2">Please upload images in the admin panel</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 gap-4 p-4">
          {images.map((image, index) => (
            <img 
              key={`${image.src}-${index}`}
              className="mb-4 w-full h-auto rounded-lg" 
              alt={image.alt}
              src={image.src}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Gallery;

