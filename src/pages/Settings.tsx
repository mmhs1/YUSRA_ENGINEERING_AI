import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, LogOut } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { dbClearQueuedMessages } from '../utils/idb';

export default function Settings() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const handleClearData = async () => {
    if (window.confirm("Are you sure you want to clear all local data?")) {
      await dbClearQueuedMessages();
      localStorage.removeItem('chat_history');
      alert("Local data cleared.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Chat</span>
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </header>

        <section className="bg-white dark:bg-neutral-800 rounded-3xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-lg">Appearance</h2>
              <p className="text-sm text-neutral-500">Toggle dark mode on or off.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={toggleDarkMode} />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-neutral-900 dark:peer-checked:bg-white"></div>
            </label>
          </div>
          
          <hr className="border-neutral-100 dark:border-neutral-700" />
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-lg text-red-600 dark:text-red-400">Clear Local Data</h2>
              <p className="text-sm text-neutral-500">Delete all cached queries and queued messages.</p>
            </div>
            <button 
              onClick={handleClearData}
              className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <hr className="border-neutral-100 dark:border-neutral-700" />
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-lg">Sign Out</h2>
              <p className="text-sm text-neutral-500">Log out of your account on this device.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </section>
      </div>
    </div>
  );
}
