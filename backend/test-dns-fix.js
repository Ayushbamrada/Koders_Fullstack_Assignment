const dns = require('dns');
const mongoose = require('mongoose');
require('dotenv').config();

// Force Node.js to use Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

console.log('🔧 Node.js DNS Servers configured:', dns.getServers());
console.log('📝 Connection string:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':***@'));

async function testConnection() {
  try {
    console.log('\n🔄 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected successfully!');
    
    // Get database info
    const db = mongoose.connection.db;
    const admin = db.admin();
    const serverInfo = await admin.serverInfo();
    console.log('📊 MongoDB version:', serverInfo.version);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📚 Existing collections:', collections.map(c => c.name).join(', ') || 'none');
    
    // Test write operation
    console.log('\n📝 Testing write operation...');
    const testCollection = db.collection('test_connection');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful' 
    });
    console.log('✅ Write successful');
    
    // Test read operation
    const doc = await testCollection.findOne({ test: true });
    console.log('✅ Read successful:', doc);
    
    // Clean up
    await testCollection.drop();
    console.log('🧹 Test collection cleaned up');
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.message.includes('querySrv') || error.message.includes('getaddrinfo')) {
      console.log('\n💡 This is a DNS resolution error. Try these solutions:');
      console.log('1. Use standard connection string (mongodb:// instead of mongodb+srv://)');
      console.log('2. Check if your network blocks MongoDB ports');
      console.log('3. Try using a mobile hotspot or different network');
    }
  }
}

testConnection();