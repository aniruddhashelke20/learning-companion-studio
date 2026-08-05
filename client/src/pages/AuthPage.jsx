import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';

export default function AuthPage({ register = false }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { authenticate } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post(`/auth/${register ? 'register' : 'login'}`, form);
      authenticate(data);
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to continue.');
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-tr from-slate-100 via-slate-50 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 p-5">
      <section className="w-full max-w-md rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-8 shadow-xl shadow-slate-100/50 dark:shadow-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand dark:bg-indigo-600 text-white shadow-md shadow-brand/20">
            <BookOpen size={20} />
          </span>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            LearnLog
          </span>
        </div>
        
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {register ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {register ? 'Join as a learner and begin tracking your metrics.' : 'Sign in to access your dashboard and continue learning.'}
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 p-3.5 text-sm text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {register && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Name</label>
              <input
                required
                type="text"
                placeholder="Harvey Specter"
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-indigo-500/30 focus:border-brand dark:focus:border-indigo-500 transition-all"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
            <input
              required
              type="email"
              placeholder="harvey@learnlog.local"
              className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-indigo-500/30 focus:border-brand dark:focus:border-indigo-500 transition-all"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</label>
            <input
              required
              minLength="8"
              type="password"
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-indigo-500/30 focus:border-brand dark:focus:border-indigo-500 transition-all"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button className="mt-2 w-full rounded-xl bg-brand dark:bg-indigo-600 hover:bg-brand-hover dark:hover:bg-indigo-700 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/10 hover:shadow-brand/20 dark:shadow-none transition-all active:scale-[0.98]">
            {register ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {register ? 'Already have an account?' : 'New to LearnLog?'} {' '}
          <Link
            className="font-semibold text-brand dark:text-indigo-400 hover:underline"
            to={register ? '/login' : '/register'}
          >
            {register ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </section>
    </main>
  );
}
