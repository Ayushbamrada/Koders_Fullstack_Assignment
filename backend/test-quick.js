const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function quickTest() {
  console.log('🔍 Quick System Check...\n');
  
  // 1. Check Environment Variables
  console.log('1️⃣ Environment Variables:');
  console.log('   PORT:', process.env.PORT || '5000 (default)');
  console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
  console.log('   JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '✅ Set' : '❌ Missing');
  console.log('   FRONTEND_URL:', process.env.FRONTEND_URL);
  console.log('-'.repeat(50));
  
  // 2. Test MongoDB Connection
  console.log('2️⃣ Testing MongoDB Connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✅ MongoDB Connected');
    console.log('   📊 Database:', mongoose.connection.db.databaseName);
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('   📚 Collections:', collections.map(c => c.name).join(', ') || 'none');
    
    await mongoose.disconnect();
    console.log('   👋 Disconnected');
  } catch (err) {
    console.error('   ❌ MongoDB Error:', err.message);
  }
  console.log('-'.repeat(50));
  
  // 3. Test JWT Token Generation
  console.log('3️⃣ Testing JWT Functions...');
  try {
    const testId = '123456789012';
    const token = jwt.sign({ id: testId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('   ✅ Token generation & verification working');
    console.log('   🔑 Token expires:', new Date(decoded.exp * 1000).toLocaleString());
  } catch (err) {
    console.error('   ❌ JWT Error:', err.message);
  }
  console.log('-'.repeat(50));
  
  console.log('\n✅ Quick test complete!');
}

quickTest();