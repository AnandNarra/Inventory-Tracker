import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Package, RefreshCw } from 'lucide-react';
import api from '../services/api';
import StockUpdateModal from '../components/StockUpdateModal';

const LowStock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products/low-stock');
      setProducts(data.data);
    } catch (err) {
      setError('Failed to fetch low stock products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockModalOpen(true);
  };

  const handleStockUpdateSuccess = () => {
    setStockModalOpen(false);
    fetchLowStock();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Low Stock Products</h1>
          <p className="text-sm text-gray-500">Products nearing depletion (excluding out of stock)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading products...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center">
            <Package size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">All products are sufficiently stocked</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <div key={product._id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-orange-50/50 transition-colors">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center mr-4">
                    {product.image?.url ? (
                      <img src={product.image.url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Link to={`/products/${product._id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                      {product.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                  </div>
                </div>
                
                <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end gap-6 sm:gap-8 bg-orange-50 sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none border border-orange-100 sm:border-transparent">
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Threshold</p>
                    <p className="font-medium text-gray-700">{product.lowStockThreshold}</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-orange-600 uppercase font-semibold">Current Stock</p>
                    <p className="text-xl font-bold text-orange-600">{product.stock}</p>
                  </div>
                  
                  <button 
                    onClick={() => openStockModal(product)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 shadow-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    <RefreshCw size={16} />
                    <span className="hidden sm:inline">Restock</span>
                  </button>
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default LowStock;
