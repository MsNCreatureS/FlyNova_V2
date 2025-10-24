'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import NavBar from '@/components/NavBar';

interface VirtualAirline {
  id: number;
  name: string;
  callsign: string;
  iata_code?: string;
  icao_code?: string;
  logo_url?: string;
  description: string;
  member_count: number;
  owner_username: string;
  created_at: string;
}

export default function VirtualAirlinesPage() {
  const router = useRouter();
  const [virtualAirlines, setVirtualAirlines] = useState<VirtualAirline[]>([]);
  const [filteredVAs, setFilteredVAs] = useState<VirtualAirline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canCreateVA, setCanCreateVA] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    callsign: '',
    iata_code: '',
    icao_code: '',
    description: '',
    logo_url: '',
    contact_email: '',
    contact_discord: '',
    contact_other: '',
    primary_color: '#00c853',
    secondary_color: '#00a843',
    accent_color: '#00ff7f',
    text_on_primary: '#ffffff'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVirtualAirlines();
    checkCanCreateVA();
  }, []);

  useEffect(() => {
    const filtered = virtualAirlines.filter(va =>
      va.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      va.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      va.icao_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      va.iata_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVAs(filtered);
  }, [searchTerm, virtualAirlines]);

  const fetchVirtualAirlines = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines`);
      const data = await response.json();
      setVirtualAirlines(data.virtualAirlines || []);
      setFilteredVAs(data.virtualAirlines || []);
    } catch (error) {
      console.error('Failed to fetch VAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanCreateVA = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCanCreateVA(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        // Check if user already owns a VA
        const vaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines`);
        const vaData = await vaResponse.json();
        const ownsVA = vaData.virtualAirlines.some((va: VirtualAirline) => 
          va.owner_username === userData.user.username
        );
        setCanCreateVA(!ownsVA);
      }
    } catch (error) {
      console.error('Failed to check VA creation status:', error);
    }
  };

  const handleCreateVA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('callsign', formData.callsign);
      if (formData.icao_code) formDataToSend.append('icao_code', formData.icao_code);
      if (formData.iata_code) formDataToSend.append('iata_code', formData.iata_code);
      formDataToSend.append('description', formData.description);
      
      // Add contact information
      if (formData.contact_email) formDataToSend.append('contact_email', formData.contact_email);
      if (formData.contact_discord) formDataToSend.append('contact_discord', formData.contact_discord);
      if (formData.contact_other) formDataToSend.append('contact_other', formData.contact_other);
      
      // Add branding colors
      formDataToSend.append('primary_color', formData.primary_color);
      formDataToSend.append('secondary_color', formData.secondary_color);
      formDataToSend.append('accent_color', formData.accent_color);
      formDataToSend.append('text_on_primary', formData.text_on_primary);
      
      // Add logo file or URL
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      } else if (formData.logo_url) {
        formDataToSend.append('logo_url', formData.logo_url);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create VA');
      }

      // Success! Redirect to the new VA
      router.push(`/va/${data.virtualAirline.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Clear URL if file is selected
      setFormData({...formData, logo_url: ''});
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Virtual Airlines</h1>
              <p className="text-slate-600 text-lg">Browse and join virtual airlines from around the world</p>
            </div>
            
            {canCreateVA && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                ✈️ Create Your VA
              </button>
            )}
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, callsign, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-slate-300 focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </motion.div>

        {/* Virtual Airlines Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading virtual airlines...</p>
          </div>
        ) : filteredVAs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVAs.map((va, index) => (
              <motion.div
                key={va.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/va/${va.id}`} className="card block p-6 hover:scale-105 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{va.name}</h3>
                      <p className="text-aviation-600 font-semibold text-lg">{va.callsign}</p>
                      {(va.icao_code || va.iata_code) && (
                        <p className="text-sm text-slate-500 mt-1">
                          {va.icao_code && <span className="font-mono">{va.icao_code}</span>}
                          {va.icao_code && va.iata_code && <span className="mx-1">•</span>}
                          {va.iata_code && <span className="font-mono">{va.iata_code}</span>}
                        </p>
                      )}
                    </div>
                    {va.logo_url && (
                      <img src={va.logo_url} alt={va.name} className="w-16 h-16 object-contain" />
                    )}
                  </div>
                  
                  <p className="text-slate-600 mb-4 line-clamp-3 min-h-[4.5rem]">{va.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        👥 {va.member_count} {va.member_count === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                    <span className="text-aviation-600 font-semibold text-sm">View Details →</span>
                  </div>
                  
                  <p className="text-xs text-slate-400 mt-3">
                    Founded by {va.owner_username} • {new Date(va.created_at).toLocaleDateString()}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Virtual Airlines Found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'Be the first to create one!'}
            </p>
            {!searchTerm && canCreateVA && (
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Create Virtual Airline
              </button>
            )}
          </div>
        )}
      </main>

      {/* Create VA Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300"
          >
            <div className="p-6 border-b border-slate-300 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">Create Your Virtual Airline</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateVA} className="p-6 space-y-6 bg-slate-50">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Airline Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., FlyNova Airways"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Callsign *
                </label>
                <input
                  type="text"
                  required
                  value={formData.callsign}
                  onChange={(e) => setFormData({...formData, callsign: e.target.value})}
                  placeholder="e.g., FLYNOVA"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none transition-all"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    ICAO Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.icao_code}
                    onChange={(e) => setFormData({...formData, icao_code: e.target.value.toUpperCase()})}
                    placeholder="e.g., FNV"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    IATA Code
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={formData.iata_code}
                    onChange={(e) => setFormData({...formData, iata_code: e.target.value.toUpperCase()})}
                    placeholder="e.g., FN"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your virtual airline..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none resize-none transition-all"
                />
              </div>

              {/* Contact Information */}
              <div className="bg-aviation-50 p-6 rounded-lg border-2 border-aviation-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  📞 Contact Information
                  <span className="text-xs font-normal text-slate-500">(Optional)</span>
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Provide contact methods so pilots can reach you for questions, applications, or support.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      📧 Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      placeholder="contact@yourvirtualairline.com"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      💬 Discord Server
                    </label>
                    <input
                      type="text"
                      value={formData.contact_discord}
                      onChange={(e) => setFormData({...formData, contact_discord: e.target.value})}
                      placeholder="https://discord.gg/yourserver or YourServer#1234"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">Discord invite link or server name</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      🌐 Other Contact (WhatsApp, Telegram, etc.)
                    </label>
                    <input
                      type="text"
                      value={formData.contact_other}
                      onChange={(e) => setFormData({...formData, contact_other: e.target.value})}
                      placeholder="WhatsApp: +1234567890 or Telegram: @yourusername"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-slate-300">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Logo
                </label>
                
                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Upload from your computer</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-aviation-50 file:text-aviation-700 hover:file:bg-aviation-100 transition-all"
                    />
                    {logoPreview && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-600 mb-2">Preview:</p>
                        <img src={logoPreview} alt="Logo preview" className="h-20 w-auto" />
                      </div>
                    )}
                  </div>

                  {/* OR divider */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 border-t-2 border-slate-300"></div>
                    <span className="text-sm font-semibold text-slate-500">OR</span>
                    <div className="flex-1 border-t-2 border-slate-300"></div>
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Or paste an image URL</label>
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => {
                        setFormData({...formData, logo_url: e.target.value});
                        setLogoFile(null);
                        setLogoPreview('');
                      }}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all"
                      disabled={!!logoFile}
                    />
                  </div>
                </div>
              </div>

              {/* Branding Colors */}
              <div className="bg-white p-4 rounded-lg border-2 border-slate-300">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  🎨 Brand Colors
                </label>
                <p className="text-xs text-slate-600 mb-4">
                  Customize your airline's color scheme. These colors will be used throughout your VA dashboard.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Primary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        className="w-16 h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        placeholder="#00c853"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none font-mono text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Secondary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                        className="w-16 h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                        placeholder="#00a843"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none font-mono text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Accent Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.accent_color}
                        onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                        className="w-16 h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.accent_color}
                        onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                        placeholder="#00ff7f"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none font-mono text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Text on Primary</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.text_on_primary}
                        onChange={(e) => setFormData({...formData, text_on_primary: e.target.value})}
                        className="w-16 h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.text_on_primary}
                        onChange={(e) => setFormData({...formData, text_on_primary: e.target.value})}
                        placeholder="#ffffff"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-300 bg-white focus:border-aviation-500 focus:ring-2 focus:ring-aviation-200 outline-none font-mono text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mt-4 p-4 rounded-lg border-2 border-slate-200 bg-slate-50">
                  <p className="text-xs font-medium text-slate-700 mb-3">Preview:</p>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      style={{ 
                        backgroundColor: formData.primary_color,
                        color: formData.text_on_primary
                      }}
                      className="px-4 py-2 rounded-lg font-semibold text-sm"
                    >
                      Primary Button
                    </button>
                    <button
                      type="button"
                      style={{ 
                        backgroundColor: formData.secondary_color,
                        color: formData.text_on_primary
                      }}
                      className="px-4 py-2 rounded-lg font-semibold text-sm"
                    >
                      Secondary
                    </button>
                    <div 
                      style={{ backgroundColor: formData.accent_color }}
                      className="px-3 py-1 rounded text-white text-xs font-semibold"
                    >
                      Accent
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> You can only create ONE virtual airline. You can join unlimited other VAs as a member or admin.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Virtual Airline'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
