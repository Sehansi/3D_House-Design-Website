require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('\n🔄 Testing MongoDB connection...');
    console.log('Connection URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('\n✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🖥️ Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections:', collections.length > 0 ? collections.map(c => c.name).join(', ') : 'No collections yet');
    
    // Check for admin user
    const User = require('./models/User');
    const adminCount = await User.countDocuments({ role: 'Admin' });
    console.log('\n👤 Admin users in database:', adminCount);
    
    if (adminCount > 0) {
      const admin = await User.findOne({ role: 'Admin' });
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.fullName);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed - connection closed\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Is MongoDB running? (mongod or mongosh)');
    console.error('2. Check MONGODB_URI in .env file');
    console.error('3. Verify credentials if using MongoDB Atlas');
    console.error('\n');
    process.exit(1);
  }
}

testConnection();
