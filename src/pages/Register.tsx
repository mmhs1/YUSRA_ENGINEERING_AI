import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('auth_token', 'mock_token');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 border-none transition-colors">
      <div className="max-w-md w-full p-8 bg-white dark:bg-neutral-800 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-2">Create Account</h1>
        <p className="text-center text-neutral-500 mb-8 font-medium">Join Yusra Engineering Ai</p>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Full Name</label>
            <input 
              type="text" 
              role="textbox"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white outline-none"
              placeholder="Jane Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email</label>
            <input 
              type="email" 
              role="textbox"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white outline-none"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
          >
            Create Account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account? <Link to="/login" className="text-neutral-900 dark:text-white font-medium underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
