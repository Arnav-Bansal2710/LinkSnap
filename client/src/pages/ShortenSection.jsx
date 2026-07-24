import { useState } from 'react';
import { createUrl } from '../services/api';

export default function ShortenSection() {
  const [form, setForm] = useState({
    original_url: '',
    custom_alias: '',
    title: '',
    expires_at: '',
    is_public: true,
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newLink, setNewLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const val =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNewLink(null);
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.custom_alias) delete payload.custom_alias;
      if (!payload.expires_at) delete payload.expires_at;
      if (!payload.title) delete payload.title;

      const res = await createUrl(payload);
      setNewLink(res.data.url);
      setForm({
        original_url: '',
        custom_alias: '',
        title: '',
        expires_at: '',
        is_public: true,
        password: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${import.meta.env.VITE_BASE_URL}/${newLink.short_code}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-1">
          Shorten a URL
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Paste your long URL and get a short link instantly
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Original URL */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
              Long URL *
            </label>
            <input
              type="url"
              name="original_url"
              placeholder="https://your-very-long-url.com/goes/here"
              value={form.original_url}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition"
            />
          </div>

          {/* Custom Alias + Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Custom Alias
              </label>
              <input
                type="text"
                name="custom_alias"
                placeholder="e.g. portfolio"
                value={form.custom_alias}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. My GitHub"
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition"
              />
            </div>
          </div>

          {/* Password + Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Password (optional)
              </label>
              <input
                type="password"
                name="password"
                placeholder="Protect with password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Expiry Date
              </label>
              <input
                type="datetime-local"
                name="expires_at"
                value={form.expires_at}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition"
              />
            </div>
          </div>

          {/* Public Toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              name="is_public"
              checked={form.is_public}
              onChange={handleChange}
              className="w-4 h-4 accent-[#6c63ff]"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">Public link</p>
              <p className="text-xs text-gray-400">
                Visible on your public profile
              </p>
            </div>
          </label>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#6c63ff] hover:bg-[#5a52d5] text-white rounded-xl font-semibold transition disabled:opacity-60 text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Shortening...
              </span>
            ) : (
              '✂️ Shorten URL'
            )}
          </button>
        </form>

        {/* Generated Result Box */}
        {newLink && (
          <div className="mt-5 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl fade-in">
            <p className="text-xs text-gray-400 mb-1">
              Your short link is ready
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[#6c63ff] font-bold text-sm truncate">
                {import.meta.env.VITE_BASE_URL}/{newLink.short_code}
              </p>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-[#6c63ff] text-white rounded-xl text-xs font-medium hover:bg-[#5a52d5] transition shrink-0"
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            {newLink.expires_at && (
              <p className="text-xs text-orange-400 mt-2">
                ⏰ Expires:{' '}
                {new Date(newLink.expires_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}