import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import { Plus, Edit, Trash2, X, Check, Search } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Fetch agents on mount
  useEffect(() => {
    fetchAgents();
    
    // Animation for the agents list
    gsap.from('.agent-card', {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
      delay: 0.3
    });
  }, []);
  
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/agents');
      setAgents(res.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when field is updated
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+\d{1,4}\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must include country code (e.g. +1234567890)';
    }
    
    if (!editMode && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!editMode && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: ''
    });
    setErrors({});
    setEditMode(false);
    setCurrentId(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (editMode) {
        await axios.put(`/api/agents/${currentId}`, formData);
      } else {
        await axios.post('/api/agents', formData);
      }
      
      fetchAgents();
      setShowModal(false);
      resetForm();
      
    } catch (error) {
      console.error('Error saving agent:', error);
      const responseErrors = error.response?.data?.errors;
      
      if (responseErrors) {
        const formattedErrors = {};
        responseErrors.forEach(err => {
          formattedErrors[err.param] = err.msg;
        });
        setErrors(formattedErrors);
      }
    }
  };
  
  const handleEdit = (agent) => {
    setFormData({
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      password: '' // Don't populate password for security reasons
    });
    setEditMode(true);
    setCurrentId(agent._id);
    setShowModal(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await axios.delete(`/api/agents/${id}`);
        fetchAgents();
      } catch (error) {
        console.error('Error deleting agent:', error);
      }
    }
  };
  
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.mobile.includes(searchTerm)
  );
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold">Agents</h1>
          
          <div className="flex gap-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus size={20} />
              <span>Add Agent</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredAgents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <div
                key={agent._id}
                className="agent-card rounded-xl bg-gray-800/80 p-6 backdrop-blur-sm"
              >
                <h3 className="mb-2 text-xl font-semibold">{agent.name}</h3>
                <p className="mb-1 text-gray-300">{agent.email}</p>
                <p className="mb-4 text-gray-300">{agent.mobile}</p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(agent)}
                    className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(agent._id)}
                    className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-800/80 p-8 text-center backdrop-blur-sm">
            <p className="text-lg text-gray-300">
              {searchTerm ? 'No agents found matching your search.' : 'No agents added yet.'}
            </p>
          </div>
        )}
      </main>
      
      {/* Add/Edit Agent Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowModal(false)}></div>
          
          <div className="relative w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h2 className="mb-6 text-2xl font-bold">
              {editMode ? 'Edit Agent' : 'Add Agent'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border p-2.5 text-white focus:ring-blue-500 ${
                    errors.name ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border p-2.5 text-white focus:ring-blue-500 ${
                    errors.email ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700'
                  }`}
                  placeholder="agent@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border p-2.5 text-white focus:ring-blue-500 ${
                    errors.mobile ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700'
                  }`}
                  placeholder="+1234567890"
                />
                {errors.mobile && <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>}
              </div>
              
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  {editMode ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border p-2.5 text-white focus:ring-blue-500 ${
                    errors.password ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700'
                  }`}
                  placeholder="••••••"
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-600 bg-transparent px-4 py-2 font-medium text-white hover:bg-gray-700"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  <Check size={18} />
                  <span>{editMode ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;