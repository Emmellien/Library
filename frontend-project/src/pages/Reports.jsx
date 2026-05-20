import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Reports() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/transactions/reports-summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok) {
          setData(result);
        }
      } catch (err) {
        console.error('Failed to load summary analytics reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [token]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64 text-slate-500 font-medium text-sm">
          Compiling system-wide operational database matrices...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">System Management Analytics</h2>
        <p className="text-sm text-slate-500">View real-time totals, category breakdowns, and system alerts.</p>
      </div>

      {/* Top Level Numeric KPI Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Books in Stock</div>
          <div className="text-3xl font-black text-slate-900 font-mono">{data?.summary.totalBooks}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Registered Patrons</div>
          <div className="text-3xl font-black text-slate-900 font-mono">{data?.summary.totalMembers}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active Loans Out</div>
          <div className="text-3xl font-black text-blue-600 font-mono">{data?.summary.activeLoans}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Penalties Collected</div>
          <div className="text-3xl font-black text-emerald-600 font-mono">${parseFloat(data?.summary.totalFinesCollected).toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Category Share Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-md font-bold text-slate-900 mb-4">Stock Breakdown by Category</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase">
                <tr>
                  <th className="p-3">Category Genre</th>
                  <th className="p-3 text-center">Unique Titles</th>
                  <th className="p-3 text-center">Total Physical Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {data?.categoryDistribution.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/60">
                    <td className="p-3 text-slate-900">{row.CategoryName}</td>
                    <td className="p-3 text-center text-slate-500 font-mono">{row.BookCount}</td>
                    <td className="p-3 text-center text-slate-700 font-mono">{row.TotalStock} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overdue Warning Board */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-md font-bold text-slate-900 mb-4 text-rose-700 flex items-center gap-2">
            ⚠️ Attention Required: Critical Overdue Loans
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-rose-50/60 text-rose-900 font-bold text-xs uppercase">
                <tr>
                  <th className="p-3">Borrower Name</th>
                  <th className="p-3">Book Document Title</th>
                  <th className="p-3 text-right">Target Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {data?.overdueItems.map((item) => (
                  <tr key={item.BorrowId} className="hover:bg-rose-50/20 text-rose-900">
                    <td className="p-3 font-semibold">{item.MemberName}</td>
                    <td className="p-3 text-slate-700">{item.BookTitle}</td>
                    <td className="p-3 text-right font-mono text-rose-600 font-bold">{item.ReturnDate}</td>
                  </tr>
                ))}
                {data?.overdueItems.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-slate-400 font-normal italic">
                      Excellent! There are currently no overdue books in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}