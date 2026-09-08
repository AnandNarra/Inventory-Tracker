import React, { useState, useEffect } from 'react';
import { History, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../services/api';

const Inventory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('All');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/inventory/history?page=${page}&limit=15&type=${typeFilter}`);
      setTransactions(data.data.transactions);
      setTotalPages(data.data.totalPages);
    } catch (err) {
      setError('Failed to fetch inventory history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Inventory History</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex gap-4">
            <select 
              value={typeFilter} 
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Transactions</option>
              <option value="Stock In">Stock In</option>
              <option value="Stock Out">Stock Out</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading history...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center">
            <History size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">No inventory activity yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Previous</th>
                  <th className="px-6 py-3">Current</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-gray-100 mr-3 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {tx.productId?.image?.url ? (
                            <img src={tx.productId.image.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-400 text-xs">IMG</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tx.productId?.name || 'Deleted Product'}</p>
                          <p className="text-xs text-gray-500">{tx.productId?.sku || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {tx.type === 'IN' ? 'Stock In' : 'Stock Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className={`flex items-center ${tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'IN' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                        {tx.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4">{tx.previousStock}</td>
                    <td className="px-6 py-4 font-medium">{tx.newStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate" title={tx.reason}>{tx.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
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
    </div>
  );
};

export default Inventory;
