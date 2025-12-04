import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';

const Dashboard = () => {
  // Prevent body scrolling when dashboard is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const recentActivities = [
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIKcJVNjTm4ElWx_wG22xvZ6ryAriZYI4RF92PhOGsJgrjOkWELJQmHQYGw3IVeT4rHdfTSmkbPngCDjsz9mr0NySpONcBq3gW08r4anYfYWXco_wOhYqzvucBCnI8XFtDnGoeQgvZ5MHP3swRH2vZcHa_3H5hlCm9bHJKa6GWh1HPZ7fIX06jIzRLoDqfSVf_X_UlyCm3FHmgE7MhnRP-2D_XNs_s9twJ167AVfO7hjpAykpi6-42IhBF9Lys4tLFIpSo2LUQK6Y",
      title: "Alex Johnson joined",
      time: "2 hours ago",
      alt: "User avatar for Alex Johnson"
    },
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxDOZtvfk-pJTRvR8y6jLz7UAY32HpNmEbvYhu6WUYS4R2TL3JrTRvBHkZGdtbtWDJaQqx3cWyaB4gEIDvydb75rZVHRJnWjnbzMi5ie7djgujizclIqrIYiQE11-qmECpNfIdXHqmi2DxgM7sAwT5GSiSdqxX8u6ZEo8GXVrHTCuiTEkbRcNgOTmWnPpLxMdxPIhq75ayU5pp5rIUZDxJyk3rh1F6562VoXtQtT9vkHCbQht9FlMIUriASXfH5-LK36H58Ec1nxc",
      title: "Maria Garcia posted \"Weekend Ride Routes\"",
      time: "5 hours ago",
      alt: "User avatar for Maria Garcia"
    },
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaG44_cu-e7EhLu2F6pJolmhEE_OVQOIV4Cz9CWcQckVq7KJg3sgEShezuR9HhrSfbeudRazxc-balskJg1KLE6IiGZrm-CzO9bLbQiWo94gwut__59KygdiaTDsfUJ1nzyE7ciAWYWDa5lS2Z48XXOv5HfNlJjJrRIK20ra36oLin79dHBnMcK2oov8MyfdyOsz9mH_bIlHi1SWH5XLFEqUKsF-YT246JC6R08qbcKlONh0swv7R6kpi94rOmAZe9M4_EcE-nxjQ",
      title: "New event created: \"Hill Climb Challenge\"",
      time: "1 day ago",
      alt: "Event icon"
    },
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUnFVxc07G-Joel9XRSmnbMxjWzZaEqlaOdWBDO30LwAl9l-TgPU6QEqpVXxaGP77lYJpueFnDBew1RoAW3_GLc3wwxWUqTx-XLYPCiCLUO72v2cFaGA9X36fOqfbufOtfv4m5QOjfk5ul8nEpZLl0XOUfH8yjTgtH3KVvurE3LRVc2gK10VVuGTMsf64aau0WCI6-Dnzkpr5m8RYE6j5dQG8iol42uwDuWOubZ0YZMuDk_-QfOHxxcCVpyDZtOB2AW5P6HVIWhrE",
      title: "Sam Lee joined",
      time: "2 days ago",
      alt: "User avatar for Sam Lee"
    }
  ];

  return (
    <AdminLayout>
      {/* Main Content */}
        <main className="flex-1 flex flex-col bg-black/20 h-full overflow-hidden">
          {/* ToolBar */}
          <header className="flex justify-end gap-4 px-8 py-4 border-b border-primary/30 items-center bg-background-dark flex-shrink-0">
            <div className="flex gap-2">
              <button className="p-2 text-white rounded-full hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-white rounded-full hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </header>

          <div className="flex-1 p-8 overflow-y-auto h-full">
            {/* Under Maintenance Banner */}
            <div className="mb-6 rounded-2xl border border-yellow-400/40 bg-yellow-500/10 px-5 py-4 flex items-start gap-3">
              <div className="mt-0.5 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-yellow-300">warning</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Dashboard Layout is Under Maintenance</p>
                <p className="text-white/80 text-xs">
                  Temporary UI only. Final design will be updated soon by <span className="font-semibold">Dev Harvee</span>.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-background-dark border border-primary/30">
                <p className="text-white text-base font-medium leading-normal">Total Members</p>
                <p className="text-white tracking-light text-3xl font-bold leading-tight">1,204</p>
                <p className="text-primary text-base font-medium leading-normal">+12% this month</p>
              </div>
              
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-background-dark border border-primary/30">
                <p className="text-white text-base font-medium leading-normal">Upcoming Events</p>
                <p className="text-white tracking-light text-3xl font-bold leading-tight">8</p>
                <p className="text-primary text-base font-medium leading-normal">+2 scheduled</p>
              </div>
              
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-background-dark border border-primary/30">
                <p className="text-white text-base font-medium leading-normal">Total Posts</p>
                <p className="text-white tracking-light text-3xl font-bold leading-tight">256</p>
                <p className="text-primary text-base font-medium leading-normal">+5% this month</p>
              </div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 py-6">
              {/* Charts */}
              <div className="flex flex-col gap-2 rounded-xl border border-primary/30 p-6 xl:col-span-2 bg-background-dark">
                <p className="text-white text-base font-medium leading-normal">Member Growth</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-white tracking-light text-[32px] font-bold leading-tight truncate">1,204</p>
                  <p className="text-primary text-base font-medium leading-normal">+8.5%</p>
                </div>
                <p className="text-primary/70 text-sm font-normal leading-normal">Last 6 months</p>
                
                <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
                  <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="-3 0 478 150" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#paint0_linear_1131_5935)"></path>
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#16a34a" strokeLinecap="round" strokeWidth="3"></path>
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1131_5935" x1="236" x2="236" y1="1" y2="149">
                        <stop stopColor="#16a34a" stopOpacity="0.3"></stop>
                        <stop offset="1" stopColor="#16a34a" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="flex justify-around">
                    <p className="text-primary/70 text-[13px] font-bold leading-normal tracking-[0.015em]">Jan</p>
                    <p className="text-primary/70 text-[13px] font-bold leading-normal tracking-[0.015em]">Feb</p>
                    <p className="text-primary/70 text-[13px] font-bold leading-normal tracking-[0.015em]">Mar</p>
                    <p className="text-primary/70 text-[13px] font-bold leading-normal tracking-[0.015em]">Apr</p>
                    <p className="text-primary/70 text-[13px] font-bold leading-normal tracking-[0.015em]">May</p>
                    <p className="text-primary/70 text-[13px] font-bold leading-normal tracking-[0.015em]">Jun</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="flex flex-col gap-4 rounded-xl border border-primary/30 p-6 bg-background-dark">
                <div className="flex justify-between items-center">
                  <h3 className="text-white text-base font-medium leading-normal">Recent Activity</h3>
                  <a className="text-primary text-sm font-medium hover:underline" href="#">View All</a>
                </div>
                
                <div className="flex flex-col gap-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                        style={{ backgroundImage: `url("${activity.image}")` }}
                        alt={activity.alt}
                      ></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium leading-normal">{activity.title}</p>
                        <p className="text-white/60 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
    </AdminLayout>
  );
};

export default Dashboard;

