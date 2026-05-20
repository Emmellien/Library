import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Authors() {
  const { token } = useAuth();
  const [authors, setAuthors] = useState([]);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');

  const fetchAuthors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/books/authors');
      const payload = await res.json();
      if (res.ok) setAuthors(payload.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAuthors(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/books/authors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ authorName: name, country })
      });
      if (res.ok) {
        setName('');
        setCountry('');
        fetchAuthors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Author Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Add Writer / Author</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Author Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Chinua Achebe" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Country</label>
              <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Nigeria" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors">Save Author</button>
          </form>
        </div>

        {/* Authors List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Registered Authors</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase">
                <tr>
                  <th className="p-4">Author ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {authors.map(author => (
                  <tr key={author.AuthorId} className="hover:bg-slate-50">
                    <td className="p-4 font-mono text-slate-400">#{author.AuthorId}</td>
                    <td className="p-4 font-semibold text-slate-900">{author.AuthorName}</td>
                    <td className="p-4 text-slate-500">{author.Country || 'Unspecified'}</td>
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