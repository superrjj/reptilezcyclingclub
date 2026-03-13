import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../AdminLayout';
import { getMembers, searchMembers, createMember, updateMember, deleteMember } from '../../../services/membersService';
import { uploadImage } from '../../../services/imageUploadService';
import { useTabVisibility } from '../../../hooks/useTabVisibility';
import { usePageMeta } from '../../../hooks/usePageMeta';

// ─── Circle Crop Modal ────────────────────────────────────────────────────────
const CircleCropModal = ({ imageSrc, onDone, onCancel }) => {
  const canvasRef = useRef(null);
  const [imgEl, setImgEl] = useState(null);
  const [circle, setCircle] = useState({ x: 0, y: 0, r: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImgEl(img);
      const size = Math.min(img.width, img.height) * 0.6;
      setCircle({
        x: img.width / 2,
        y: img.height / 2,
        r: size / 2,
      });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (!imgEl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = imgEl.width;
    canvas.height = imgEl.height;
    draw(canvas.getContext('2d'), imgEl, circle, canvas.width, canvas.height);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgEl, circle]);

  const draw = (ctx, img, c, cw, ch) => {
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0);
    // Dim outside circle
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, cw, ch);
    // Cut out the circle
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Redraw image inside circle only
    ctx.save();
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0);
    ctx.restore();
    // Circle border
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  const toCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const dist = (ax, ay, bx, by) => Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);

  const onMouseDown = (e) => {
    e.preventDefault();
    const pos = toCanvasCoords(e);
    const d = dist(pos.x, pos.y, circle.x, circle.y);
    if (d < circle.r) {
      setIsDragging(true);
      dragStart.current = { pos, circle: { ...circle } };
    }
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const pos = toCanvasCoords(e);
    const orig = dragStart.current.circle;
    const cw = imgEl?.width || 9999;
    const ch = imgEl?.height || 9999;
    const dx = pos.x - dragStart.current.pos.x;
    const dy = pos.y - dragStart.current.pos.y;
    setCircle(prev => ({
      ...prev,
      x: Math.max(orig.r, Math.min(cw - orig.r, orig.x + dx)),
      y: Math.max(orig.r, Math.min(ch - orig.r, orig.y + dy)),
    }));
  };

  // Adjust radius via slider, keeping circle within image bounds
  const handleRadiusChange = (newR) => {
    if (!imgEl) return;
    const cw = imgEl.width;
    const ch = imgEl.height;
    const clampedR = Math.max(30, Math.min(newR, circle.x, circle.y, cw - circle.x, ch - circle.y));
    setCircle(prev => ({ ...prev, r: clampedR }));
  };

  const maxR = imgEl ? Math.min(circle.x, circle.y, imgEl.width - circle.x, imgEl.height - circle.y) : 200;

  const onMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  const handleApply = () => {
    if (!imgEl) return;
    const size = Math.round(circle.r * 2);
    const out = document.createElement('canvas');
    out.width = size;
    out.height = size;
    const ctx = out.getContext('2d');
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      imgEl,
      circle.x - circle.r, circle.y - circle.r,
      circle.r * 2, circle.r * 2,
      0, 0, size, size
    );
    try {
      out.toBlob((blob) => {
        const file = new File([blob], 'cropped.png', { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        onDone({ url, file });
      }, 'image/png');
    } catch (err) {
      console.error('Canvas export failed:', err);
      // Fallback: pass the original src if canvas is tainted
      fetch(imageSrc)
        .then(r => r.blob())
        .then(blob => {
          const file = new File([blob], 'cropped.png', { type: 'image/png' });
          const url = URL.createObjectURL(blob);
          onDone({ url, file });
        })
        .catch(() => onCancel());
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-gray-900 font-bold text-base">Crop Profile Picture</h3>
            <p className="text-gray-500 text-xs mt-0.5">Drag to reposition • Use the slider to resize</p>
          </div>
          <button type="button" onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 p-4">
          {imgEl ? (
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[52vh] rounded-lg"
              style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onMouseDown}
              onTouchMove={onMouseMove}
              onTouchEnd={onMouseUp}
            />
          ) : (
            <div className="text-gray-400 text-sm">Loading image...</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 px-5 py-4 border-t border-gray-200 flex-shrink-0">
          {/* Size slider row */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleRadiusChange(circle.r - 10)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-lg font-bold flex-shrink-0"
            >
              −
            </button>
            <input
              type="range"
              min={30}
              max={maxR}
              value={Math.round(circle.r)}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="flex-1 h-2 rounded-full accent-primary cursor-pointer"
            />
            <button
              type="button"
              onClick={() => handleRadiusChange(circle.r + 10)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-lg font-bold flex-shrink-0"
            >
              +
            </button>
            <span className="text-xs text-gray-400 w-16 text-right flex-shrink-0">
              {Math.round(circle.r * 2)}px
            </span>
          </div>
          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="button" onClick={handleApply} className="rounded-lg bg-primary hover:bg-green-600 px-5 py-2 text-sm font-bold text-white shadow-sm">
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Members Component ────────────────────────────────────────────────────────
const Members = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ visible: false, type: '', message: '' });
  const [cropTarget, setCropTarget] = useState(null); // { url }
  const [formData, setFormData] = useState({
    fullName: '',
    picture: null,
    picturePreview: null,
    role: 'Rider',
    bikeType: 'Road Bike'
  });

  usePageMeta('Admin Members');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const searchQueryRef = useRef('');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      let data;
      const query = searchQueryRef.current;
      if (query) {
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
    fetchMembers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useTabVisibility(fetchMembers);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file (JPG, PNG, etc.)');
      if (e.target) e.target.value = '';
      return;
    }

    const maxSize = 30 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('error', 'Image size must be less than 30MB');
      if (e.target) e.target.value = '';
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      // Open crop modal immediately after selecting
      setCropTarget({ url, originalFile: file });
    } catch (error) {
      console.error('Error creating preview:', error);
      showToast('error', 'Error processing image. Please try again.');
      if (e.target) e.target.value = '';
    }
  };

  const handleCropDone = ({ url, file }) => {
    setFormData(prev => ({
      ...prev,
      picture: file,
      picturePreview: url,
    }));
    setCropTarget(null);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, picture: null, picturePreview: null }));
  };

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    setTimeout(() => { setToast((prev) => ({ ...prev, visible: false })); }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) { showToast('error', 'Please enter a full name'); return; }
    setUploading(true);
    try {
      let imageUrl = null;
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
        await updateMember(editingMember.id, {
          ...memberData,
          image_url: imageUrl || editingMember.image_url,
          description: formData.bikeType
        });
        showToast('success', 'Member updated successfully!');
      } else {
        await createMember(memberData);
        showToast('success', 'Member added successfully!');
      }

      const data = await getMembers();
      setMembers(data || []);
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating member:', error);
      showToast('error', error?.message || 'Error creating member. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCloseDialog = () => {
    if (formData.picturePreview && formData.picturePreview.startsWith('blob:')) {
      try { URL.revokeObjectURL(formData.picturePreview); } catch {}
    }
    setDialogOpen(false);
    setEditingMember(null);
    setFormData({ fullName: '', picture: null, picturePreview: null, role: 'Rider', bikeType: 'Road Bike' });
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    const bikeType = member.description === 'MTB' || member.description === 'Mountain Bike'
      ? 'MTB'
      : 'Road Bike';
    setFormData({
      fullName: member.name || '',
      picture: null,
      picturePreview: member.image_url || null,
      role: member.role_type || member.role || 'Rider',
      bikeType,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (member) => { setDeleteTarget(member); };

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
    return member.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AdminLayout>
      {/* Circle Crop Modal */}
      {cropTarget && (
        <CircleCropModal
          imageSrc={cropTarget.url}
          onDone={handleCropDone}
          onCancel={() => setCropTarget(null)}
        />
      )}

      {/* Toast */}
      {toast.visible && (
        <div className={`fixed right-4 top-20 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'border-green-700 bg-green-800 text-green-100' : 'border-red-400/60 bg-red-500/10 text-red-200'}`}>
          <span className="material-symbols-outlined text-xl">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <p>{toast.message}</p>
        </div>
      )}

      <main className="flex-1 flex flex-col bg-white h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white pb-4 md:pb-6 mb-4 md:mb-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between items-start sm:items-center gap-3 md:gap-4">
                <h1 className="text-gray-900 text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">Member Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-48 md:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                      className="w-full h-10 px-10 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 text-sm focus:ring-primary focus:border-primary"
                      placeholder="Search members..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-600 transition-colors"
                  >
                    <span className="truncate">Add New Member</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white shadow-sm">
                <p className="text-gray-600 text-base font-medium leading-normal">Total Members</p>
                <p className="text-gray-900 tracking-light text-3xl font-bold leading-tight">{members.length}</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((skeleton) => (
                  <div key={skeleton} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                    <div className="relative pt-20 bg-gray-200 shimmer-bg"></div>
                    <div className="flex-grow p-4 pt-16 text-center space-y-2">
                      <div className="h-5 w-32 mx-auto rounded-full shimmer-bg" />
                      <div className="h-4 w-24 mx-auto rounded-full shimmer-bg" />
                    </div>
                    <div className="border-t border-gray-200 p-2 flex items-center justify-end">
                      <div className="flex gap-1">
                        <div className="p-2 rounded-lg bg-gray-100"><div className="w-5 h-5 rounded shimmer-bg" /></div>
                        <div className="p-2 rounded-lg bg-gray-100"><div className="w-5 h-5 rounded shimmer-bg" /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? 'No members found matching your search.' : 'No members found.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-28 bg-gradient-to-br from-white via-white to-gray-100">
                      <img
                        alt={member.name || 'Member'}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-24 rounded-full border-4 border-white object-cover"
                        src={member.image_url || '/rcc1.png'}
                      />
                    </div>
                    <div className="flex-grow p-4 pt-16 text-center bg-white">
                      <h3 className="text-gray-900 text-lg font-bold">{member.name || 'Unknown'}</h3>
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary">
                          {member.role || member.role_type || 'Member'}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {member.description || member.bio || 'Bike'}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 p-2 flex items-center justify-end bg-white">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(member)} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button onClick={() => handleDeleteClick(member)} className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors">
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

      {/* Add / Edit Member Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4">
          <div className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 md:p-6 shadow-[0_40px_140px_rgba(0,0,0,0.35)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-primary mb-1">MEMBER MANAGEMENT</p>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 break-words">
                  {editingMember ? 'Edit Member' : 'Add New Member'}
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {editingMember ? 'Update member information.' : 'Add a new member to the club.'}
                </p>
              </div>
              <button type="button" onClick={handleCloseDialog} className="text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0" aria-label="Close dialog">
                <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="full-name">Member Name</label>
                <input
                  className="w-full bg-gray-100 border border-gray-300 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Picture</label>
                {formData.picturePreview ? (
                  <div className="flex flex-col items-center gap-3">
                    {/* Circle preview */}
                    <div className="relative">
                      <img
                        src={formData.picturePreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/30 shadow-md"
                      />
                      {/* Re-crop button */}
                      <button
                        type="button"
                        onClick={() => setCropTarget({ url: formData.picturePreview })}
                        className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-green-600"
                        title="Re-crop"
                      >
                        <span className="material-symbols-outlined text-base">crop</span>
                      </button>
                    </div>
                    <button type="button" onClick={removeImage} className="text-xs text-red-500 hover:text-red-600 font-medium">
                      Remove photo
                    </button>
                  </div>
                ) : (
                  <div
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
                    onClick={() => document.getElementById('member-picture').click()}
                  >
                    <div className="space-y-1 text-center">
                      <span className="material-symbols-outlined text-4xl text-gray-400">account_circle</span>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <p>Click to upload profile picture</p>
                      </div>
                      <p className="text-xs text-gray-500">JPG/PNG, max 30MB — will be cropped to circle</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">Role</label>
                <select
                  className="w-full bg-gray-100 border border-gray-300 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900"
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
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bike-type">Bike Type</label>
                <select
                  className="w-full bg-gray-100 border border-gray-300 rounded-md focus:ring-primary focus:border-primary px-4 py-2 text-gray-900"
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
                <button type="button" onClick={handleCloseDialog} className="flex-1 bg-gray-200 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
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
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white px-6 py-6 text-gray-900 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Delete member?</p>
                <p className="text-xs text-gray-500">This action cannot be undone. The member will be permanently removed.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 text-sm">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 transition-colors">
                <span className="material-symbols-outlined text-base">delete</span>Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Members;