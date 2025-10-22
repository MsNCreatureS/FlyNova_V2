'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { motion } from 'framer-motion';

interface Download {
  id: number;
  va_id: number;
  va_name: string;
  title: string;
  description: string;
  file_url: string;
  category: string;
  download_count: number;
  uploaded_by: string;
  created_at: string;
}

export default function DownloadsPage() {
  const router = useRouter();
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [myVAs, setMyVAs] = useState<any[]>([]);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get user's VAs
      if (token) {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const profileResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/profile/${userData.user.id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          const profileData = await profileResponse.json();
          setMyVAs(profileData.memberships || []);

          // Fetch downloads from all VAs
          const allDownloads: Download[] = [];
          for (const va of profileData.memberships) {
            const dlResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/downloads/${va.va_id}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (dlResponse.ok) {
              const dlData = await dlResponse.json();
              allDownloads.push(...dlData.downloads);
            }
          }
          setDownloads(allDownloads);
        }
      }
    } catch (error) {
      console.error('Failed to fetch downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadId: number, vaId: number, fileUrl: string) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Track download
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/downloads/${vaId}/${downloadId}/track`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Failed to track download:', error);
      }
    }
    // Open file in new tab
    window.open(fileUrl, '_blank');
  };

  const filteredDownloads = selectedCategory === 'all'
    ? downloads
    : downloads.filter(d => d.category === selectedCategory);

  const categories = ['Livery', 'Tracker', 'Documentation', 'Other'];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Downloads</h1>
          <p className="text-slate-600 text-lg">
            Liveries, tracker software, and resources from your virtual airlines
          </p>
        </motion.div>

        {/* Tracker Section - Featured */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-8 mb-8 aviation-gradient text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-3">📡 FlyNova Tracker</h2>
              <p className="text-aviation-100 text-lg mb-4">
                Connect your flight simulator and track your flights in real-time
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <span className="text-aviation-300">✓</span>
                  <span>Real-time flight tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-aviation-300">✓</span>
                  <span>Automatic flight report submission</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-aviation-300">✓</span>
                  <span>Supports MSFS, X-Plane, P3D</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/flynova/tracker/releases/latest/download/FlyNovaTracker-Windows.exe"
                  className="bg-white text-aviation-600 px-6 py-3 rounded-lg font-semibold hover:bg-aviation-50 transition-colors"
                >
                  💻 Download for Windows
                </a>
                <a
                  href="https://github.com/flynova/tracker/releases/latest/download/FlyNovaTracker-macOS.dmg"
                  className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
                >
                  🍎 Download for macOS
                </a>
              </div>
            </div>
            <div className="text-8xl">✈️</div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-aviation-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Downloads
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === category
                    ? 'bg-aviation-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Downloads Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading downloads...</p>
            </div>
          ) : filteredDownloads.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDownloads.map((download) => (
                <motion.div
                  key={download.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{download.title}</h3>
                      <p className="text-sm text-aviation-600 font-semibold">{download.va_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      download.category === 'Livery' ? 'bg-purple-100 text-purple-700' :
                      download.category === 'Tracker' ? 'bg-blue-100 text-blue-700' :
                      download.category === 'Documentation' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {download.category}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-3 min-h-[3.5rem]">
                    {download.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <span>📥 {download.download_count} downloads</span>
                    <span>{new Date(download.created_at).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => handleDownload(download.id, download.va_id, download.file_url)}
                    className="btn-primary w-full"
                  >
                    📥 Download
                  </button>

                  <p className="text-xs text-slate-400 mt-3 text-center">
                    Uploaded by {download.uploaded_by}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">📥</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Downloads Available</h3>
              <p className="text-slate-600 mb-6">
                {myVAs.length === 0
                  ? 'Join a virtual airline to access downloads'
                  : 'Your virtual airlines haven\'t uploaded any files yet'
                }
              </p>
              {myVAs.length === 0 && (
                <a href="/virtual-airlines" className="btn-primary">
                  Browse Virtual Airlines
                </a>
              )}
            </div>
          )}
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Need Help?</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">Installing Liveries</h3>
                <p className="text-slate-600 text-sm">
                  Extract the livery files to your simulator's liveries folder. Check your VA's documentation for specific instructions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">Tracker Setup</h3>
                <p className="text-slate-600 text-sm">
                  Download and install the tracker, then log in with your FlyNova account. The tracker will automatically connect to your simulator.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">File Issues?</h3>
                <p className="text-slate-600 text-sm">
                  If a download link is broken, please contact the virtual airline administrators through your VA's dashboard.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">Upload Files</h3>
                <p className="text-slate-600 text-sm">
                  VA Owners and Admins can upload files through the VA management dashboard. All file types are supported.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
