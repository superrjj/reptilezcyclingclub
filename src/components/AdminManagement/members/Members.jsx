import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { getMembers, searchMembers, createMember, updateMember, deleteMember } from '../../../services/membersService';
import { uploadImage } from '../../../services/imageUploadService';

const Members = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ visible: false, type: '', message: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    picture: null,
    picturePreview: null,
    role: 'Rider',
    bikeType: 'Road Bike'
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        let data;
        if (searchQuery) {
          data = await searchMembers(searchQuery);
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

    fetchMembers();
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        picture: file,
        picturePreview: URL.createObjectURL(file)
      }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      picture: null,
      picturePreview: null
    }));
  };

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      showToast('error', 'Please enter a full name');
      return;
    }

    setUploading(true);
    
    try {
      let imageUrl = null;

      // Upload image if a new file is selected
      if (formData.picture) {
        try {
          imageUrl = await uploadImage(formData.picture, 'members');
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          showToast('error', 'Error uploading image. Please try again.');
          setUploading(false);
          return;
        }
      }

      const memberData = {
        name: formData.fullName.trim(),
        role: formData.role,
        role_type: formData.role,
        image_url: imageUrl,
        description: formData.bikeType
      };

      if (editingMember) {
        // Update existing member
        await updateMember(editingMember.id, {
          ...memberData,
          image_url: imageUrl || editingMember.image_url,
          description: formData.bikeType
        });
        showToast('success', 'Member updated successfully!');
      } else {
        // Create new member
        await createMember(memberData);
        showToast('success', 'Member added successfully!');
      }
      
      // Refresh members list
      const data = await getMembers();
      setMembers(data || []);
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating member:', error);
      const errorMessage = error?.message || 'Error creating member. Please try again.';
      showToast('error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMember(null);
    setFormData({
      fullName: '',
      picture: null,
      picturePreview: null,
      role: 'Rider',
      bikeType: 'Road Bike'
    });
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    // Extract bike type from description if it exists
    const bikeType = member.description === 'MTB' || member.description === 'Mountain Bike' 
      ? 'MTB' 
      : member.description === 'Road Bike' 
        ? 'Road Bike' 
        : 'Road Bike'; // default
    
    setFormData({
      fullName: member.name || '',
      picture: null,
      picturePreview: member.image_url || null,
      role: member.role_type || member.role || 'Rider',
      bikeType: bikeType
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (member) => {
    setDeleteTarget(member);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMember(deleteTarget.id);
      const data = await getMembers();
      setMembers(data || []);
      showToast('success', 'Member deleted successfully!');
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      showToast('error', 'Error deleting member. Please try again.');
    }
  };

  const filteredMembers = members.filter(member => {
    if (!member || !member.name) return false;
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <AdminLayout>
      {/* Toast Notification */}
      {toast.visible && (
        <div
            className={`fixed right-4 md:right-6 top-20 z-50 flex items-center gap-3 rounded-lg border px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold shadow-lg ${
            toast.type === 'success'
              ? 'border-green-400/60 bg-green-500/10 text-green-700 dark:text-green-200'
              : 'border-red-400/60 bg-red-500/10 text-red-700 dark:text-red-200'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p>{toast.message}</p>
        </div>
      )}

      <main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background-light dark:bg-background-dark pb-4 md:pb-6 mb-4 md:mb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between items-start sm:items-center gap-3 md:gap-4">
                <h1 className="text-gray-900 dark:text-white text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">Member Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-48 md:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">search</span>
                    <input
                      className="w-full h-10 px-10 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm focus:ring-primary focus:border-primary"
                      placeholder="Search members..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-gray-900 dark:text-[#1e2210] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-600 transition-colors"
                  >
                    <span className="truncate">Add New Member</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                <p className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal">Total Members</p>
                <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">{members.length}</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((skeleton) => (
                  <div key={skeleton} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="relative pt-20 bg-gray-200 dark:bg-gray-700 shimmer-bg"></div>
                    <div className="flex-grow p-4 pt-16 text-center space-y-2">
                      <div className="h-5 w-32 mx-auto rounded-full shimmer-bg" />
                      <div className="h-4 w-24 mx-auto rounded-full shimmer-bg" />
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-800 p-2 flex items-center justify-end">
                      <div className="flex gap-1">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <div className="w-5 h-5 rounded shimmer-bg" />
                        </div>
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <div className="w-5 h-5 rounded shimmer-bg" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No members found matching your search.' : 'No members found.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-sm"
                  >
                    <div className="relative h-28 bg-gradient-to-br from-white via-white to-gray-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900">
                      <img
                        alt={member.name || 'Member'}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-24 rounded-full border-4 border-white dark:border-gray-900 object-cover"
                        src={member.image_url || '/rcc1.png'}
                      />
                    </div>
                    <div className="flex-grow p-4 pt-16 text-center bg-white dark:bg-gray-900/60">
                      <h3 className="text-gray-900 dark:text-white text-lg font-bold">{member.name || 'Unknown'}</h3>
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary">
                          {member.role || member.role_type || 'Member'}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                          {member.description || member.bio || 'Bike'}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-800 p-2 flex items-center justify-end bg-white dark:bg-gray-900/60">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add New Member Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4 py-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-background-dark/95 p-4 md:p-6 shadow-[0_40px_140px_rgba(0,0,0,0.85)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-primary mb-1">MEMBER MANAGEMENT</p>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {editingMember ? 'Edit Member' : 'Add New Member'}
                </h2>
                <p className="text-white/60 text-sm">
                  {editingMember ? 'Update member information.' : 'Add a new member to the club.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="text-white/60 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="full-name">
                  Member Name
                </label>
                <input
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900 dark:text-white"
                  id="full-name"
                  name="fullName"
                  placeholder="Name"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member Picture</label>
                {formData.picturePreview ? (
                  <div className="relative mt-1 overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
                    <img
                      src={formData.picturePreview}
                      alt="Preview"
                      className="h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-3 top-3 rounded-full bg-red-500 p-2 text-white shadow-md hover:bg-red-600"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                ) : (
                  <div
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
                    onClick={() => document.getElementById('member-picture').click()}
                  >
                    <div className="space-y-1 text-center">
                      <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500">upload_file</span>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <p>Click to upload or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">JPG/PNG, max 30MB</p>
                    </div>
                  </div>
                )}
                <input
                  id="member-picture"
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="role">
                  Role
                </label>
                <select
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900 dark:text-white"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Founder">Founder</option>
                  <option value="Rider">Rider</option>
                  <option value="Captain">Captain</option>
                  <option value="Utility">Utility</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="bike-type">
                  Bike Type
                </label>
                <select
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900 dark:text-white"
                  id="bike-type"
                  name="bikeType"
                  value={formData.bikeType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Road Bike">Road Bike</option>
                  <option value="MTB">MTB</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-gray-900 dark:text-[#1e2210] font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                      {editingMember ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingMember ? 'Update Member' : 'Add Member'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-background-dark/95 px-6 py-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.85)]">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full border border-red-400/60 bg-red-500/15 text-red-400">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Delete member?</p>
                <p className="text-xs text-white/60">
                  This action cannot be undone. The member will be permanently removed.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-white/20 px-4 py-2 text-white/80 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 transition-colors"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Members;
