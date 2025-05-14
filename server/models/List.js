import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
});

const distributionSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  records: [recordSchema]
});

const listSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  totalRecords: {
    type: Number,
    default: 0
  },
  records: [recordSchema],
  distribution: [distributionSchema],
  distributedCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const List = mongoose.model('List', listSchema);

export default List;