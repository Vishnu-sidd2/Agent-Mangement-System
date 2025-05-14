import Agent from '../models/Agent.js';
import { validationResult } from 'express-validator';

// Get all agents
export const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select('-password').sort({ createdAt: -1 });
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get agent by ID
export const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create agent
export const createAgent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, email, mobile, password } = req.body;
  
  try {
    // Check if agent with email already exists
    let agent = await Agent.findOne({ email });
    if (agent) {
      return res.status(400).json({ message: 'Agent with this email already exists' });
    }
    
    // Create new agent
    agent = new Agent({
      name,
      email,
      mobile,
      password
    });
    
    await agent.save();
    
    // Return agent without password
    const savedAgent = await Agent.findById(agent._id).select('-password');
    res.status(201).json(savedAgent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update agent
export const updateAgent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, email, mobile, password } = req.body;
  
  // Build agent object
  const agentFields = {};
  if (name) agentFields.name = name;
  if (email) agentFields.email = email;
  if (mobile) agentFields.mobile = mobile;
  if (password) agentFields.password = password;
  
  try {
    let agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Check if updating to an email that already exists
    if (email && email !== agent.email) {
      const emailExists = await Agent.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Agent with this email already exists' });
      }
    }
    
    // Update agent
    agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { $set: agentFields },
      { new: true }
    ).select('-password');
    
    res.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete agent
export const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    await Agent.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Agent removed' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};