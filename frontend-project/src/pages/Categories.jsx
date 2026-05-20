import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Categories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/books/categories');
      const payload = await res.json();
      if (res.ok) setCategories(payload.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/books/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ categoryName: name, description: desc })
      });
      if (res.ok) {
        setName('');
        setDesc('');
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Category Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Add Book Genre / Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Science Fiction" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
              <textarea rows="3" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" placeholder="Brief description of shelf contents..."></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors">Save Category</button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Catalog Categories</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase">
                <tr>
                  <th className="p-4">Category ID</th>
                  <th className="p-4">Genre Name</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map(cat => (
                  <tr key={cat.CategoryId} className="hover:bg-slate-50">
                    <td className="p-4 font-mono text-slate-400">#{cat.CategoryId}</td>
                    <td className="p-4 font-semibold text-slate-900">{cat.CategoryName}</td>
                    <td className="p-4 text-slate-500">{cat.Description || 'No description added'}</td>
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