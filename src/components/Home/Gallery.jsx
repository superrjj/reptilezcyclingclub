import React from 'react';

const Gallery = () => {
  const images = [
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1tpLlnaPEgYneCGIWIT-_Mx3j3FoyKeEYXMvIjkvitkgS7CRTGjxeTvINslG0enNOvn4y6k76KKLOSw_bsL-YpLpGWthIjcPJDHrUmCRUcVSf9FJ3W6b13PNLjHb51A6BiW67I2aUQDZxp-ZGDROp0uB31TWvcmTvh2U5i6tJXeN_PlsaJTFMptMdbci83JE9nPxWltFupscdwfJcEEMsPjazB3amISh_AuKjaqud8TfLwmLwdKVVcUxzojTMJak2eLKJImcbwVM",
      alt: "A close-up shot of a mountain bike's front wheel on a dusty trail."
    },
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSkMCev1iCsG5zXUriwUwfl8di1XCtN6HBpxpTmrmXq_CdklmK7gH8MzaPp8bg04uqE07mkTWReStVKUrGXY875ltex_N-swlJA7N_oPbDHuX9PXeyU9ukbrhvxYWseXXZfHJPoOkKJOW6v7bcjYPJSUK8wBDZldqJmA7md6G8sGtI5HdSeY_TVFA32_Bh8i6hlUwXn6GqtIQed-Ro5tAF6HfWlhAGN7BhQ2ge_D1noIEANssb3kCgjwbDATNcpFXz2gT1uNrwvYc",
      alt: "A group of cyclists resting and chatting on a scenic overlook."
    },
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsungfoa9ASqs9JPG6XwngHUpILu7UL9owjmPI3Tsp_59f5GppNrgdLmJvll8Pc_1xZJgKDdAHksDCMde65DQTzncYdsNWeA2YLiAhk7X4mAEKlg5MRgkySiYQ_VGrdli4k5iD7x0JKxsBE_BpI9IAym0K3-c8AIP7_3XnInHx7gnVezeEOG_bbcRQCsBIfutKqu4U8gU_BNDQWvXy60-LQKQh2Kbo0oi_06Lz_Bm-wQaihiqx93o3p8yIQ96QbzJIJhNNEisjXyA",
      alt: "A cyclist navigating a tight turn on a singletrack trail in a forest."
    },
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5ONRG0twbZMn-YSFgcYsNsNWwGah3OERhXkjMgDMDbdLEeQQrzKUTsWmASgqbwHHrtFxhVGEHvTzj7yaJXAUlQFylq8XsKZiJUBOz2YMWU2IiPmNwpwZ-ggvvZAlyUhqoEMJbgJ-yUiEBRRwMnPAR5zNhuOt9ncqSMzgv_zhvDtpFqF_-8MFEb6KNZxNYvupbU-faftqG9tMkPv1Fihx0HMgGHmZ5Y7BRbG0OFh_yvDL7W-ECjv0pGvU7NXMidJwd2wAdV3GDIwg",
      alt: "Wide shot of three cyclists riding in a line on a mountain path."
    },
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuALATXv8tJk-n7xmfLHQGTt4o8SXzkbnlU8M_dSB1OZ_lvWMpZnF-8u4xy0i1zMs-iNOI_eFdC7dd9LwF5UjDgSaMnseVWE_uusm8HXrH8I-kKgafDsU1Bf04s5LkwupoWINbU5euFq9gJm72ERyh5l0N-ZRHMBre_8lBtfniapWkA5rUmlH_UASj3lmqf5wBiHvn3kozga5eIO59mR_tFCFXg8Z13sZSdT5s_PR4e_rTxQSs0Ly8A9flQ4JGaoE5ym49jezDzCFNo",
      alt: "An aerial drone shot of a cyclist on a winding road through a green landscape."
    },
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEwqAgoOWyMeyku7Zb9fddwtMiFVUFk12M56_lePm9F92YXpz2sQ_jsyXpScKdpQF1tpH9RRRnPGm-gv5bVryf4YGsTsyeUiQ4PPsHvw2OA4RQKvTjEXVS2yOTwQWPMPEpdXaL015XmhXoli4jxdVNlV7ZQzkrNDQ0JNRwU4Qh2BT4boWd1P6ZRKf_fqYDEOv-JsTT4gsXTfZNh1qOsURqYxk6NLtjvbu80AGcxrfFOctlpCb5ltk87wHT_Lkvq0yLtIOzCmzwpb8",
      alt: "A cyclist silhouetted against a vibrant sunset sky."
    }
  ];

  return (
    <section className="flex flex-col items-center gap-6 py-8">
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] sm:text-3xl">From the Trails</h2>
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

