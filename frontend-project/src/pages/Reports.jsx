import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Reports() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Professional Time Filtering State Controls
  const [timeRange, setTimeRange] = useState('all'); 

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Appends the chosen timeframe selector directly to your backend API execution pipeline
      const res = await fetch(`http://localhost:5000/api/transactions/reports-summary?range=${timeRange}`, {
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

  useEffect(() => {
    fetchReportData();
  }, [token, timeRange]);

  // Executive Native Print Engine Trigger
  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64 text-slate-500 font-medium text-sm">
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin"></span>
            Compiling system-wide operational database matrices...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* CRITICAL ENGINE STYLING: 
        We inject print configuration utilities into the global viewport. 
        When printing, it strips layouts, adds a clean invoice header title bar, and opens container widths.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: #fff !important; color: #000 !important; }
          nav, sidebar, .no-print, button, select { display: none !important; }
          .print-container { width: 100% !important; max-width: 100% !important; position: absolute; left: 0; top: 0; padding: 0 !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
          .print-header { display: flex !important; }
          .card-box { box-shadow: none !important; border: 1px solid #e2e8f0 !important; page-break-inside: avoid; }
        }
      `}} />

      <div className="print-container">
        {/* Print-Only Header Metadata Stamp (Hidden on Web browser displays) */}
        <div className="hidden print-header flex-col border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Audit Summary Ledger</h1>
          <div className="flex justify-between text-xs text-slate-500 font-mono mt-1">
            <div>Scope Metric Filter: <span className="font-bold uppercase text-slate-800">{timeRange} Report Scope</span></div>
            <div>Generated Timestamp: {new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Action Controls Filter Header Bar */}
        <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">System Management Analytics</h2>
            <p className="text-sm text-slate-500">View performance snapshots, stock layouts, and dynamic administrative risk tables.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Timeframe Controller Select Frame */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">Lifetime Accumulated (All)</option>
              <option value="daily">Daily Statements (Today)</option>
              <option value="weekly">Weekly Cycle (7 Days)</option>
              <option value="monthly">Monthly Audit (30 Days)</option>
            </select>

            {/* Print Trigger Action Button */}
            <button
              onClick={handlePrintReport}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
          </div>
        </div>

        {/* Top Level Numeric KPI Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-box bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Books in Stock</div>
            <div className="text-3xl font-black text-slate-900 font-mono">{data?.summary?.totalBooks ?? 0}</div>
          </div>
          <div className="card-box bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Registered Patrons</div>
            <div className="text-3xl font-black text-slate-900 font-mono">{data?.summary?.totalMembers ?? 0}</div>
          </div>
          <div className="card-box bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active Loans Out</div>
            <div className="text-3xl font-black text-blue-600 font-mono">{data?.summary?.activeLoans ?? 0}</div>
          </div>
          <div className="card-box bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Penalties Collected</div>
            <div className="text-3xl font-black text-emerald-600 font-mono">
              ${parseFloat(data?.summary?.totalFinesCollected || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Main Data Layout Grid Block split panels */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Category Share Table */}
          <div className="card-box bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 mb-4">Stock Breakdown by Category</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-150">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase border-b border-slate-150">
                  <tr>
                    <th className="p-3">Category Genre</th>
                    <th className="p-3 text-center">Unique Titles</th>
                    <th className="p-3 text-center">Total Physical Stock</th>
                  </tr>
                </thead >
                <tbody className="divide-y divide-slate-100 font-medium">
                  {data?.categoryDistribution?.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 text-slate-900">{row.CategoryName}</td>
                      <td className="p-3 text-center text-slate-500 font-mono">{row.BookCount}</td>
                      <td className="p-3 text-center text-slate-700 font-mono">{row.TotalStock} units</td>
                    </tr>
                  ))}
                  {(!data?.categoryDistribution || data.categoryDistribution.length === 0) && (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-slate-400">No logs for this time block window range.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overdue Warning Board */}
          <div className="card-box bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-rose-700 mb-4 flex items-center gap-2">
              ⚠️ Attention Required: Critical Overdue Loans
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-150">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-rose-50 text-rose-950 font-bold text-xs uppercase border-b border-rose-150">
                  <tr>
                    <th className="p-3">Borrower Name</th>
                    <th className="p-3">Book Document Title</th>
                    <th className="p-3 text-right">Target Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {data?.overdueItems?.map((item) => (
                    <tr key={item.BorrowId} className="hover:bg-rose-50/20 text-slate-900">
                      <td className="p-3 font-semibold text-rose-950">{item.MemberName}</td>
                      <td className="p-3 text-slate-600">{item.BookTitle}</td>
                      <td className="p-3 text-right font-mono text-rose-600 font-bold">{item.ReturnDate}</td>
                    </tr>
                  ))}
                  {(!data?.overdueItems || data.overdueItems.length === 0) && (
                    <tr>
                      <td colSpan="3" className="p-6 text-center text-slate-400 font-normal italic">
                        Excellent! There are currently no overdue entries tracked in this range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}