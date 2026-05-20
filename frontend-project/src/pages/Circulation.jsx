import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Circulation() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  
  // Transaction Form States
  const [borrowForm, setBorrowForm] = useState({ memberId: '', bookId: '', returnDate: '' });
  const [returnModal, setReturnModal] = useState({ isOpen: false, borrowId: null, fine: '0', conditionStatus: 'Good' });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Set default due date to 7 days from today
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    const defaultDueDate = today.toISOString().split('T')[0];
    setBorrowForm(prev => ({ ...prev, returnDate: defaultDueDate }));
  }, []);

  // Fetch complete operational lists
  const syncDeskData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [logsRes, booksRes, membersRes] = await Promise.all([
        fetch('http://localhost:5000/api/transactions/borrow-logs', { headers }),
        fetch('http://localhost:5000/api/books?limit=100'), // simplified catalog pull
        fetch('http://localhost:5000/api/members?limit=100', { headers })
      ]);

      const [logsData, booksData, membersData] = await Promise.all([
        logsRes.json(), booksRes.json(), membersRes.json()
      ]);

      if (logsRes.ok) setLogs(logsData.data);
      if (booksRes.ok) setBooks(booksData.data || []);
      if (membersRes.ok) setMembers(membersData.data || []);
    } catch (err) {
      showNotice('Critical system communication failure', 'error');
    }
  };

  useEffect(() => {
    syncDeskData();
  }, [token]);

  const showNotice = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Process Lending Submission
  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/transactions/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(borrowForm)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Lending constraint rejection');

      showNotice('Book successfully issued out to member', 'success');
      setBorrowForm(prev => ({ ...prev, memberId: '', bookId: '' }));
      syncDeskData();
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  // Process Return Settlement
  const handleReturnConfirm = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/transactions/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          borrowId: returnModal.borrowId,
          fine: parseFloat(returnModal.fine),
          conditionStatus: returnModal.conditionStatus
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Check-in transaction execution failure');

      showNotice('Book return cataloging logged completely', 'success');
      setReturnModal({ isOpen: false, borrowId: null, fine: '0', conditionStatus: 'Good' });
      syncDeskData();
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  return (
    <Layout>
      {/* Dynamic Status Notifications Banner */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border transition-all ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? '✅ Success: ' : '⚠️ System block: '} {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Check-out Terminal Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 h-fit">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Issue Document</h2>
            <p className="text-xs text-slate-500 mt-0.5">Allocate physical copies to registered network patrons.</p>
          </div>

          <form onSubmit={handleBorrowSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wider">Select Patron Network Member</label>
              <select
                required
                value={borrowForm.memberId}
                onChange={(e) => setBorrowForm({ ...borrowForm, memberId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
              >
                <option value="">-- Choose Account --</option>
                {members.map(m => (
                  <option key={m.MemberId} value={m.MemberId}>{m.FullName} ({m.Phone || 'No Contacts'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wider">Target Catalog Item</label>
              <select
                required
                value={borrowForm.bookId}
                onChange={(e) => setBorrowForm({ ...borrowForm, bookId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
              >
                <option value="">-- Select Book --</option>
                {books.map(b => (
                  <option key={b.BookId} value={b.BookId} disabled={b.Quantity < 1}>
                    {b.Title} [{b.Quantity} units left on {b.Shelf || 'Unassigned'}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 tracking-wider">Contractual Due Return Date</label>
              <input
                type="date"
                required
                value={borrowForm.returnDate}
                onChange={(e) => setBorrowForm({ ...borrowForm, returnDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-sm transition-colors"
            >
              Authorize Book Allocation
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Real-time Circulation Tracking Matrix */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Active Circulation Ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Tracks active distribution cycles, fines, and return verification logging.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/60">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4">Patron & Document Allocation</th>
                  <th className="p-4">Timeline Frames</th>
                  <th className="p-4">Circulation Status</th>
                  <th className="p-4 text-center">Desk Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.BorrowId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{log.BookTitle}</div>
                      <div className="text-xs text-slate-400 mt-0.5 font-medium">Patron Reference: {log.MemberName}</div>
                    </td>
                    <td className="p-4 text-xs font-medium space-y-1">
                      <div className="text-slate-600">Issued: {log.BorrowDate}</div>
                      <div className="text-slate-400">Target Due: <span className="font-semibold text-slate-700">{log.ReturnDate}</span></div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                        log.Status === 'Borrowed' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {log.Status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {log.Status === 'Borrowed' ? (
                        <button
                          onClick={() => setReturnModal({ isOpen: true, borrowId: log.BorrowId, fine: '0', conditionStatus: 'Good' })}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-2 rounded-lg font-semibold shadow-sm transition-all"
                        >
                          Process Return
                        </button>
                      ) : (
                        <div className="text-xs text-slate-400 font-medium italic">
                          Returned ({log.ReturnedDate})
                          {parseFloat(log.Fine) > 0 && <span className="block text-rose-600 font-bold">Fine Paid: ${log.Fine}</span>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400 font-medium">No active or historical transactional items recorded in database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL WINDOW: Check-in & Fine Processing Overlay */}
      {returnModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Return Settlement Center</h3>
              <button onClick={() => setReturnModal(prev => ({ ...prev, isOpen: false }))} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleReturnConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Document Check-In Condition</label>
                <select
                  value={returnModal.conditionStatus}
                  onChange={e => setReturnModal({ ...returnModal, conditionStatus: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="Good">Good (Perfect Condition)</option>
                  <option value="Damaged">Damaged (Requires Repair/Replacement)</option>
                  <option value="Late Return">Late Return (Enforce Penalty Assessment)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Fine Charges Imposed ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={returnModal.fine}
                  onChange={e => setReturnModal({ ...returnModal, fine: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-mono"
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReturnModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Commit Return Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}