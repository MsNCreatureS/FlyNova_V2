'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { motion } from 'framer-motion';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    avatar_url: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          avatar_url: data.user.avatar_url || ''
        });
        if (data.user.avatar_url) {
          setAvatarPreview(data.user.avatar_url);
        }
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      showError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showError('Avatar image must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData({ ...formData, avatar_url: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);

      // Add avatar file or URL
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      } else if (formData.avatar_url) {
        formDataToSend.append('avatar_url', formData.avatar_url);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        success('Profile updated successfully! 🎉');
        
        // Update user state
        setUser(data.user);
        setAvatarFile(null);
        
        // Redirect to dashboard after 1.5s
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      showError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">✏️ Edit Profile</h1>
          <p className="text-slate-600">Update your personal information and avatar</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit}>
            {/* Avatar Section */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Profile Picture
              </label>
              
              <div className="flex items-center gap-6">
                {/* Current Avatar Preview */}
                <div className="flex-shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-slate-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-aviation-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-slate-200">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <div className="mb-3">
                    <label className="btn-primary cursor-pointer inline-block">
                      📤 Upload New Avatar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-3">
                    JPG, PNG, GIF or WebP. Max 5MB.
                  </p>

                  <div className="text-sm text-slate-600">
                    <p className="mb-1">Or use an external URL:</p>
                    <input
                      type="url"
                      value={formData.avatar_url}
                      onChange={(e) => {
                        setFormData({ ...formData, avatar_url: e.target.value });
                        setAvatarFile(null);
                        setAvatarPreview(e.target.value);
                      }}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-2 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                    />
                  </div>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview('');
                        setFormData({ ...formData, avatar_url: '' });
                      }}
                      className="mt-3 text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove Avatar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 mb-6"></div>

            {/* User Info (Read-only) */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-300 rounded-lg text-slate-600 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-300 rounded-lg text-slate-600 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:border-aviation-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={saving}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  '💾 Save Changes'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
