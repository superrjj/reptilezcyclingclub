import React from 'react';

const Cards = () => {
  const cardData = [
    {
      image: "/member_romeo.jpg",
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
      image: "/about_us_bg.jpg",
      title: "About Us",
      description: "Learn more about our story and mission.",
      alt: "A group of cyclists posing for a photo together"
    }
  ];

  return (
    <section>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-4">
        {cardData.map((card, index) => (
          <div key={index} className="flex flex-col gap-3 pb-3 group">
            <div 
              className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
              style={{ backgroundImage: `url("${card.image}")` }}
              alt={card.alt}
            ></div>
            <div>
              <p className="text-white text-base font-medium leading-normal">{card.title}</p>
              <p className="text-white/60 text-sm font-normal leading-normal">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Cards;

