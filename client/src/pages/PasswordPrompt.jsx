import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PasswordPrompt = () => {
  const { code }        = useParams();
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/verify/${code}`,
        { password }
      );
      window.location.href = res.data.original_url;

    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect password');
      setLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gray-100 flex items-center
                    justify-center p-5">
      <div className="w-full max-w-sm fade-in">

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="text-xl font-bold text-gray-800">
            Password Protected Link
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Enter the password to access this link
          </p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-lg">
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3
                            rounded-lg mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium
                                text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter link password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 border border-gray-200
                           rounded-lg text-sm focus:outline-none
                           focus:border-[#6c63ff]
                           focus:ring-2 focus:ring-[#6c63ff]/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6c63ff] hover:bg-[#5a52d5]
                         text-white rounded-lg font-medium transition
                         disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30
                                   border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                '🔓 Access Link'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          🔗 Powered by LinkSnap
        </p>
      </div>
    </div>
  );
};

export default PasswordPrompt;