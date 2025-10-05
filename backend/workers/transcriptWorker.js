require('dotenv').config();
const connectDB = require('../config/database');
const { connectRedis } = require('../config/redis');
const { initQueue, processTranscriptJobs } = require('./transcriptQueue');

const startWorker = async () => {
  try {
    await connectDB();
    await connectRedis();
    initQueue();
    processTranscriptJobs();
    
    console.log('Transcript worker started successfully');
  } catch (error) {
    console.error('Failed to start transcript worker:', error);
    process.exit(1);
  }
};

startWorker();

process.on('SIGTERM', () => {
  console.log('Worker shutting down...');
  process.exit(0);
});
