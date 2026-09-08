import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

const StockUpdateModal = ({ product, onClose, onSuccess }) => {
  const [type, setType] = useState('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Restock');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await api.patch(`/products/${product._id}/stock`, {
        type,
        quantity: Number(quantity),
        reason
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">
            {type === 'IN' ? 'Add Stock' : 'Remove Stock'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center">
            {product.image?.url && (
              <img src={product.image.url} alt={product.name} className="w-12 h-12 rounded object-cover mr-4 border border-gray-200" />
            )}
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-500">Current Stock: <span className="font-bold text-gray-900">{product.stock}</span></p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex rounded-lg shadow-sm">
              <button
                type="button"
                onClick={() => setType('IN')}
                className={`flex-1 py-2 text-sm font-medium rounded-l-lg border ${
                  type === 'IN' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 z-10' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Add Stock (IN)
              </button>
              <button
                type="button"
                onClick={() => setType('OUT')}
                className={`flex-1 py-2 text-sm font-medium rounded-r-lg border -ml-px ${
                  type === 'OUT' 
                    ? 'bg-orange-50 border-orange-200 text-orange-700 z-10' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Remove Stock (OUT)
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input 
                type="number" 
                min="1"
                required
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input 
                type="text" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                placeholder={type === 'IN' ? 'Purchase / Restock / Return' : 'Sale / Damaged / Return'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Previous Stock:</span>
                <span className="font-medium text-gray-900">{product.stock}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">{type === 'IN' ? 'Adding:' : 'Removing:'}</span>
                <span className={`font-medium ${type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                  {type === 'IN' ? '+' : '-'}{quantity || 0}
                </span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                <span className="font-medium text-gray-700">New Stock:</span>
                <span className="font-bold text-gray-900">
                  {type === 'IN' 
                    ? product.stock + (Number(quantity) || 0)
                    : Math.max(0, product.stock - (Number(quantity) || 0))
                  }
                </span>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg border border-transparent ${
                  type === 'IN' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : (type === 'IN' ? 'Add Stock' : 'Remove Stock')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockUpdateModal;
