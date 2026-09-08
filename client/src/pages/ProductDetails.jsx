import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Edit, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, transRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/inventory/product/${id}`)
        ]);
        setProduct(productRes.data.data);
        setTransactions(transRes.data.data);
      } catch (err) {
        setError('Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading details...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!product) return <div className="p-10 text-center text-gray-500">Product not found</div>;

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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/products" className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
        </div>
        <Link to={`/products/${product._id}/edit`} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
          <Edit size={16} className="mr-2" />
          Edit Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-square bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100">
              {product.image?.url ? (
                <img src={product.image.url} alt={product.name} className="w-full h-full object-contain rounded-lg" />
              ) : (
                <Package size={100} className="text-gray-300" />
              )}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${statusColor}`}>
                  {statusText}
                </span>
                <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                <p className="text-gray-500 text-sm">{product.category}</p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm text-gray-500">SKU</p>
                <p className="font-medium text-gray-900">{product.sku}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="font-medium text-gray-900">{product.stock} units</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock Threshold</p>
                <p className="font-medium text-gray-900">{product.lowStockThreshold} units</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-900 whitespace-pre-wrap">{product.description || 'No description provided.'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <Link to={`/inventory?search=${product.sku}`} className="text-sm text-blue-600 font-medium hover:text-blue-800">View All in History</Link>
            </div>
            <div className="p-0">
              {transactions.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No transaction history for this product.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Quantity</th>
                        <th className="px-6 py-3">Balance</th>
                        <th className="px-6 py-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx._id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`flex items-center ${tx.type === 'IN' ? 'text-green-600' : 'text-orange-600'}`}>
                              {tx.type === 'IN' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                              {tx.quantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">{tx.newStock}</td>
                          <td className="px-6 py-4 text-gray-500 truncate max-w-[150px]">{tx.reason || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
