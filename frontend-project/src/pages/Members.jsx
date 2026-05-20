import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Members() {
  const { token } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalRecords: 0 });

  // Creation Modal Toggle & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', gender: 'Male', phone: '', email: '', address: ''
  });
  const [notice, setNotice] = useState('');

  const fetchMembers = async () => {
    try {
      const url = `http://localhost:5000/api/members?page=${page}&limit=5&search=${search}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payload = await res.json();
      if (res.ok) {
        setMembers(payload.data);
        setPagination(payload.pagination);
      }
    } catch (err) {
      console.error('Failed to synchronize member network:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, search, token]);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setNotice('');
    try {
      const res = await fetch('http://localhost:5000/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Registration rejected');

      setIsModalOpen(false);
      setFormData({ fullName: '', gender: 'Male', phone: '', email: '', address: '' });
      setPage(1);
      fetchMembers();
    } catch (err) {
      setNotice(err.message);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this member account profile?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/members/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Patron Network Registry</h2>
            <p className="text-sm text-slate-500">Monitor active library cardholders, handle registrations, and view contact profiles.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            Register New Patron
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search network members by name, registered email address string, or telephone index..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
          />
        </div>

        {/* Registry Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-150">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-150">
                <th className="p-4">Full Legal Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Gender</th>
                <th className="p-4">Residential Address</th>
                <th className="p-4">Registration Frame</th>
                <th className="p-4 text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {members.map((member) => (
                <tr key={member.MemberId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-semibold text-slate-900">{member.FullName}</td>
                  <td className="p-4 space-y-0.5">
                    <div className="text-slate-700 font-medium">{member.Email || 'No Email Logged'}</div>
                    <div className="text-xs text-slate-400 font-mono">{member.Phone || 'N/A'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                      member.Gender === 'Male' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {member.Gender}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">{member.Address || 'Not Stated'}</td>
                  <td className="p-4 text-xs text-slate-400 font-medium">{member.RegisteredDate || 'N/A'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteMember(member.MemberId)}
                      className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold border border-transparent hover:border-red-100"
                    >
                      Revoke Account
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                    No matching patron tracking references found in registry databases.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Controls */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-150">
          <div className="text-xs font-medium text-slate-500">
            Showing Page <span className="text-slate-800 font-semibold">{page}</span> of <span className="text-slate-800 font-semibold">{pagination.totalPages}</span> ({pagination.totalRecords} registered members)
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
            >
              Previous Set
            </button>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
            >
              Next Set
            </button>
          </div>
        </div>
      </div>

      {/* Creation Modal Window Popup Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Patron Membership Intake</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            {notice && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-xs font-semibold text-red-700 border border-red-100">
                {notice}
              </div>
            )}
            
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Legal Name</label>
                <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Jane Doe" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Gender Identification</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Decline to State</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Telephone Contact Number</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="0788000000" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address String</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="example@network.com" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Residential Address Location</label>
                <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none" placeholder="City, Sector..."></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">Register Card</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}