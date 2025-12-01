import React, { useState, useEffect } from 'react';
import Header from '../Home/Header';
import { getMembers, searchMembers, getMembersByRole } from '../../services/membersService';

const MembersPage = ({ onLoginClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false); // Set to true when ready to use Supabase

  // Local fallback data
  const localMembers = [
    {
      name: "John Harvee Quirido",
      role: "Rider",
      roleType: "Rider",
      description: "Road Bike",
      image: "/harvee.jpg",
      alt: "Portrait of Alex Johnson"
    },
    {
      name: "Maria Garcia",
      role: "Lead Rider",
      roleType: "Lead Rider",
      description: "Route: Mountain Pass",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDx-5yTvRRd7zDxEM_NRv1FePaTo9Jiq_m0xWR27gY9B-k4k6BExMp1ItEy4YzTyMMLQRcXLC3LpZnlpUhlghi-MMX5sUcmQhhzBnS2fzrWpG1lJAPosrtRiZ_Le4OgGOJBeLDzW2li6a2jOvr4fkchrbqGi8L2HIAtY7-CppSRr85yhCCKIrhYajk0QcCMDFSvceHtSNghaFVQeeIDK8GNPJjhsStSC3MoIxMzOM4ETpk-9RiVRiJCbKqu4A5er_nFY8U0aslIZ-8",
      alt: "Portrait of Maria Garcia"
    },
    {
      name: "Chen Wei",
      role: "Rider",
      roleType: "Rider",
      description: "Years Riding: 2",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCP5VyM2PTAflMyUu2kz_nXJpAr2YwUfird43-MDL7OloIAwR7KNbWzC3K5LQyrW09-O1kAocgRp5by_B3ZzknjACJhr4_vb1FL4cNJGAsJRf37OX6bDqTXkSnh9UJaNGluHiHE8VRSU8aosgRxni4SbWQbocE4Sp5QrSqjRjKWSmJhzBBh-eac0hSLY4yCrHFTDlK2gzw9PF96i2r5SmnxNOZjkSkrdYK2tPyOjj45r1kkJr8kUspwYa9f1xTwRbZ8VyoFh0A3cJM",
      alt: "Portrait of Chen Wei"
    },
    {
      name: "Samira Khan",
      role: "Social Coordinator",
      roleType: "Rider",
      description: "Organizing our best events",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6iMmQH9G1zsOw7C15a-Yu_1V1Zy4WPktTwWRDFsh18I4NYD69XloSDl8IGoCPoqZwF5LavcLIVoRX7NjVcJBBrnUDH3W371bGNRKwqy-xLLXXvdTcERSpnt8SrVNPLlkNq4P5_r77LGaSMZGiqohRtAflDsPgHteKjTWb_NbU72H3NIkhxi2JGldg89er_eLIQITACLmm2Rdxd-ydv2PCHDzNm7pMSd6pGe8qU2-uU7OZ1JBN7Q9Yi9mXjnwqAGt0nRa7W0Qzzks",
      alt: "Portrait of Samira Khan"
    },
    {
      name: "David Lee",
      role: "Rider",
      roleType: "Rider",
      description: "Years Riding: 8",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnt9gSyJ9fdbbk0USbWpJOYx9l7zVcQku6bn6irUM6eYciOpaRzLzisq4ZBEi9S_pEzOIlA6g_0WdaI5_aqaiTW-sfgGczUcufViykMdPmPoJVU8kVmTxq0LA0gxljrDOKhNdVhxBUpqtCvkI--S-rVe3Nuel9O4TX8AeeS2wB2oRPob8qt8w0db0UcB56UJId8lRfRidfHNvH5XoO_SicGSJSLpvypgYBegQVGgZW7u_-EMxQU9-ArXM7NdUPX46MPF6fgVzO9G8",
      alt: "Portrait of David Lee"
    },
    {
      name: "Chloe Dubois",
      role: "Rider",
      roleType: "Rider",
      description: "Loves a good climb",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAietRtPwBKmNWqS6VgfSz9T9MpiwQfioTIvlQif-mbJ-FJW6Tw6SiR-_mztfmdOHk4O8IbycyDa3LbrUpsYdtcRy62JQ-1c6cuc14_uZQqSESoImZUvujKKz56shNJYVsrduJLatd5TI72vdhtwKtn7_0tyNAVTtR-G7SCLFiBC14lYMcd67L_WnzAohNyrpKzPKZkWF4Ne7PCHrcASUMS-sSoWYUEUIHx0ssl60xPy8N7WZMO74KUOQvRO9z3FxTl5xJ1p5eud74",
      alt: "Portrait of Chloe Dubois"
    },
    {
      name: "Ben Carter",
      role: "Founder",
      roleType: "Captain",
      description: "Years Riding: 15",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzuGOTQRvYUC01OCAXxLbHOeyJ_JmfJ1YLPnla3HmN2Hlb6F7w2Z1ChkH037va9-9_iDvKT_W1eI0SSSpr-kGh2g1Y0Y9rqrDzfTMTfh76PJtTOq9-n9OEUxEKGMum8-ZN4YY1v6NkSR0UL6o2i3LIPZN7t6kEzGWLFyDtzGkHUTiQgSnOh94W_fiPgk73aBwwyRAmGvBYhJvukT_I7qZimp2JaqU0jL_KTqGQtXj7hz45EaitNG7Zvoy-adm2xe9sL8mLsPM_0-0",
      alt: "Portrait of Ben Carter"
    },
    {
      name: "Sofia Rossi",
      role: "Lead Rider",
      roleType: "Lead Rider",
      description: "Route: Coastal Cruise",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCp0zm9TuKCIHIPI_rCEb0ONB5iuQhhHw0CU3Ed1z4hSRcjVz05HMlpGo_SXk_2QA-f06G1eXST2HRFaQ4WYxj383gkK6VJG-yOGTuraXB-z7EyQ1VQ_6HdTRdjUL-ZzsatEIgeX1b8sXw4G4tpT8nHP_IoAZFxTLp8sTVWxPYvoTiCAvduWpTkHS2u17S6vc-qdUlz1Qfs_k2LgjkPNrBxIoWE-IqGYlP4c0HhUSSFhg24cf7NltAMC99E30z2XDl-QC3PHaOuFHI",
      alt: "Portrait of Sofia Rossi"
    }
  ];

  const filters = ['All', 'Captain', 'Lead Rider', 'Rider'];

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
      <Header onLoginClick={onLoginClick} />
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1 pt-24">
            <main className="flex flex-col gap-4 py-8">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex min-w-72 flex-col gap-3">
                  <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Meet the Reptilez</p>
                  <p className="text-primary/70 text-base font-normal leading-normal">The dedicated riders who make our club a community.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 px-4 py-3 items-center">
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

              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6 p-4">
                {loading ? (
                  <div className="col-span-full text-center text-white/60 py-8">
                    Loading members...
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="col-span-full text-center text-white/60 py-8">
                    No members found.
                  </div>
                ) : (
                  filteredMembers.map((member, index) => (
                    <div key={member.id || index} className="flex flex-col gap-3 text-center pb-3 group">
                      <div className="px-4">
                        <div
                          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-full group-hover:scale-105 transition-transform duration-300"
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

