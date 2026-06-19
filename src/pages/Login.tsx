import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (email === 'test@example.com' && password === 'password123') {
      localStorage.setItem('auth_token', 'mock_token');
      navigate('/');
    } else {
      setError('Invalid credentials for dev mode. Use test@example.com / password123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 border-none transition-colors">
      <div className="max-w-md w-full p-8 bg-white dark:bg-neutral-800 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-2">Welcome Back</h1>
        <p className="text-center text-neutral-500 mb-8 font-medium">Log into Yusra Engineering Ai</p>
        
        {error && <div className="p-3 mb-6 bg-red-50 text-red-600 rounded-xl text-sm text-center" role="alert">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email</label>
            <input 
              type="email" 
              role="textbox"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white outline-none"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Password</label>
            <input 
              type="password" 
              role="textbox"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          Don't have an account? <Link to="/register" className="text-neutral-900 dark:text-white font-medium underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
