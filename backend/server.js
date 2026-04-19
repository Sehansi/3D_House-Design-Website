const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedAdminUser = require('./seeders/adminSeeder');

dotenv.config();

const app = express();

// Try to connect to MongoDB and setup routes
connectDB().then((connected) => {
  const mongoConnected = connected;
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

  // Dynamic Auth Routes based on DB status
  if (mongoConnected) {
    console.log('Using real MongoDB routes for Auth and Favorites');
    app.use('/api/auth', require('./routes/auth/auth'));
    app.use('/api/favorites', require('./routes/common/favorites'));
    // Auto-create admin account
    seedAdminUser();
  } else {
    console.log('Using fallback in-memory routes for Auth and Favorites');
    app.use('/api/auth', require('./routes/auth/auth-fallback'));
    app.use('/api/favorites', require('./routes/common/favorites-fallback'));
  }

  app.use('/api/designs', require('./routes/common/designs'));
  app.use('/api/gallery', require('./routes/common/gallery'));
  app.use('/api/contact', require('./routes/common/contact'));
  app.use('/api/ai-designer', require('./routes/common/ai-designer'));
  app.use('/api/furniture', require('./routes/common/furniture'));
  app.use('/api/admin', require('./routes/admin/admin'));
  app.use('/api/constructor', require('./routes/constructor/constructor'));
  app.use('/api/architect', require('./routes/architect/architect'));
  app.use('/api/meetings', require('./routes/common/meetings'));
  app.use('/api/deliveries', require('./routes/architect/deliveries'));
  app.use('/api/projects', require('./routes/architect/projects'));
  app.use('/api/constructor-requests', require('./routes/constructor/constructorRequests'));

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
}).catch((err) => {
  console.error("Critical server failure:", err);
});
