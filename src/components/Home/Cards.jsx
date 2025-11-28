import React from 'react';

const Cards = () => {
  const cardData = [
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrwEDea-7zLNSfk0Rk-NvPgNU8DidHYbGrgW1yP7p-zG3a9VTFDdm9dTbjH1zGAr4DcpFQvRxzKCftWYaDxVXQygveD2raAvTYzs7AKYCU8dNbGSK3Jd98KCACbc1lb322KkKy-10RhoYEIJh0-o7ok6N7py204vp0dFeKL0B5LCWoU-ZgWnAvdJxdmylYmOhdvlYJ9WWIIR5w3iaT4tdYXA7yPYiOsG6tZg488khqwg9ctjPr5jgGkei3406sy8Ksgul1aIj3bBU",
      title: "Our Members",
      description: "Meet our passionate community of riders.",
      alt: "Portrait photo of a smiling cyclist in club gear"
    },
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3eCzlnC5BJOqRfoTZTjjgWdR12XOnNSEX-nbSBFhUO5TTiH7-elLRXCgbPEBR1_N7kgT080AjWdjYHKHsM8Zeo7j-PiG7JM39cvzP2R70gY6ExqsWJRl0v21sw36qWTfEipd9kls8DiwZZaCnqEpEwDV3r6YgGNm2-u8vrCTH6vg-XygIgOdJySDcvSej7nu27WpqXPWzwQmVndn2Sfbto36Ni_DhA-E0Z2nyi0NH7_EBXQVwC38nZe_q0-e9R1SyX3qfBztYFfI",
      title: "Latest Posts",
      description: "Check out the latest news and ride reports.",
      alt: "Cyclist's perspective shot of a forest trail"
    },
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_qSwvA_1ukyyhwrjsFkfp5Q6q5tnc_Ex5lyeLv121rT3YD1SYISzxwddGCjxU650YevooLL_jT_XCawTTPyP9mPzn8C4U8FBBoMeKPwEzXW83U3FjwQhl5fkin7R6-lBzuYP8UYjjwF7uRFSwuYi046S97eUCs5c-PSGGOLxviLGd4qdDQ-782LhtCF3VJN0028oJYuwSoGKIqpZkFttPbnA9z923_a7cJ2KPLk8-j7ZwhoAUYpFKRz0LHlUTHKwk_UdLMYSqtIM",
      title: "Upcoming Events",
      description: "Join our next group adventure on the trails.",
      alt: "A calendar with a date circled, signifying an event"
    },
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYoLkZTuDA9vd7jg8zrSXpY9sYUbNDfwqjfFOTDKM0IaRaKkeNH8X8WWz2e4H3aUYEqGyCdKCfey17rzeC_Go0cpI8Mhsth9rn_LKaK7IqjwYbeBlD3SALW5PM0ujYmmof99l2DjtOeKAWadCOvDqNg8ic0SsGs9DyqBfZi5Sx6f_XE_NdlNbOlaHxDVC6X7aae0ZkZx065HO1nCRrULDhaW0WFboga6qMFcQmy46ws3IsliQNxcRIh23rp9bg4vwCtlrqe8WT8cU",
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

