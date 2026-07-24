import { useState, useEffect } from 'react';
import { getUserUrls, deleteUrl, toggleUrl } from '../services/api';

export default function LinksSection({ navigate }) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    loadUrls();
  }, [page, search]);

  const loadUrls = async () => {
    try {
      setLoading(true);
      const res = await getUserUrls({ page, limit: 10, search });
      setUrls(res.data.urls);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (shortCode) => {
    navigator.clipboard.writeText(
      `${import.meta.env.VITE_BASE_URL}/${shortCode}`
    );
    setCopied(shortCode);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this link?')) return;
    await deleteUrl(id);
    loadUrls();
  };

  const handleToggle = async (id) => {
    await toggleUrl(id);
    loadUrls();
  };

  return (
    <div className="fade-in">
      {/* Search Bar */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="🔍 Search by title, URL or short code..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-lg px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition shadow-sm"
        />
      </div>

      {/* Links Data */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-100 border-t-[#6c63ff] rounded-full animate-spin" />
        </div>
      ) : urls.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <p className="text-4xl mb-3">🔗</p>
          <p className="font-semibold text-gray-700 mb-1">
            {search ? 'No links found' : 'No links yet'}
          </p>
          <p className="text-sm text-gray-400">
            {search
              ? 'Try a different search term'
              : 'Go to Dashboard to shorten your first URL'}
          </p>
        </div>
      ) : (
        <>
          {/* Table Headers */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 mb-2">
            <p className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Link
            </p>
            <p className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Short URL
            </p>
            <p className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Clicks
            </p>
            <p className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Status
            </p>
            <p className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
              Actions
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {urls.map((url) => (
              <div
                key={url.id}
                className="bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow grid md:grid-cols-12 gap-4 items-center"
              >
                {/* Title + Original URL */}
                <div className="md:col-span-4 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {url.title || url.short_code}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {url.original_url}
                  </p>
                </div>

                {/* Short URL */}
                <div className="md:col-span-3 min-w-0">
                  <p className="text-[#6c63ff] text-sm font-medium truncate">
                    /{url.short_code}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(url.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Clicks */}
                <div className="md:col-span-2">
                  <p className="text-sm font-bold text-gray-700">
                    {url.total_clicks}
                  </p>
                  <p className="text-xs text-gray-400">clicks</p>
                </div>

                {/* Status */}
                <div className="md:col-span-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      url.is_active
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {url.is_active ? 'On' : 'Off'}
                  </span>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex items-center gap-1 md:justify-end">
                  <button
                    onClick={() => handleCopy(url.short_code)}
                    title="Copy"
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-base"
                  >
                    {copied === url.short_code ? '✅' : '📋'}
                  </button>
                  <button
                    onClick={() => navigate(`/analytics/${url.id}`)}
                    title="Analytics"
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-base"
                  >
                    📊
                  </button>
                  <button
                    onClick={() => handleToggle(url.id)}
                    title="Toggle"
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-base"
                  >
                    {url.is_active ? '⏸️' : '▶️'}
                  </button>
                  <button
                    onClick={() => handleDelete(url.id)}
                    title="Delete"
                    className="p-2 hover:bg-red-50 rounded-lg transition text-base"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 shadow-sm"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                    page === p
                      ? 'bg-[#6c63ff] text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 shadow-sm"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}