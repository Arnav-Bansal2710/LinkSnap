import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUrlAnalytics } from '../services/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { QRCodeSVG } from 'qrcode.react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, ArcElement,
  Tooltip, Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, ArcElement,
  Tooltip, Legend
);

const COLORS = ['#6c63ff','#a78bfa','#34d399','#f59e0b','#f87171'];

const Analytics = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [showQR,   setShowQR]   = useState(false);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      const res = await getUrlAnalytics(id);
      setData(res.data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const shortUrl = `${import.meta.env.VITE_BASE_URL}/${data.url.short_code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center
                    min-h-screen bg-gray-100 gap-3">
      <div className="w-10 h-10 border-4 border-indigo-100
                      border-t-[#6c63ff] rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading analytics...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-red-400 bg-red-50 px-6 py-4 rounded-xl">⚠️ {error}</p>
    </div>
  );

  const { url, analytics } = data;
  const shortUrl = `${import.meta.env.VITE_BASE_URL}/${url.short_code}`;

  const dailyChart = {
    labels: analytics.daily_clicks.map(d =>
      new Date(d.date).toLocaleDateString('en', { weekday:'short', month:'short', day:'numeric' })
    ),
    datasets: [{
      label: 'Clicks',
      data:  analytics.daily_clicks.map(d => d.clicks),
      backgroundColor: '#6c63ff',
      borderRadius: 6,
    }]
  };

  const browserChart = {
    labels:   analytics.browsers.map(b => b.browser),
    datasets: [{
      data:             analytics.browsers.map(b => b.count),
      backgroundColor:  COLORS,
      borderWidth:      0,
    }]
  };

  const deviceChart = {
    labels:   analytics.devices.map(d => d.device),
    datasets: [{
      data:             analytics.devices.map(d => d.count),
      backgroundColor:  ['#6c63ff', '#34d399', '#f59e0b'],
      borderWidth:      0,
    }]
  };

  const osChart = {
    labels:   analytics.os.map(o => o.os),
    datasets: [{
      data:             analytics.os.map(o => o.count),
      backgroundColor:  COLORS,
      borderWidth:      0,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between
                      items-center sticky top-0 z-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-[#6c63ff] text-sm font-medium hover:opacity-70 transition"
        >
          ← Dashboard
        </button>
        <h2 className="text-lg font-semibold text-gray-800">📊 Analytics</h2>
        <div />
      </nav>

      <div className="max-w-4xl mx-auto px-5 py-6 fade-in flex flex-col gap-5">

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-800 mb-1 truncate">
                {url.title || url.short_code}
              </h2>
              
                href={shortUrl}
                target="_blank"
                className="text-[#6c63ff] font-medium text-sm hover:underline"
              <a>
                {shortUrl}
              </a>
              <p className="text-xs text-gray-400 truncate mt-1">
                → {url.original_url}
              </p>
              {url.expires_at && (
                <p className="text-xs text-orange-400 mt-1">
                  ⏰ Expires: {new Date(url.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-indigo-50 text-[#6c63ff] rounded-xl
                           text-sm font-medium hover:bg-indigo-100 transition"
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="px-4 py-2 bg-indigo-50 text-[#6c63ff] rounded-xl
                           text-sm font-medium hover:bg-indigo-100 transition"
              >
                {showQR ? '❌ Hide QR' : '📷 QR Code'}
              </button>
            </div>
          </div>

          {showQR && (
            <div className="mt-5 flex flex-col items-center gap-3
                            p-6 bg-gray-50 rounded-2xl fade-in">
              <QRCodeSVG
                value={shortUrl}
                size={180}
                fgColor="#6c63ff"
                level="H"
                includeMargin
              />
              <p className="text-xs text-gray-400">
                Scan to visit {shortUrl}
              </p>
              <button
                onClick={() => {
                  const svg = document.querySelector('svg');
                  const blob = new Blob(
                    [svg.outerHTML],
                    { type:'image/svg+xml' }
                  );
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = `${url.short_code}-qr.svg`;
                  link.click();
                }}
                className="px-4 py-2 bg-[#6c63ff] text-white rounded-xl
                           text-sm font-medium hover:bg-[#5a52d5] transition"
              >
                ⬇️ Download QR
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-[#6c63ff] mb-1">
              {analytics.total_clicks}
            </p>
            <p className="text-xs text-gray-400">Total Clicks</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-[#6c63ff] mb-1">
              {analytics.daily_clicks.length}
            </p>
            <p className="text-xs text-gray-400">Active Days</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <p className="text-sm font-semibold text-[#6c63ff] mb-1">
              {analytics.last_clicked
                ? new Date(analytics.last_clicked).toLocaleDateString()
                : 'Never'
              }
            </p>
            <p className="text-xs text-gray-400">Last Clicked</p>
          </div>
        </div>

        {analytics.daily_clicks.length > 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              📈 Daily Clicks
            </h3>
            <Bar
              data={dailyChart}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { precision: 0 } }
                }
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-gray-400 text-sm">
              No clicks yet — share your link to see analytics
            </p>
          </div>
        )}

        {analytics.total_clicks > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">
                🌐 Browsers
              </h3>
              {analytics.browsers.length > 0
                ? <Doughnut data={browserChart} options={doughnutOptions} />
                : <p className="text-center text-gray-300 text-sm">No data</p>
              }
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">
                📱 Devices
              </h3>
              {analytics.devices.length > 0
                ? <Doughnut data={deviceChart} options={doughnutOptions} />
                : <p className="text-center text-gray-300 text-sm">No data</p>
              }
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">
                💻 Operating System
              </h3>
              {analytics.os.length > 0
                ? <Doughnut data={osChart} options={doughnutOptions} />
                : <p className="text-center text-gray-300 text-sm">No data</p>
              }
            </div>
          </div>
        )}

        {analytics.referrers.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              🔗 Top Referrers
            </h3>
            <div className="flex flex-col gap-2">
              {analytics.referrers.map((r, i) => {
                const max = analytics.referrers[0].count;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <p className="text-sm text-gray-600 w-32 truncate shrink-0">
                      {r.referrer === 'Direct' ? '🔗 Direct' : r.referrer}
                    </p>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-[#6c63ff] h-2 rounded-full transition-all"
                        style={{ width: `${(r.count / max) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 w-8 text-right">
                      {r.count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Analytics;