import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Books() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Data State Filtering Controls
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalRecords: 0 });

  // Creation Modal View State Tracker Flags
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', isbn: '', categoryId: '', authorId: '1', 
    publishedYear: '2026', price: '', quantity: '5', shelf: ''
  });

  // Pull operational dataset records directly out from backend framework APIs
  const fetchBooks = async () => {
    try {
      const url = `http://localhost:5000/api/books?page=${page}&limit=5&search=${search}&categoryId=${selectedCategory}`;
      const res = await fetch(url);
      const payload = await res.json();
      if (res.ok) {
        setBooks(payload.data);
        setPagination(payload.pagination);
      }
    } catch (err) {
      console.error('API catalog sync execution failed:', err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, search, selectedCategory]);

  // Handle addition form submissions 
  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', isbn: '', categoryId: '', authorId: '1', publishedYear: '2026', price: '', quantity: '5', shelf: '' });
        fetchBooks(); // refresh active page trace views
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete inventory catalog entries record row handles
  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to drop this inventory record block reference?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Physical Stock Inventory Records</h2>
            <p className="text-sm text-slate-500">Search, filter, allocate shelf positions, and organize book metadata attributes.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            Add New Document Entity
          </button>
        </div>

        {/* Action Controls Filter Desk Matrix Block Layout Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search matching items by book title string, internal ISBN reference, or author indexes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
          />
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
          >
            <option value="">Display All System Catalog Genres</option>
            <option value="1">Novel Collection Tier</option>
            <option value="2">Science & Laboratory Research</option>
            <option value="3">Technology & Computer Architecture</option>
            <option value="4">Historical Record Logs</option>
          </select>
        </div>

        {/* Core Presentation Data Matrix Tables */}
        <div className="overflow-x-auto rounded-xl border border-slate-150">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-150">
                <th className="p-4">Book Title & Metadata Details</th>
                <th className="p-4">ISBN Identifier</th>
                <th className="p-4">Genre Section</th>
                <th className="p-4">Available Qty</th>
                <th className="p-4">Position Allocation</th>
                <th className="p-4 text-rightFixed">Control Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {books.map((book) => (
                <tr key={book.BookId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{book.Title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Author Index Log: {book.AuthorName || 'Unknown Reference'}</div>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-600">{book.ISBN || 'N/A'}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      {book.CategoryName || 'Unassigned'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-semibold ${book.Quantity > 2 ? 'text-emerald-600' : 'text-amber-600 font-bold'}`}>
                      {book.Quantity} units
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">{book.Shelf || 'Floor Unallocated'}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleDeleteBook(book.BookId)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-xs font-semibold border border-transparent hover:border-red-100"
                    >
                      Scrub Record
                    </button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                    No active inventory dataset matches matching query trace arrays found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Analytical Pagination Footer System Rails */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-150">
          <div className="text-xs font-medium text-slate-500">
            Showing Page <span className="text-slate-800 font-semibold">{page}</span> of <span className="text-slate-800 font-semibold">{pagination.totalPages}</span> ({pagination.totalRecords} total records matching)
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
            >
              Previous View
            </button>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
            >
              Next View
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over input creation modal overlay form panel container */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transform scale-100 transition-all">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Book Catalog Entity</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            <form onSubmit={handleCreateBook} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Book Document Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">ISBN Number String</label>
                <input type="text" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category Classification Section</label>
                <select value={formData.categoryId} required onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none">
                  <option value="">Choose Genre</option>
                  <option value="1">Novel</option>
                  <option value="2">Science</option>
                  <option value="3">Technology</option>
                  <option value="4">History</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Acquisition Valuation (Price)</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Units Quantity Stocked</label>
                <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shelf Position Grid Reference</label>
                <input type="text" placeholder="e.g. A1, B3" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              <div className="col-span-2 flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">Commit Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}