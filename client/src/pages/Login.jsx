import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(form.email, form.password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="w-full max-w-md fade-in">

        {/* Logo */}
        <div className="text-center mb-7">
          <div className="text-5xl mb-2">🔗</div>
          <h1 className="text-2xl font-bold text-[#6c63ff]">LinkSnap</h1>
          <p className="text-gray-400 text-sm mt-1">
            Shorten, track and manage your links
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Welcome back 👋
          </h2>
          <p className="text-gray-400 text-sm mb-5">Login to your account</p>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { name:'email',    type:'email',    placeholder:'your@email.com' },
              { name:'password', type:'password', placeholder:'Your password'  },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                  {f.name}
                </label>
                <input
                  type={f.type}
                  name={f.name}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg
                             text-sm focus:outline-none focus:border-[#6c63ff]
                             focus:ring-2 focus:ring-[#6c63ff]/20 transition"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6c63ff] hover:bg-[#5a52d5] text-white
                         rounded-lg font-medium transition disabled:opacity-60 mt-1"
            >
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            No account?{' '}
            <Link to="/register" className="text-[#6c63ff] font-medium">
              Register free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;