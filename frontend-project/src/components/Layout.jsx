import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Define links and list exactly which roles are allowed to see them
  const navigation = [
    { name: 'Dashboard Workspace', path: '/dashboard', allowedRoles: ['admin', 'librarian', 'student', 'member'] },
    { name: 'Browse Catalog', path: '/catalog', allowedRoles: ['admin', 'librarian', 'student', 'member'] },
    { name: 'Manage Catalog', path: '/books', allowedRoles: ['admin', 'librarian'] },
    { name: 'Authors Portal', path: '/authors', allowedRoles: ['admin', 'librarian'] },
    { name: 'Categories Setup', path: '/categories', allowedRoles: ['admin', 'librarian'] },
    { name: 'Manage Members', path: '/members', allowedRoles: ['admin', 'librarian'] },
    { name: 'Circulation Desk', path: '/circulation', allowedRoles: ['admin', 'librarian'] },
    { name: 'Reports & Analytics', path: '/reports', allowedRoles: ['admin'] } // Only Admin can view reports!
  ];

  // Clean up role comparison strings
  const currentUserRole = user?.role?.toLowerCase() || 'student';

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans antialiased">
      {/* Sidebar Frame Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 left-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-md">L</div>
          <span className="text-lg font-black text-white tracking-tight">Library Hub</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 mt-4">
          {navigation
            .filter(item => item.allowedRoles.includes(currentUserRole))
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-2 mb-2 text-xs text-slate-500 font-medium truncate">
            Logged in as: <span className="text-slate-300 font-bold">{user?.fullName || 'User'}</span>
          </div>
          <button
            onClick={logout}
            className="w-full bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all border border-slate-700/50 hover:border-rose-900/30"
          >
            Exit Session
          </button>
        </div>
      </aside>

      {/* Main Panel Delivery Target Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}