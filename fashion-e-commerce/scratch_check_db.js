const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://musarratchaudhary797_db_user:vvJ9qaPvFnJGGsKG@cluster0.kr1ud6l.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Count documents in products
    const productCount = await mongoose.connection.db.collection('products').countDocuments();
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    const orderCount = await mongoose.connection.db.collection('orders').countDocuments();
    
    console.log(`Database Stats:`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Orders: ${orderCount}`);
    
    if (productCount > 0) {
      const uniqueCategories = await mongoose.connection.db.collection('products').distinct('category');
      console.log('Unique Categories in Database:', uniqueCategories);
      
      for (const cat of uniqueCategories) {
        const count = await mongoose.connection.db.collection('products').countDocuments({ category: cat });
        console.log(`- Category "${cat}": ${count} products`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking DB:', error);
    process.exit(1);
  }
}

check();
