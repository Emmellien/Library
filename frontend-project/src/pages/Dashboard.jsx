import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({ books: 0, borrowed: 0, members: 0 });

  useEffect(() => {
    const fetchDashboardContext = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/transactions/borrow-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok) {
          setLogs(result.data);
          
          // Generate quick structural tracking analytical indicators
          const totalBorrowed = result.data.filter(log => log.Status === 'Borrowed').length;
          const uniqueMembers = new Set(result.data.map(log => log.MemberId)).size;
          setMetrics({
            books: result.data.length,
            borrowed: totalBorrowed,
            members: uniqueMembers
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard records:', err);
      }
    };
    fetchDashboardContext();
  }, [token]);

  return (
    <Layout>
      {/* Workspace Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Overview Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time terminal workspace analytics and ledger reporting.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200/60 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700">
          Operator: <span className="text-slate-900 font-bold">{user?.fullName}</span> 
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-100">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Analytical KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 transition-all hover:shadow-md">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Circulation Volume</h4>
          <p className="text-4xl font-black text-slate-900 tracking-tight font-mono">{metrics.books}</p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Total historical logs processed</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-md shadow-blue-600/10 transition-all hover:shadow-lg">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-2">Active Loans Out</h4>
          <p className="text-4xl font-black text-white tracking-tight font-mono">{metrics.borrowed}</p>
          <p className="text-xs text-blue-100 mt-2 font-medium">Awaiting return condition verification</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 transition-all hover:shadow-md">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Active Patron Network</h4>
          <p className="text-4xl font-black text-slate-900 tracking-tight font-mono">{metrics.members}</p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Distinct active network borrowers</p>
        </div>
      </div>

      {/* Recent Distribution Actions Table Ledger */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Book Distribution Actions</h3>
        
        <div className="overflow-x-auto rounded-xl border border-slate-200/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Log ID</th>
                <th className="p-4">Patron Reference</th>
                <th className="p-4">Book Title</th>
                <th className="p-4">Loan Date</th>
                <th className="p-4">Target Due Date</th>
                <th className="p-4">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {logs.slice(0, 5).map((log) => (
                <tr key={log.BorrowId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-500">#{log.BorrowId}</td>
                  <td className="p-4 font-semibold text-slate-900">{log.MemberName}</td>
                  <td className="p-4 text-slate-700 font-medium">{log.BookTitle}</td>
                  <td className="p-4 text-slate-500 font-medium">{log.BorrowDate}</td>
                  <td className="p-4 text-slate-500 font-medium font-semibold">{log.ReturnDate}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                      log.Status === 'Borrowed' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {log.Status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-medium bg-slate-50/30">
                    No core circulation history found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}