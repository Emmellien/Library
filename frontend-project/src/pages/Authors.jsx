import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Authors() {
  const { token } = useAuth();
  const [authors, setAuthors] = useState([]);
  
  // Form States
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [BirthDate, setBirthDate] = useState('');
  
  // Edit State tracking
  const [editingId, setEditingId] = useState(null);

  const fetchAuthors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/books/authors');
      const payload = await res.json();
      if (res.ok) setAuthors(payload.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { 
    fetchAuthors(); 
  }, []);

  // Helper to format dates nicely for the table view
  const formatDate = (dateString) => {
    if (!dateString) return 'Unspecified';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  };

  // Helper to pre-fill form for editing
  const handleEditClick = (author) => {
    setEditingId(author.AuthorId);
    setName(author.AuthorName);
    setCountry(author.Country || '');
    // Format date string to YYYY-MM-DD so HTML input type="date" can read it
    if (author.BirthDate) {
      setBirthDate(new Date(author.BirthDate).toISOString().split('T')[0]);
    } else {
      setBirthDate('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setCountry('');
    setBirthDate('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingId 
      ? `http://localhost:5000/api/books/authors/${editingId}`
      : 'http://localhost:5000/api/books/authors';
      
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ authorName: name, country, BirthDate })
      });

      if (res.ok) {
        handleCancelEdit();
        fetchAuthors();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            {editingId ? 'Edit Writer / Author' : 'Add Writer / Author'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Author Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Chinua Achebe" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Country</label>
              <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Nigeria" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">BirthDate</label>
              <input type="date" value={BirthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors">
                {editingId ? 'Update Author' : 'Save Author'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="w-full bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-200 transition-colors">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Authors List Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Registered Authors</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase">
                <tr>
                  <th className="p-4">Author ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">BirthDate</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {authors.map(author => (
                  <tr key={author.AuthorId} className="hover:bg-slate-50">
                    <td className="p-4 font-mono text-slate-400">#{author.AuthorId}</td>
                    <td className="p-4 font-semibold text-slate-900">{author.AuthorName}</td>
                    <td className="p-4 text-slate-500">{author.Country || 'Unspecified'}</td>
                    <td className="p-4 text-slate-500">{formatDate(author.BirthDate)}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEditClick(author)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}