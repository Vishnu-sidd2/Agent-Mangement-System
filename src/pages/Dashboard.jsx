import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { gsap } from 'gsap';
import { Users, FileText, LogOut, BarChart2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import StatCard from '../components/dashboard/StatCard';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalLists: 0,
    totalRecords: 0
  });
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    
    // Animate dashboard cards
    gsap.from('.stat-card', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out'
    });
    
    gsap.from('.dashboard-title', {
      y: -30,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out'
    });
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="dashboard-title text-3xl font-bold">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
          
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard 
                title="Total Agents" 
                value={stats.totalAgents} 
                icon={<Users />} 
                color="from-blue-600 to-blue-400"
                onClick={() => navigate('/agents')}
              />
              
              <StatCard 
                title="Total Lists" 
                value={stats.totalLists} 
                icon={<FileText />} 
                color="from-purple-600 to-purple-400"
                onClick={() => navigate('/lists')}
              />
              
              <StatCard 
                title="Total Records" 
                value={stats.totalRecords} 
                icon={<BarChart2 />} 
                color="from-emerald-600 to-emerald-400"
              />
            </div>
          )}
          
          <div className="mt-8 rounded-xl bg-gray-800/80 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
            <p className="text-gray-300">Your recent activity will appear here as you work with the system.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;