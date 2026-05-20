import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Catalog() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/books'); // Assuming your get-all-books route
        const result = await res.json();
        if (res.ok) setBooks(result.data || []);
      } catch (err) {
        console.error('Error fetching catalog catalog data:', err);
      }
    };
    fetchCatalog();
  }, []);

  const handleRequestBook = async (bookId) => {
    setMessage({ text: '', isError: false });
    try {
      const res = await fetch('http://localhost:5000/api/transactions/request-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Submission failed');
      
      setMessage({ text: data.message, isError: false });
    } catch (err) {
      setMessage({ text: err.message, isError: true });
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Library Book Catalog</h2>
        <p className="text-sm text-slate-500">Browse available assets across shelves and request items directly from administrators.</p>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-xl text-sm font-semibold border ${
          message.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Grid Display Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <div key={book.BookId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            
            {/* Book Graphic Thumbnail */}
            <div className="h-48 bg-slate-100 flex items-center justify-center border-b border-slate-100 relative">
              {book.BookImage ? (
                <img src={book.BookImage} alt={book.Title} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <span className="block text-3xl mb-1">📖</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Preview Cover</span>
                </div>
              )}
              <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white font-mono text-xs px-2 py-0.5 rounded-md font-bold">
                Shelf {book.Shelf || 'N/A'}
              </span>
            </div>

            {/* Book Context Information Data Blocks */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-md line-clamp-1">{book.Title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 mb-2 font-medium">By {book.AuthorName || 'Unknown Author'}</p>
                <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg italic">
                  {book.Description || 'No plot abstract details provided for this volume item.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Availability</span>
                  <span className={`text-xs font-bold ${book.Quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {book.Quantity > 0 ? `${book.Quantity} Available Copies` : 'Out of Stock'}
                  </span>
                </div>
                
                <button
                  onClick={() => handleRequestBook(book.BookId)}
                  disabled={book.Quantity < 1}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold text-xs px-3 py-2 rounded-xl transition-colors"
                >
                  Request Book
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </Layout>
  );
}