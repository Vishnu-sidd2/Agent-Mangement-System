import List from '../models/List.js';
import Agent from '../models/Agent.js';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Papa from 'papaparse';
import xlsx from 'xlsx';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter for CSV, XLSX, and XLS
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
  const allowedExts = ['csv', 'xlsx', 'xls'];
  
  const fileExt = file.originalname.split('.').pop().toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'), false);
  }
};

// Configure multer upload
export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

// Parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Parse Excel file
const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(worksheet);
};

// Process uploaded file
export const processUploadedFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Parse file based on extension
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    let records;
    
    if (fileExt === 'csv') {
      records = await parseCSV(req.file.path);
    } else if (['xlsx', 'xls'].includes(fileExt)) {
      records = parseExcel(req.file.path);
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }
    
    // Validate records structure
    const validRecords = records.map(record => ({
      firstName: record.FirstName || record.firstname || record.FIRSTNAME || '',
      phone: record.Phone || record.phone || record.PHONE || '',
      notes: record.Notes || record.notes || record.NOTES || ''
    }));
    
    // Get all agents
    const agents = await Agent.find();
    
    if (agents.length === 0) {
      return res.status(400).json({ message: 'No agents available for distribution' });
    }
    
    // Create list record
    const list = new List({
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      totalRecords: validRecords.length,
      records: validRecords
    });
    
    // Distribute records among agents
    const agentCount = Math.min(agents.length, 5); // Use maximum 5 agents
    const recordsPerAgent = Math.floor(validRecords.length / agentCount);
    const remainder = validRecords.length % agentCount;
    
    const distribution = [];
    let currentIndex = 0;
    
    for (let i = 0; i < agentCount; i++) {
      // Calculate how many records this agent gets
      let agentRecordsCount = recordsPerAgent;
      if (i < remainder) {
        agentRecordsCount++; // Distribute the remainder
      }
      
      const agentRecords = validRecords.slice(currentIndex, currentIndex + agentRecordsCount);
      currentIndex += agentRecordsCount;
      
      distribution.push({
        agentId: agents[i]._id,
        records: agentRecords
      });
    }
    
    list.distribution = distribution;
    list.distributedCount = agentCount;
    
    await list.save();
    
    // Delete the uploaded file to save space
    fs.unlinkSync(req.file.path);
    
    res.status(201).json(list);
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Error processing file' });
  }
};

// Get all lists
export const getAllLists = async (req, res) => {
  try {
    const lists = await List.find().select('-records -distribution.records').sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get list distribution
export const getListDistribution = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    res.json({
      _id: list._id,
      filename: list.originalFilename,
      totalRecords: list.totalRecords,
      distribution: list.distribution
    });
  } catch (error) {
    console.error('Error fetching list distribution:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download full list as CSV
export const downloadList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Convert records to CSV
    const csv = Papa.unparse({
      fields: ['firstName', 'phone', 'notes'],
      data: list.records
    });
    
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', `attachment; filename="${list.originalFilename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Error downloading list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download agent's portion of list as CSV
export const downloadAgentList = async (req, res) => {
  try {
    const { id, agentId } = req.params;
    
    const list = await List.findById(id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Find agent's distribution
    const agentDistribution = list.distribution.find(
      dist => dist.agentId.toString() === agentId
    );
    
    if (!agentDistribution) {
      return res.status(404).json({ message: 'Agent distribution not found' });
    }
    
    // Convert records to CSV
    const csv = Papa.unparse({
      fields: ['firstName', 'phone', 'notes'],
      data: agentDistribution.records
    });
    
    // Get agent name
    const agent = await Agent.findById(agentId);
    const agentName = agent ? agent.name.replace(/\s+/g, '_') : 'agent';
    
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', `attachment; filename="${agentName}-${list.originalFilename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Error downloading agent list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};