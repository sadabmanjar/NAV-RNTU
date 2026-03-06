const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Override c-ares DNS to use Google/Cloudflare — local router DNS (10.87.x.x)
// times out on SRV queries required by mongodb+srv:// protocol
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', require('./routes/authRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const startServer = async () => {
  try {
    const isLocal = !process.env.MONGODB_URI || process.env.MONGODB_URI === 'local';
    
    if (isLocal) {
        console.log("Using local mongodb-memory-server for fallback...");
        const { MongoMemoryServer } = require('mongodb-memory-server');
        // Keep it running on a static port to avoid random resets
        const mongoServer = await MongoMemoryServer.create({
            instance: {
                port: 27020,
                dbName: 'college_navigation'
            }
        });
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log(`MongoDB Memory Server connected at ${mongoUri}`);
    } else {
        await mongoose.connect(process.env.MONGODB_URI, {
            family: 4,                         // Force IPv4 — fixes Node.js c-ares SRV issue on Windows
            serverSelectionTimeoutMS: 10000,   // 10s to find a server
            connectTimeoutMS: 10000,           // 10s to establish connection
            retryWrites: true,
            maxPoolSize: 10,
        });
        console.log('✅ MongoDB Atlas connected successfully');
    }

    const PORT = 5001; // Force port 5001 to bypass Windows process caching
    app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
      
      try {
        const Admin = require('./models/Admin');
        
        const adminEmail = process.env.ADMIN_EMAIL || (isLocal ? 'admin@example.com' : null);
        const adminPassword = process.env.ADMIN_PASSWORD || (isLocal ? 'adminpassword' : null);

        if (adminEmail && adminPassword) {
            const adminExists = await Admin.findOne({ email: adminEmail });
            if (!adminExists) {
                const admin = new Admin({
                email: adminEmail,
                password: adminPassword,
                });
                await admin.save();
                console.log(`✅ Default Admin seeded: ${adminEmail}`);
            }
        }
      } catch (err) {
         console.error('Failed to auto-seed admin:', err.message);
      }
    });
  } catch (error) {
    console.error("Database Connection Error:", error);
    process.exit(1);
  }
};

startServer();
