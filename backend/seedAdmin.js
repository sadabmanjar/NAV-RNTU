const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

let mongoServer;

const connectDB = async () => {
  const isLocal = !process.env.MONGODB_URI || process.env.MONGODB_URI === 'local';
  
  if (isLocal) {
    console.log("Using local mongodb-memory-server for fallback...");
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'college_navigation',
        port: 27017,
      }
    });
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`MongoDB Memory Server connected locally at ${mongoUri}`);
    return true;
  } else {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Atlas connected successfully');
    return false;
  }
};

const seedAdmin = async () => {
  try {
    const isLocalServer = await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || (isLocalServer ? 'admin@example.com' : null);
    const adminPassword = process.env.ADMIN_PASSWORD || (isLocalServer ? 'adminpassword' : null);

    if (!adminEmail || !adminPassword) {
        console.log("Skipping admin seed. Please configure ADMIN_EMAIL and ADMIN_PASSWORD in .env");
        process.exit(1);
    }

    const adminExists = await Admin.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin already exists');
      if (isLocalServer) {
         console.log('Leaving memory server running... Press Ctrl+C to exit');
         require('fs').writeFileSync('.env', `MONGODB_URI=local\nJWT_SECRET=supersecretjwtkey123`);
         return; 
      }
      process.exit();
    }

    const admin = new Admin({
      email: adminEmail,
      password: adminPassword,
    });

    await admin.save();
    console.log(`Admin created successfully: ${adminEmail}`);
    if (isLocalServer) {
        console.log('Leaving memory server running... Press Ctrl+C to exit');
        return;
    }
    process.exit();
  } catch (error) {
    require('fs').writeFileSync('error.txt', error.stack || error.toString());
    console.error('Error seeding admin:', error);
    if (mongoServer) await mongoServer.stop();
    process.exit(1);
  }
};

seedAdmin();
