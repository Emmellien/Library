import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Books() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  
  // Data State Filtering Controls
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalRecords: 0 });

  // Modal View State Tracker Flags
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);

  const [formData, setFormData] = useState({
    title: '', isbn: '', categoryId: '', authorId: '', 
    publishedYear: '2026', price: '', quantity: '5', shelf: '',
    description: '', bookImage: ''
  });

  // Pull operational book dataset records directly out from backend framework APIs
  const fetchBooks = async () => {
    try {
      const url = `http://localhost:5000/api/books?page=${page}&limit=5&search=${search}&categoryId=${selectedCategory}`;
      const res = await fetch(url);
      const payload = await res.json();
      if (res.ok) {
        setBooks(payload.data || []);
        setPagination(payload.pagination || { totalPages: 1, totalRecords: 0 });
      }
    } catch (err) {
      console.error('API catalog sync execution failed:', err);
    }
  };

  // Sync Dropdown Options from Database Tables
  const fetchDropdownDependencies = async () => {
    try {
      const [catRes, autRes] = await Promise.all([
        fetch('http://localhost:5000/api/books/categories'),
        fetch('http://localhost:5000/api/books/authors')
      ]);
      const [catData, autData] = await Promise.all([catRes.json(), autRes.json()]);
      
      if (catRes.ok) setCategories(catData.data || []);
      if (autRes.ok) setAuthors(autData.data || []);
    } catch (err) {
      console.error('Failed to sync dropdown lookups:', err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, search, selectedCategory]);

  useEffect(() => {
    fetchDropdownDependencies();
  }, []);

  // Open modal for creation form routing setup
  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingBookId(null);
    setFormData({ 
      title: '', isbn: '', categoryId: '', authorId: '', 
      publishedYear: '2026', price: '', quantity: '5', shelf: '',
      description: '', bookImage: ''
    });
    setIsModalOpen(true);
  };

  // Open modal populated with data properties for edit routing actions
  const openEditModal = (book) => {
    setIsEditMode(true);
    setEditingBookId(book.BookId);
    setFormData({
      title: book.Title || '',
      isbn: book.ISBN || '',
      categoryId: book.CategoryId || '',
      authorId: book.AuthorId || '',
      publishedYear: book.PublishedYear || '2026',
      price: book.Price || '',
      quantity: book.Quantity || '0',
      shelf: book.Shelf || '',
      description: book.Description || '',
      bookImage: book.BookImage || ''
    });
    setIsModalOpen(true);
  };

  // Unified form submission processor
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditMode 
        ? `http://localhost:5000/api/books/${editingBookId}`
        : 'http://localhost:5000/api/books';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchBooks(); 
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Operation transaction failed.');
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
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Physical Stock Inventory Records</h2>
            <p className="text-xs sm:text-sm text-slate-500">Search, filter, allocate shelf positions, and organize book metadata attributes.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto text-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            Add New Document Entity
          </button>
        </div>

        {/* Action Controls Filter Matrix Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search matching items by title, ISBN, or authors..."
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
            {categories.map(c => (
              <option key={c.CategoryId} value={c.CategoryId}>{c.CategoryName}</option>
            ))}
          </select>
        </div>

        {/* Core Presentation Data Matrix Tables */}
        <div className="overflow-x-auto rounded-xl border border-slate-150">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-150">
                <th className="p-4">Cover</th>
                <th className="p-4">Book Title & Metadata Details</th>
                <th className="p-4">ISBN Identifier</th>
                <th className="p-4">Genre Section</th>
                <th className="p-4">Available Qty</th>
                <th className="p-4">Position Allocation</th>
                <th className="p-4 text-center">Control Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {books.map((book) => (
                <tr key={book.BookId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="h-12 w-9 rounded bg-slate-100 border overflow-hidden flex items-center justify-center text-[10px] text-slate-400 font-bold">
                      {book.BookImage ? (
                        <img src={book.BookImage} alt="" className="h-full w-full object-cover" />
                      ) : 'NO IMG'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900 line-clamp-1">{book.Title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Author: {book.AuthorName || 'Unknown Reference'}</div>
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
                  <td className="p-4 text-center flex justify-center gap-2">
                    <button 
                      onClick={() => openEditModal(book)}
                      className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold border border-transparent hover:border-blue-100"
                    >
                      Edit Info
                    </button>
                    <button 
                      onClick={() => handleDeleteBook(book.BookId)}
                      className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold border border-transparent hover:border-red-100"
                    >
                      Scrub
                    </button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                    No active inventory dataset matches your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-slate-150 gap-4">
          <div className="text-xs font-medium text-slate-500">
            Showing Page <span className="text-slate-800 font-semibold">{page}</span> of <span className="text-slate-800 font-semibold">{pagination.totalPages}</span> ({pagination.totalRecords} records)
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Previous View
            </button>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Next View
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Modal Form Overlay Panel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-auto">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {isEditMode ? 'Modify Catalog Entry' : 'Add Book Catalog Entity'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Book Document Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">ISBN Number String</label>
                <input type="text" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Published Year</label>
                <input type="text" value={formData.publishedYear} onChange={e => setFormData({...formData, publishedYear: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category Classification</label>
                <select value={formData.categoryId} required onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none">
                  <option value="">Choose Genre</option>
                  {categories.map(c => (
                    <option key={c.CategoryId} value={c.CategoryId}>{c.CategoryName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Author / Writer</label>
                <select value={formData.authorId} required onChange={e => setFormData({...formData, authorId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none">
                  <option value="">Choose Author</option>
                  {authors.map(a => (
                    <option key={a.AuthorId} value={a.AuthorId}>{a.AuthorName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Acquisition Price ($)</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Units Stocked</label>
                <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shelf Grid Position</label>
                <input type="text" placeholder="e.g. A1, C3" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Book Image URL Link</label>
                <input type="url" placeholder="https://example.com/cover.jpg" value={formData.bookImage} onChange={e => setFormData({...formData, bookImage: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-mono" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Abstract Plot Description</label>
                <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none" placeholder="Enter simple synopsis detail notes..."></textarea>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
                  {isEditMode ? 'Save Changes' : 'Commit Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}