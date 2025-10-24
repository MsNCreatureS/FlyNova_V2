'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Download {
  id: number;
  va_id: number;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  download_count: number;
  uploaded_by_username: string;
  aircraft_name?: string;
  aircraft_icao?: string;
  created_at: string;
}

interface VAInfo {
  id: number;
  name: string;
  callsign: string;
  logo_url?: string;
}

export default function VADownloadsPage() {
  const params = useParams();
  const router = useRouter();
  const vaId = params?.id as string;

  const [va, setVA] = useState<VAInfo | null>(null);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    if (vaId) {
      fetchVAInfo();
      fetchDownloads();
    }
  }, [vaId]);

  const fetchVAInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/virtual-airlines/${vaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVA(data.virtualAirline);
      }
    } catch (error) {
      console.error('Failed to fetch VA info:', error);
    }
  };

  const fetchDownloads = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/downloads/${vaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDownloads(data.downloads || []);
      }
    } catch (error) {
      console.error('Failed to fetch downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadId: number, fileUrl: string) => {
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
    // Open file URL in new tab
    window.open(fileUrl, '_blank');
  };

  const filteredDownloads = selectedType === 'all'
    ? downloads
    : downloads.filter(d => d.file_type === selectedType);

  const fileTypes = ['livery', 'document', 'other'];

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'livery': return '🎨';
      case 'document': return '📄';
      case 'tracker': return '📡';
      default: return '📦';
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'livery': return 'bg-purple-100 text-purple-700';
      case 'document': return 'bg-green-100 text-green-700';
      case 'tracker': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-aviation-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading downloads...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-4 mb-4">
            {va?.logo_url && (
              <img src={va.logo_url} alt={va.name} className="w-16 h-16 object-contain" />
            )}
            <div>
              <h1 className="text-4xl font-bold text-slate-900">{va?.name} Downloads</h1>
              <p className="text-aviation-600 font-semibold text-lg">{va?.callsign}</p>
            </div>
          </div>
          <p className="text-slate-600 text-lg">
            Liveries, documents, and resources for {va?.name}
          </p>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Link
            href={`/va/${vaId}/pilot/dashboard`}
            className="inline-flex items-center text-aviation-600 hover:text-aviation-700 font-semibold"
          >
            ← Back to Pilot Dashboard
          </Link>
        </motion.div>

        {/* File Type Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                selectedType === 'all'
                  ? 'bg-aviation-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Files
            </button>
            {fileTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedType === type
                    ? 'bg-aviation-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {getFileTypeIcon(type)} {type === 'livery' ? 'Liveries' : type === 'document' ? 'Documents' : 'Other'}
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
          {filteredDownloads.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDownloads.map((download, index) => (
                <motion.div
                  key={download.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{download.title}</h3>
                      {download.aircraft_name && (
                        <p className="text-sm text-slate-500">
                          {download.aircraft_name} ({download.aircraft_icao})
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getFileTypeColor(download.file_type)}`}>
                      {getFileTypeIcon(download.file_type)} {download.file_type}
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
                    onClick={() => handleDownload(download.id, download.file_url)}
                    className="btn-primary w-full"
                  >
                    📥 Download
                  </button>

                  <p className="text-xs text-slate-400 mt-3 text-center">
                    Uploaded by {download.uploaded_by_username}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">📥</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Downloads Available</h3>
              <p className="text-slate-600 mb-6">
                {selectedType === 'all' 
                  ? 'This virtual airline hasn\'t uploaded any files yet'
                  : `No ${selectedType} files available at the moment`
                }
              </p>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Installation Guide</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">🎨 Installing Liveries</h3>
                <p className="text-slate-600 text-sm">
                  Download the livery package and extract it to your simulator's liveries folder. 
                  For specific instructions, refer to your aircraft addon documentation.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">📄 Documents</h3>
                <p className="text-slate-600 text-sm">
                  Documents may include SOPs, route guides, and training materials. 
                  Keep them handy for reference during your flights.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">🔗 External Links</h3>
                <p className="text-slate-600 text-sm">
                  Some downloads are hosted externally. Clicking download will open the external link in a new tab.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">❓ Need Help?</h3>
                <p className="text-slate-600 text-sm">
                  If you encounter any issues with downloads, please contact your VA administrators 
                  through the VA management page.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
