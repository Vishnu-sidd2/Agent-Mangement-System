import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import { UploadCloud, FileSpreadsheet, Check, X, Download, Eye, User, Users } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const Lists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showDistribution, setShowDistribution] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [agents, setAgents] = useState([]);
  
  // Fetch lists and agents on mount
  useEffect(() => {
    fetchLists();
    fetchAgents();
    
    // Animation for the file cards
    gsap.from('.file-card', {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
      delay: 0.3
    });
  }, []);
  
  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/lists');
      setLists(res.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents');
      setAgents(res.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file extension
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExt)) {
      setError('Only CSV, XLSX, and XLS files are allowed.');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    setError('');
    
    try {
      await axios.post('/api/lists/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      fetchLists();
      e.target.value = null; // Reset file input
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleViewDistribution = async (listId) => {
    try {
      const res = await axios.get(`/api/lists/${listId}/distribution`);
      setSelectedList(res.data);
      setShowDistribution(true);
      
      // Animate the modal
      gsap.fromTo(
        '.distribution-modal',
        {
          y: 50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out'
        }
      );
    } catch (error) {
      console.error('Error fetching distribution:', error);
    }
  };
  
  const downloadCSV = async (listId, agentId = null) => {
    try {
      const endpoint = agentId 
        ? `/api/lists/${listId}/download/${agentId}` 
        : `/api/lists/${listId}/download`;
      
      const res = await axios.get(endpoint, { responseType: 'blob' });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `list-${listId}${agentId ? `-agent-${agentId}` : ''}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold">Lists</h1>
          
          <div>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700">
              <UploadCloud size={20} />
              <span>{uploading ? 'Uploading...' : 'Upload List'}</span>
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/20 p-3 text-red-300">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : lists.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <div
                key={list._id}
                className="file-card rounded-xl bg-gray-800/80 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="rounded-full bg-blue-500/20 p-3">
                    <FileSpreadsheet className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{list.filename}</h3>
                    <p className="text-sm text-gray-400">{formatDate(list.createdAt)}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Total Records</span>
                    <span className="font-semibold">{list.totalRecords}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Assigned Agents</span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Users size={16} className="text-gray-400" />
                      {list.distributedCount || 0}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDistribution(list._id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                  
                  <button
                    onClick={() => downloadCSV(list._id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-800/80 p-8 text-center backdrop-blur-sm">
            <p className="text-lg text-gray-300">No lists uploaded yet.</p>
            <p className="mt-2 text-gray-400">
              Upload a CSV, XLSX, or XLS file to get started.
            </p>
          </div>
        )}
      </main>
      
      {/* Distribution Modal */}
      {showDistribution && selectedList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowDistribution(false)}></div>
          
          <div className="distribution-modal relative w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-xl bg-gray-800 p-6 shadow-xl">
            <button
              onClick={() => setShowDistribution(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h2 className="mb-6 text-2xl font-bold">
              List Distribution: {selectedList.filename}
            </h2>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {selectedList.distribution.map((item) => {
                const agent = agents.find(a => a._id === item.agentId);
                
                return (
                  <div
                    key={item.agentId}
                    className="rounded-xl bg-gray-700/80 p-4 backdrop-blur-sm"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-full bg-blue-600/20 p-2">
                        <User className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {agent ? agent.name : 'Unknown Agent'}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {agent ? agent.email : item.agentId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Assigned Records</span>
                        <span className="font-semibold">{item.records.length}</span>
                      </div>
                    </div>
                    
                    {item.records.length > 0 && (
                      <div className="max-h-40 overflow-y-auto rounded bg-gray-800/70 p-2">
                        <ul className="space-y-1 text-sm">
                          {item.records.slice(0, 5).map((record, idx) => (
                            <li key={idx} className="truncate">
                              {record.firstName || 'N/A'} • {record.phone || 'N/A'}
                            </li>
                          ))}
                          {item.records.length > 5 && (
                            <li className="text-gray-400">
                              +{item.records.length - 5} more records
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    <button
                      onClick={() => downloadCSV(selectedList._id, item.agentId)}
                      className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                    >
                      <Download size={16} />
                      <span>Download Agent's List</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lists;