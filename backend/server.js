require('dotenv').config();
const express = require('express');
const router = express.Router();
const cors = require('cors');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initQueue } = require('./workers/transcriptQueue');
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('./middleware/rateLimit');
const { optionalAuth } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const creatorRoutes = require('./routes/creator');
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');
const enrollmentRoutes = require('./routes/enrollment');
const certificateRoutes = require('./routes/certificates');

const app = express();



app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "Backend API is live 🚀", status: "ok" });
});


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(optionalAuth);
app.use(rateLimit);

app.use('/api/auth', authRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', lessonRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api/certificates', certificateRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    initQueue();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

