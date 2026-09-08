import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Layers, AlertTriangle, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../services/api';

const DashboardCard = ({ title, value, icon, colorClass, to }) => (
  <Link to={to} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow cursor-pointer block">
    <div className={`p-4 rounded-full ${colorClass} mr-4`}>
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-slate-200 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-slate-200 rounded col-span-2"></div><div className="h-2 bg-slate-200 rounded col-span-1"></div></div></div></div></div>;
  if (error) return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={<Package size={24} className="text-blue-600" />} 
          colorClass="bg-blue-100" 
          to="/products"
        />
        <DashboardCard 
          title="Total Stock" 
          value={stats.totalStock} 
          icon={<Layers size={24} className="text-green-600" />} 
          colorClass="bg-green-100" 
          to="/products"
        />
        <DashboardCard 
          title="Low Stock" 
          value={stats.lowStockProducts} 
          icon={<AlertTriangle size={24} className="text-orange-600" />} 
          colorClass="bg-orange-100" 
          to="/low-stock"
        />
        <DashboardCard 
          title="Out of Stock" 
          value={stats.outOfStockProducts} 
          icon={<XCircle size={24} className="text-red-600" />} 
          colorClass="bg-red-100" 
          to="/products?status=Out of Stock"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Inventory Activity</h2>
            <Link to="/inventory" className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</Link>
          </div>
          <div className="p-0">
            {stats.recentTransactions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No inventory activity yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Product</th>
                      <th className="px-6 py-3">Action</th>
                      <th className="px-6 py-3">Quantity</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentTransactions.map((tx) => (
                      <tr key={tx._id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{tx.productId?.name || 'Deleted Product'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {tx.type === 'IN' ? 'Stock In' : 'Stock Out'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center ${tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'IN' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                            {tx.quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
            <Link to="/low-stock" className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</Link>
          </div>
          <div className="p-6">
            {stats.lowStockItems.length === 0 ? (
              <div className="text-center text-gray-500 py-4">All products are sufficiently stocked.</div>
            ) : (
              <div className="space-y-4">
                {stats.lowStockItems.map((item) => (
                  <div key={item._id} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Threshold: {item.lowStockThreshold}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{item.stock}</p>
                      <p className="text-xs text-gray-500">Remaining</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
