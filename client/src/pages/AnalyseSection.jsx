import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AnalyseSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-100 border-t-[#6c63ff] rounded-full animate-spin" />
      </div>
    );

  if (!stats)
    return (
      <p className="text-gray-400 text-center py-16">Failed to load stats</p>
    );

  // Chart configuration data
  const weeklyChart = {
    labels: stats.weekly_clicks.map((d) =>
      new Date(d.date).toLocaleDateString('en', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    ),
    datasets: [
      {
        label: 'Clicks',
        data: stats.weekly_clicks.map((d) => d.clicks),
        backgroundColor: '#6c63ff',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="fade-in flex flex-col gap-5">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Links',
            value: stats.stats.total_links,
            icon: '🔗',
            bg: 'bg-indigo-50',
            color: 'text-[#6c63ff]',
          },
          {
            label: 'Total Clicks',
            value: stats.stats.total_clicks,
            icon: '👆',
            bg: 'bg-green-50',
            color: 'text-green-600',
          },
          {
            label: 'Active Links',
            value: stats.stats.active_links,
            icon: '✅',
            bg: 'bg-orange-50',
            color: 'text-orange-500',
          },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p className={`text-4xl font-bold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-800">
              📈 Clicks — Last 7 Days
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Total activity across all your links
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#6c63ff]">
              {stats.weekly_clicks.reduce((a, d) => a + d.clicks, 0)}
            </p>
            <p className="text-xs text-gray-400">this week</p>
          </div>
        </div>

        {stats.weekly_clicks.length > 0 ? (
          <Bar
            data={weeklyChart}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 },
                  grid: { color: '#f0f0f0' },
                },
                x: { grid: { display: false } },
              },
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-300">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">No clicks this week</p>
          </div>
        )}
      </div>

      {/* Top 3 Performing Links Leaderboard */}
      {stats.top_links.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            🏆 Top Performing Links
          </h3>
          <div className="flex flex-col gap-3">
            {stats.top_links.map((link, i) => {
              const max = stats.top_links[0].clicks || 1;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={link.id} className="flex items-center gap-4">
                  <span className="text-xl w-6 shrink-0">{medals[i]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {link.title || link.short_code}
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                      <div
                        className="bg-[#6c63ff] h-1.5 rounded-full transition-all"
                        style={{ width: `${(link.clicks / max) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#6c63ff]">
                      {link.clicks}
                    </p>
                    <p className="text-xs text-gray-400">clicks</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}