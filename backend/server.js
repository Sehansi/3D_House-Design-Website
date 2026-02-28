const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Try to connect to MongoDB
let mongoConnected = false;
connectDB()
  .then((connected) => {
    mongoConnected = connected;
    console.log(mongoConnected ? 'MongoDB connected' : 'Using fallback storage');
  })
  .catch(() => {
    console.log('Using in-memory storage (MongoDB unavailable)');
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - Use fallback if MongoDB not available
setTimeout(() => {
  if (mongoConnected) {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/favorites', require('./routes/favorites'));
  } else {
    app.use('/api/auth', require('./routes/auth-fallback'));
    app.use('/api/favorites', require('./routes/favorites-fallback'));
  }
}, 1000);

app.use('/api/designs', require('./routes/designs'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/ai-designer', require('./routes/ai-designer'));
app.use('/api/furniture', require('./routes/furniture'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '3D House Design API is running',
    database: mongoConnected ? 'MongoDB' : 'In-Memory'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
