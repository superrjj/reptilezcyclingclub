import React, { useState, useEffect } from 'react';
import { getMembers, searchMembers, getMembersByRole } from '../../services/membersService';

const MembersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false); // Set to true when ready to use Supabase

  // Local fallback data
  const localMembers = [
    {
      name: "Mark Darwin Manguan",
      role: "Founder",
      roleType: "Founder",
      description: "Road Bike",
      image: "/kuyamd.jpg",
      alt: "Portrait of Harvee"
    },
    {
      name: "John Harvee Quirido",
      role: "Rider",
      roleType: "Rider",
      description: "Road Bike",
      image: "/harvee.jpg",
      alt: "Portrait of Harvee"
    },
    {
      name: "John Harvee Quirido",
      role: "Rider",
      roleType: "Rider",
      description: "Road Bike",
      image: "/harvee.jpg",
      alt: "Portrait of Harvee"
    }
  ];

  const filters = ['All', 'Captain', 'Rider', 'Founder'];

  // Fetch members from Supabase on mount and when filters change
  useEffect(() => {
    const fetchMembers = async () => {
      if (useSupabase) {
        setLoading(true);
        try {
          let data;
          if (selectedFilter !== 'All') {
            data = await getMembersByRole(selectedFilter);
          } else if (searchQuery) {
            data = await searchMembers(searchQuery);
          } else {
            data = await getMembers();
          }
          setMembers(data);
        } catch (error) {
          console.error('Error fetching members:', error);
          setMembers(localMembers); // Fallback to local data
        } finally {
          setLoading(false);
        }
      } else {
        setMembers(localMembers);
        setLoading(false);
      }
    };

    fetchMembers();
  }, [useSupabase, selectedFilter, searchQuery]);

  // Filter members (for local data or after Supabase fetch)
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true;
    const matchesFilter = selectedFilter === 'All' || member.role_type === selectedFilter || member.roleType === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div 
      className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden text-white"
      style={{
        backgroundImage:
          'linear-gradient(135deg, #020202 0%, #0a2b0a 35%, #0b0b0b 65%, #2b0000 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-6 lg:px-8 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[1400px] flex-1 pt-24">
            <main className="flex flex-col gap-6 py-8">
              <div className="flex flex-wrap justify-between gap-3">
                <div className="flex min-w-72 flex-col gap-3">
                  <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Meet the Reptilez</p>
                  <p className="text-primary/70 text-base font-normal leading-normal">The dedicated riders who make our club a community.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 py-3 items-center">
                <div className="w-full md:flex-1">
                  <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                      <div className="text-primary/70 flex border-none bg-black/40 items-center justify-center pl-4 rounded-l-lg border-r-0">
                        <span className="material-symbols-outlined">search</span>
                      </div>
                      <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-white focus:outline-0 focus:ring-0 border-none bg-black/40 focus:border-none h-full placeholder:text-primary/70 px-4 pl-2 text-base font-normal leading-normal"
                        placeholder="Search by name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 p-3 overflow-x-auto w-full md:w-auto">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg transition-colors px-4 ${
                        selectedFilter === filter
                          ? 'bg-primary/20 border border-primary/50'
                          : 'bg-black/40 hover:bg-primary/20'
                      }`}
                    >
                      <p className="text-white text-sm font-medium leading-normal">{filter}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex flex-col gap-3 text-center pb-3">
                      <div className="px-4 flex justify-center">
                        <div className="w-full max-w-[240px] aspect-square rounded-full shimmer-bg" />
                      </div>
                      <div className="space-y-2 px-8">
                        <div className="h-3 rounded-full shimmer-bg" />
                        <div className="h-2 rounded-full shimmer-bg" />
                      </div>
                    </div>
                  ))
                ) : filteredMembers.length === 0 ? (
                  <div className="col-span-full text-center text-white/60 py-8">
                    No members found.
                  </div>
                ) : (
                  filteredMembers.map((member, index) => (
                    <div key={member.id || index} className="flex flex-col gap-3 text-center pb-3 group">
                      <div className="px-4 flex justify-center">
                        <div
                          className="w-full max-w-[240px] bg-center bg-no-repeat aspect-square bg-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                          style={{ backgroundImage: `url("${member.image || member.image_url}")` }}
                          alt={member.alt || member.name}
                        ></div>
                      </div>
                      <div>
                        <p className="text-white text-base font-medium leading-normal">{member.name}</p>
                        <p className={`text-sm font-bold leading-normal ${
                          (member.role_type === 'Captain' || member.roleType === 'Captain' || 
                           member.role_type === 'Lead Rider' || member.roleType === 'Lead Rider' || 
                           member.role === 'Founder')
                            ? 'text-primary'
                            : 'text-primary/70'
                        }`}>
                          {member.role || member.role_name}
                        </p>
                        <p className="text-primary/70 text-sm font-normal leading-normal">{member.description || member.bio}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;

