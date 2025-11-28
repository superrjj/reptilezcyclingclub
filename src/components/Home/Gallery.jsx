import React from 'react';

const Gallery = () => {
  const images = [
    {
      src: "/gallery6.jpg",
      alt: "A close-up shot of a mountain bike's front wheel on a dusty trail."
    },
    {
      src: "/gallery1.jpg",
      alt: "A group of cyclists resting and chatting on a scenic overlook."
    },
    {
      src: "/gallery2.jpg",
      alt: "A cyclist navigating a tight turn on a singletrack trail in a forest."
    },
    {
      src: "/gallery3.jpg",
      alt: "Wide shot of three cyclists riding in a line on a mountain path."
    },
    {
      src: "/gallery4.jpg",
      alt: "An aerial drone shot of a cyclist on a winding road through a green landscape."
    },
    {
      src: "/gallery5.jpg",
      alt: "A cyclist silhouetted against a vibrant sunset sky."
    }
  ];

  return (
    <section className="flex flex-col items-center gap-6 py-8">
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] sm:text-3xl">From the Roads</h2>
      <div className="columns-2 md:columns-3 gap-4 p-4">
        {images.map((image, index) => (
          <img 
            key={index}
            className="mb-4 w-full h-auto rounded-lg" 
            alt={image.alt}
            src={image.src}
          />
        ))}
      </div>
    </section>
  );
};

export default Gallery;

