import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import ShortenSection from './ShortenSection';
import LinksSection from './LinksSection';
import AnalyseSection from './AnalyseSection';

const NAV = [
  { key: 'dashboard', icon: '✂️', label: 'Dashboard' },
  { key: 'links', icon: '🔗', label: 'My Links' },
  { key: 'analyse', icon: '📊', label: 'Analyse' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-56 bg-white shadow-sm flex flex-col sticky top-0 h-screen shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            <span className="text-lg font-bold text-gray-800">LinkSnap</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">URL Shortener</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left w-full ${
                active === item.key
                  ? 'bg-[#6c63ff] text-white shadow-md shadow-indigo-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#6c63ff] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full py-2 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              {NAV.find((n) => n.key === active)?.icon}{' '}
              {NAV.find((n) => n.key === active)?.label}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {active === 'dashboard' && 'Shorten a new URL'}
              {active === 'links' && 'Manage all your shortened links'}
              {active === 'analyse' && 'Track your link performance'}
            </p>
          </div>
        </div>

        {/* Dynamic Section View */}
        <div className="p-8">
          {active === 'dashboard' && <ShortenSection />}
          {active === 'links' && <LinksSection navigate={navigate} />}
          {active === 'analyse' && <AnalyseSection />}
        </div>
      </main>
    </div>
  );
}