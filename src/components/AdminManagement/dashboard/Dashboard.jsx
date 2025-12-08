import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../AdminLayout';
import { getMembers } from '../../../services/membersService';
import { getPosts } from '../../../services/postsService';
import { getEvents, getUpcomingEvents } from '../../../services/eventsService';
import { useTabVisibility } from '../../../hooks/useTabVisibility';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    upcomingEvents: 0,
    totalPosts: 0,
    totalEvents: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [memberGrowth, setMemberGrowth] = useState([]);

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [members, posts, events, upcomingEvents] = await Promise.all([
        getMembers(),
        getPosts(),
        getEvents(),
        getUpcomingEvents(),
      ]);

      // Calculate stats
      setStats({
        totalMembers: members?.length || 0,
        upcomingEvents: upcomingEvents?.length || 0,
        totalPosts: posts?.length || 0,
        totalEvents: events?.length || 0,
      });

      // Create recent activities from all sources
      const activities = [];
      
      // Add recent members (last 3)
      const recentMembers = members?.slice(0, 3) || [];
      recentMembers.forEach(member => {
        activities.push({
          type: 'member',
          id: member.id,
          title: `${member.name} joined`,
          time: member.created_at,
          image: member.image_url || null,
          alt: `Member: ${member.name}`,
        });
      });

      // Add recent posts (last 3)
      const recentPosts = posts?.slice(0, 3) || [];
      recentPosts.forEach(post => {
        activities.push({
          type: 'post',
          id: post.id,
          title: `Post created: "${post.title}"`,
          time: post.created_at,
          image: post.media?.[0]?.url || post.featured_image || null,
          alt: `Post: ${post.title}`,
        });
      });

      // Add recent events (last 3)
      const recentEvents = events?.slice(0, 3) || [];
      recentEvents.forEach(event => {
        activities.push({
          type: 'event',
          id: event.id,
          title: `Event created: "${event.title}"`,
          time: event.created_at,
          image: event.image_url || null,
          alt: `Event: ${event.title}`,
        });
      });

      // Sort by time and take most recent 6
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivities(activities.slice(0, 6));

      // Calculate member growth (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        const membersInMonth = members?.filter(m => {
          const memberDate = new Date(m.created_at);
          return memberDate >= monthStart && memberDate <= monthEnd;
        }).length || 0;
        
        monthlyData.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          count: membersInMonth,
        });
      }

      // Calculate cumulative growth
      let cumulative = 0;
      const growthData = monthlyData.map((data, index) => {
        cumulative += data.count;
        return {
          month: data.month,
          value: cumulative,
        };
      });
      
      setMemberGrowth(growthData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Integrate auto-refresh
  useTabVisibility(fetchDashboardData);

  // Calculate growth percentage (mock for now, can be enhanced with historical data)
  const memberGrowthPercent = useMemo(() => {
    if (memberGrowth.length < 2) return 0;
    const current = memberGrowth[memberGrowth.length - 1]?.value || 0;
    const previous = memberGrowth[memberGrowth.length - 2]?.value || 0;
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }, [memberGrowth]);

  // Generate chart path
  const generateChartPath = () => {
    if (memberGrowth.length === 0) return { linePath: '', areaPath: '' };
    
    const maxValue = Math.max(...memberGrowth.map(d => d.value), 1);
    const width = 450;
    const height = 150;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = memberGrowth.map((data, index) => {
      const x = padding + (index / (memberGrowth.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - (data.value / maxValue) * chartHeight;
      return `${x},${y}`;
    });
    
    const pathData = points.join(' ');
    const lastPointX = points[points.length - 1]?.split(',')[0] || padding;
    const areaPath = `M ${points[0]} L ${pathData} L ${lastPointX},${height - padding} L ${padding},${height - padding} Z`;
    
    return { linePath: pathData, areaPath };
  };

  const chartPaths = generateChartPath();

  return (
    <AdminLayout>
      <main className="flex-1 flex flex-col bg-black/20 h-full overflow-hidden">
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-32 rounded-xl shimmer-bg" />
              ))
            ) : (
              <>
                {/* Total Members */}
                <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-background-dark to-background-dark/80 border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                      <span className="material-symbols-outlined text-primary text-2xl">people</span>
                    </div>
                    <div className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                      <span className="text-primary text-xs font-semibold">
                        {memberGrowthPercent > 0 ? '+' : ''}{memberGrowthPercent}%
                      </span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm font-medium mb-1">Total Members</p>
                  <p className="text-white text-3xl font-bold mb-1">{stats.totalMembers.toLocaleString()}</p>
                  <p className="text-primary/70 text-xs">Active club members</p>
                </div>

                {/* Upcoming Events */}
                <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-background-dark to-background-dark/80 border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                      <span className="material-symbols-outlined text-primary text-2xl">event</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm font-medium mb-1">Upcoming Events</p>
                  <p className="text-white text-3xl font-bold mb-1">{stats.upcomingEvents}</p>
                  <p className="text-primary/70 text-xs">Scheduled events</p>
                </div>

                {/* Total Posts */}
                <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-background-dark to-background-dark/80 border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                      <span className="material-symbols-outlined text-primary text-2xl">article</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm font-medium mb-1">Total Posts</p>
                  <p className="text-white text-3xl font-bold mb-1">{stats.totalPosts.toLocaleString()}</p>
                  <p className="text-primary/70 text-xs">Published posts</p>
                </div>

                {/* Total Events */}
                <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-background-dark to-background-dark/80 border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                      <span className="material-symbols-outlined text-primary text-2xl">calendar_month</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm font-medium mb-1">Total Events</p>
                  <p className="text-white text-3xl font-bold mb-1">{stats.totalEvents.toLocaleString()}</p>
                  <p className="text-primary/70 text-xs">All time events</p>
                </div>
              </>
            )}
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
            {/* Member Growth Chart */}
            {loading ? (
              <div className="xl:col-span-2 rounded-xl shimmer-bg h-80" />
            ) : (
              <div className="flex flex-col gap-4 rounded-xl border border-primary/30 p-6 xl:col-span-2 bg-gradient-to-br from-background-dark to-background-dark/80">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white text-lg font-semibold mb-1">Member Growth</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-white text-3xl font-bold">{stats.totalMembers.toLocaleString()}</p>
                      {memberGrowthPercent !== 0 && (
                        <p className={`text-sm font-medium ${memberGrowthPercent > 0 ? 'text-primary' : 'text-red-400'}`}>
                          {memberGrowthPercent > 0 ? '+' : ''}{memberGrowthPercent}%
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="material-symbols-outlined text-primary text-2xl">trending_up</span>
                  </div>
                </div>
                <p className="text-primary/70 text-sm mb-4">Last 6 months</p>
                
                <div className="flex-1 min-h-[200px] relative">
                  {memberGrowth.length > 0 ? (
                    <svg 
                      viewBox="0 0 450 150" 
                      className="w-full h-full"
                      preserveAspectRatio="none"
                    >
                      {/* Area gradient */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Area */}
                      <path
                        d={chartPaths.areaPath}
                        fill="url(#areaGradient)"
                      />
                      
                      {/* Line */}
                      <path
                        d={`M ${chartPaths.linePath}`}
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Dots */}
                      {memberGrowth.map((data, index) => {
                        const maxValue = Math.max(...memberGrowth.map(d => d.value), 1);
                        const width = 450;
                        const height = 150;
                        const padding = 20;
                        const chartWidth = width - padding * 2;
                        const chartHeight = height - padding * 2;
                        const x = padding + (index / (memberGrowth.length - 1 || 1)) * chartWidth;
                        const y = padding + chartHeight - (data.value / maxValue) * chartHeight;
                        
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#16a34a"
                            stroke="#0f172a"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </svg>
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/40">
                      <p>No data available</p>
                    </div>
                  )}
                  
                  {/* Month labels */}
                  {memberGrowth.length > 0 && (
                    <div className="flex justify-between mt-2">
                      {memberGrowth.map((data, index) => (
                        <p key={index} className="text-primary/70 text-xs font-medium">
                          {data.month}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {loading ? (
              <div className="rounded-xl shimmer-bg h-80" />
            ) : (
              <div className="flex flex-col gap-4 rounded-xl border border-primary/30 p-6 bg-gradient-to-br from-background-dark to-background-dark/80">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white text-lg font-semibold">Recent Activity</h3>
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="material-symbols-outlined text-primary text-xl">notifications</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-1">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div 
                        key={`${activity.type}-${activity.id}-${index}`} 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group w-full"
                      >
                        <div className="flex-shrink-0">
                          {activity.image ? (
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border-2 border-primary/30 group-hover:border-primary/50 transition-colors overflow-hidden"
                              style={{ backgroundImage: `url("${activity.image}")` }}
                              alt={activity.alt}
                            />
                          ) : (
                            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 group-hover:border-primary/50 transition-colors overflow-hidden">
                              <span className="material-symbols-outlined text-primary text-xl">
                                {activity.type === 'member' ? 'person' : activity.type === 'post' ? 'article' : 'event'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium leading-tight truncate group-hover:text-primary transition-colors">
                            {activity.title}
                          </p>
                          <p className="text-white/50 text-xs mt-1">{formatTimeAgo(activity.time)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <span className="material-symbols-outlined text-white/20 text-5xl mb-2">inbox</span>
                      <p className="text-white/40 text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default Dashboard;

