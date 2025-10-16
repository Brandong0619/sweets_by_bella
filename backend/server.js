const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Add basic error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware - Temporary permissive CORS for debugging
app.use(
  cors({
    origin: true, // Allow all origins temporarily
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  })
);

// Add CORS debugging middleware
app.use((req, res, next) => {
  console.log('CORS Debug:', {
    origin: req.headers.origin,
    method: req.method,
    url: req.url
  });
  
  // Manually set CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  console.log('Preflight request received:', req.headers.origin);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Sweets by Bella Backend API - Minimal Test Version" });
});

// Test endpoint to verify CORS is working
app.get("/test-cors", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.json({ 
    message: "CORS test successful", 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Test POST endpoint
app.post("/test-cors", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.json({ 
    message: "POST CORS test successful", 
    origin: req.headers.origin,
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🍪 Minimal test version - no external dependencies`);
  });
}

// Export for Vercel
module.exports = app;
