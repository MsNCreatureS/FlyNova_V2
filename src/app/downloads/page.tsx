'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { motion } from 'framer-motion';

export default function DownloadsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">FlyNova-Acars</h1>
          <p className="text-slate-600 text-lg">
            Download the FlyNova-Acars tracker to start flying (Beta - MSFS 2020/2024 only)
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
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-3xl font-bold">📡 FlyNova-Acars</h2>
                <span className="px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-sm font-bold">
                  BETA
                </span>
              </div>
              <p className="text-aviation-100 text-lg mb-4">
                Connect your Microsoft Flight Simulator and track your flights in real-time
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
                  <span>Supports MSFS 2020 & MSFS 2024</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-yellow-300">⚠️</span>
                  <span className="text-yellow-100">Beta version - Windows only</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/flynova/tracker/releases/latest/download/FlyNova-Acars-Windows.exe"
                  className="bg-white text-aviation-600 px-6 py-3 rounded-lg font-semibold hover:bg-aviation-50 transition-colors inline-flex items-center gap-2"
                >
                  💻 Download for Windows (Beta)
                </a>
              </div>
              <p className="text-sm text-aviation-200 mt-4">
                ℹ️ Support for X-Plane and Prepar3D coming soon
              </p>
            </div>
            <div className="text-center">
              <img 
                src="/logo.png" 
                alt="FlyNova Logo" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto"
                onError={(e) => {
                  // Fallback to emoji if logo not found
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="text-8xl">✈️</div>';
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Getting Started with FlyNova-Acars</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">📥 Installation</h3>
                <p className="text-slate-600 text-sm">
                  Download FlyNova-Acars for Windows. The installation is quick and straightforward. 
                  Simply run the installer and follow the on-screen instructions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">🎮 Setup</h3>
                <p className="text-slate-600 text-sm">
                  Log in with your FlyNova account. FlyNova-Acars will automatically detect and connect to 
                  Microsoft Flight Simulator 2020 or 2024 when running.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">✈️ Start Flying</h3>
                <p className="text-slate-600 text-sm">
                  Book a flight through your virtual airline dashboard, then start your flight in MSFS. 
                  FlyNova-Acars will monitor everything automatically and submit your report when you land.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">⚠️ Beta Notice</h3>
                <p className="text-slate-600 text-sm">
                  FlyNova-Acars is currently in beta. Currently supports MSFS 2020/2024 on Windows only. 
                  Support for X-Plane, Prepar3D, and macOS/Linux is coming soon.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">❓ Need Help?</h3>
                <p className="text-slate-600 text-sm">
                  If you encounter any issues with FlyNova-Acars, please contact your virtual airline 
                  administrators or check the documentation for troubleshooting tips.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">📦 VA Downloads</h3>
                <p className="text-slate-600 text-sm">
                  Looking for liveries, documents, or other VA-specific files? Visit your virtual airline's 
                  downloads page from the VA dashboard.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
