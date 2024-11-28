// server.js
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
app.use(express.json());
app.use(cookieParser());

app.use('/images', express.static(path.join(__dirname, 'companyLogo')));
dotenv.config();

const cors=require("cors");


const allowedOrigins = [
  `${process.env.FRONT_URL1}`,  // First frontend URL
  `${process.env.FRONT_URL2}`   // Second frontend URL
];

app.use(cors({
  origin: (origin, callback) => {
    // Check if the origin is in the list of allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow request
    } else {
      callback(new Error('Not allowed by CORS')); // Block request
    }
  },
  credentials: true // Allow credentials (cookies, etc.)
}));


const Monument=require("./Monumentdata");



mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
});






app.use('/api/agency', Monument);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
