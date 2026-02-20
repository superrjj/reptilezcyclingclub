import React, { useState, useEffect, useRef } from 'react';
import { getMembers, searchMembers, getMembersByRole } from '../../services/membersService';
import { useTabVisibility } from '../../hooks/useTabVisibility';
import { usePageMeta } from '../../hooks/usePageMeta';

const MembersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const searchQueryRef = useRef('');
  const selectedFilterRef = useRef('All');

  const filters = ['All', 'Founder', 'Captain', 'Rider', 'Utility'];

  // Fetch members from Supabase on mount and when filters change
  const fetchMembers = async () => {
    setLoading(true);
    try {
      let data;
      const filter = selectedFilterRef.current;
      const query = searchQueryRef.current;
      
      if (filter !== 'All') {
        data = await getMembersByRole(filter);
      } else if (query.trim()) {
        data = await searchMembers(query);
      } else {
        data = await getMembers();
      }
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchQueryRef.current = searchQuery;
    selectedFilterRef.current = selectedFilter;
    fetchMembers();
  }, [selectedFilter, searchQuery]);

  // Auto-refresh when tab becomes visible
  useTabVisibility(fetchMembers);
  usePageMeta('Members');

  // Filter members (client-side filtering for search when filter is active)
  const filteredMembers = members.filter(member => {
    if (!member || !member.name) return false;
    
    // If search query exists and we're not using searchMembers API (because filter is active)
    if (selectedFilter !== 'All' && searchQuery.trim()) {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = member.role_type === selectedFilter;
      return matchesSearch && matchesFilter;
    }
    
    // If only filter is active (searchMembers API handles search when no filter)
    if (selectedFilter !== 'All') {
      return member.role_type === selectedFilter;
    }
    
    // If only search is active, API already filtered
    if (searchQuery.trim()) {
      return true;
    }
    
    // Show all members
    return true;
  });

  // Ensure founders always appear first
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const isAFounder = (a.role_type || a.role)?.toLowerCase() === 'founder';
    const isBFounder = (b.role_type || b.role)?.toLowerCase() === 'founder';

    if (isAFounder && !isBFounder) return -1;
    if (!isAFounder && isBFounder) return 1;
    return 0;
  });

  // Handle modal close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedMember(null);
      }
    };

    if (selectedMember) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedMember]);

  return (
    <div 
      className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-reptilez-white-50 via-reptilez-white-100 to-reptilez-green-50"
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col w-full max-w-[1400px] flex-1">
            <main className="flex flex-col gap-4 sm:gap-5 md:gap-6 pt-3 sm:pt-4 pb-8 sm:pb-12">
              <div className="flex flex-wrap justify-between gap-2 sm:gap-3">
                <div className="flex min-w-0 sm:min-w-72 flex-col gap-2 sm:gap-3">
                  <p className="text-gray-900 text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Meet the Reptilez</p>
                  <p className="text-gray-600 text-sm sm:text-base font-normal leading-normal">The dedicated riders who make our club a community.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 py-2 sm:py-3 items-center">
                <div className="w-full sm:flex-1">
                  <label className="flex flex-col min-w-0 sm:min-w-40 h-10 sm:h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-reptilez-green-200 bg-white shadow-sm">
                      <div className="text-reptilez-green-600 flex border-none bg-reptilez-green-50 items-center justify-center pl-3 sm:pl-4 rounded-l-lg border-r-0">
                        <span className="material-symbols-outlined text-lg sm:text-xl">search</span>
                      </div>
                      <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-reptilez-green-500/50 border-none bg-white focus:border-none h-full placeholder:text-gray-400 px-3 sm:px-4 pl-2 text-sm sm:text-base font-normal leading-normal"
                        placeholder="Search by name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </label>
                </div>
                <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 overflow-x-auto w-full sm:w-auto">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg transition-colors px-4 border ${
                        selectedFilter === filter
                          ? 'bg-reptilez-green-600 text-white border-reptilez-green-600 shadow-sm'
                          : 'bg-white text-gray-700 border-reptilez-green-200 hover:bg-reptilez-green-50 hover:border-reptilez-green-300'
                      }`}
                    >
                      <p className="text-sm font-medium leading-normal">{filter}</p>
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
                ) : sortedMembers.length === 0 ? (
                  <div className="col-span-full text-center text-gray-600 py-8 bg-white rounded-xl border border-reptilez-green-100 p-8">
                    No members found.
                  </div>
                ) : (
                  sortedMembers.map((member, index) => (
                    <MemberCard key={member.id} member={member} index={index} onSelect={setSelectedMember} />
                  ))
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedMember && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedMember(null)}
        >
          {/* Close button - positioned absolutely to viewport */}
          <button
            onClick={() => setSelectedMember(null)}
            className="fixed top-4 right-4 text-gray-700 hover:text-gray-900 transition-colors z-[60] bg-white/90 rounded-full p-2 hover:bg-white border border-reptilez-green-200 shadow-lg"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div 
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Image container */}
            <div className="flex items-center justify-center mb-6 bg-white rounded-lg p-4 border border-reptilez-green-200">
              <img
                src={selectedMember.image_url || '/rcc1.png'}
                alt={selectedMember.name || 'Member'}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Member info */}
            <div className="bg-white backdrop-blur-md rounded-lg p-6 text-center border border-reptilez-green-200 shadow-xl">
              <h2 className="text-gray-900 text-2xl font-bold mb-2">
                {selectedMember.name || 'Unknown'}
              </h2>
              <p className={`text-lg font-bold mb-3 ${
                (selectedMember.role_type === 'Captain' || selectedMember.role_type === 'Founder')
                  ? 'text-reptilez-green-700'
                  : 'text-reptilez-green-600'
              }`}>
                {selectedMember.role_type || selectedMember.role || 'Member'}
              </p>
              {(selectedMember.description || selectedMember.bio) && (
                <p className="text-gray-600 text-base leading-relaxed">
                  {selectedMember.description || selectedMember.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Member Card Component with Animation
const MemberCard = ({ member, index, onSelect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      data-animate
      className={`flex flex-col gap-3 text-center pb-3 group bg-white rounded-xl p-4 border border-reptilez-green-100 hover:shadow-md transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="px-4 flex justify-center">
        <div
          className="w-full max-w-[240px] bg-center bg-no-repeat aspect-square bg-cover rounded-full group-hover:scale-105 transition-transform duration-300 cursor-pointer border-2 border-reptilez-green-200"
          style={{ 
            backgroundImage: `url("${member.image_url || '/rcc1.png'}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          role="img"
          aria-label={member.name || 'Member'}
          onClick={() => onSelect(member)}
        ></div>
      </div>
      <div>
        <p className="text-gray-900 text-base font-semibold leading-normal">{member.name || 'Unknown'}</p>
        <p className={`text-sm font-bold leading-normal ${
          (member.role_type === 'Captain' || member.role_type === 'Founder')
            ? 'text-reptilez-green-700'
            : 'text-reptilez-green-600'
        }`}>
          {member.role_type || member.role || 'Member'}
        </p>
        {member.description && (
          <p className="text-gray-600 text-sm font-normal leading-normal">{member.description}</p>
        )}
        {member.bio && !member.description && (
          <p className="text-gray-600 text-sm font-normal leading-normal">{member.bio}</p>
        )}
      </div>
    </div>
  );
};

export default MembersPage;