import Agent from '../models/Agent.js';
import List from '../models/List.js';

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // Count total agents
    const totalAgents = await Agent.countDocuments();
    
    // Count total lists
    const totalLists = await List.countDocuments();
    
    // Count total records across all lists
    const lists = await List.find().select('totalRecords');
    const totalRecords = lists.reduce((sum, list) => sum + (list.totalRecords || 0), 0);
    
    res.json({
      totalAgents,
      totalLists,
      totalRecords
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};