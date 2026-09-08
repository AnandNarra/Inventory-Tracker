import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, AlertTriangle, ArrowUpDown, Package } from 'lucide-react';
import api from '../services/api';
import StockUpdateModal from '../components/StockUpdateModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');

  // Listen to searchParams changes so clicking sidebar links while already on the page updates it
  useEffect(() => {
    const queryStatus = searchParams.get('status') || 'All';
    if (queryStatus !== status) {
      setStatus(queryStatus);
      setPage(1);
    }
  }, [searchParams]);

  // Update URL when status changes from the dropdown
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setPage(1);
    if (newStatus === 'All') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', newStatus);
    }
    setSearchParams(searchParams);
  };
  
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?page=${page}&limit=10&search=${search}&category=${category}&status=${status}`);
      setProducts(data.data.products);
      setTotalPages(data.data.totalPages);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${productToDelete._id}`);
      setDeleteModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockModalOpen(true);
  };

  const handleStockUpdateSuccess = () => {
    setStockModalOpen(false);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link 
          to="/products/new" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <button type="submit" className="hidden">Search</button>
          </form>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <select 
              value={category} 
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Audio">Audio</option>
              <option value="Accessories">Accessories</option>
            </select>
            
            <select 
              value={status} 
              onChange={handleStatusChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading products...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center">
            <Package size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">No products found</p>
            <p className="text-sm">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  let statusText = 'In Stock';
                  let statusColor = 'bg-green-100 text-green-800';
                  
                  if (product.stock === 0) {
                    statusText = 'Out of Stock';
                    statusColor = 'bg-red-100 text-red-800';
                  } else if (product.stock <= product.lowStockThreshold) {
                    statusText = 'Low Stock';
                    statusColor = 'bg-orange-100 text-orange-800';
                  }

                  return (
                    <tr key={product._id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center mr-3">
                          {product.image?.url ? (
                            <img src={product.image.url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} className="text-gray-400" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </td>
                      <td className="px-6 py-4">{product.sku}</td>
                      <td className="px-6 py-4">{product.category}</td>
                      <td className="px-6 py-4">₹{product.price.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 font-medium">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link to={`/products/${product._id}`} className="text-gray-500 hover:text-gray-700" title="View">
                          <Eye size={18} className="inline" />
                        </Link>
                        <button onClick={() => openStockModal(product)} className="text-blue-500 hover:text-blue-700" title="Update Stock">
                          <RefreshCw size={18} className="inline" />
                        </button>
                        <Link to={`/products/${product._id}/edit`} className="text-indigo-500 hover:text-indigo-700" title="Edit">
                          <Edit size={18} className="inline" />
                        </Link>
                        <button onClick={() => confirmDelete(product)} className="text-red-500 hover:text-red-700" title="Delete">
                          <Trash2 size={18} className="inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            </span>
            <div className="space-x-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {stockModalOpen && selectedProduct && (
        <StockUpdateModal 
          product={selectedProduct} 
          onClose={() => setStockModalOpen(false)} 
          onSuccess={handleStockUpdateSuccess} 
        />
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-center text-gray-500 mb-6">
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
