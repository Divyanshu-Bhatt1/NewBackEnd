const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Agency = require('./models/agency'); // Import the Agency model

const crypto = require('crypto');
const multer = require('multer');
const path = require('path');


dotenv.config(); // Load environment variables

const router = express.Router(); // Initialize router

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Fallback for dev






// Define the multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'companyLogo/'); // Folder to store the images
  },
  filename: function (req, file, cb) {
    const randomNumber = crypto.randomInt(1000, 9999);
    const uniqueSuffix = `${req.body.agencyName}-${randomNumber}-${Date.now()}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`); // File name: agencyName-randomNumber-timestamp.extension
  }
});

// Define the file filter for image files
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png)'));
    }
  }
}).single('monumentLogo'); // Field name for file upload




// Register Route
router.post('/register', (req, res) => {
  console.log(req.file);
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ error: err.message });
    }

    // Extract other fields from the request
    const { agencyName,MonumentName, email, password,desc, contactNumber, ticketPrice,MonumentLogo,city,state,pincode,imageUrl,iframe} = req.body;



// Create the location object
const location1 = {
  city,
  state,
  zipCode:pincode,
};


    try {
      // Check if email is already registered
      const existingAgency = await Agency.findOne({ email });
      if (existingAgency) {
        return res.status(400).json({ error: 'Agency with this email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new agency with the uploaded file path
      const newAgency = new Agency({
        agencyName,
        MonumentName,
        email,
        password: hashedPassword,
        desc,
        contactNumber,
        ticketPrice,
        MonumentLogo, // Store the file name if uploaded
        location:location1,
        totalAvailableTicket:1000,
        totalRevenue:0,
        timing:"8 A.M. - 6 P.M.",
        imageUrl,
        guides:[],
        events:[],
        tickets:[],
        bookings:[],
        iframe
      });

      // Save to the database
      await newAgency.save();


      res.status(201).json({ message: 'OTP is sent to your email', agencyId: newAgency._id });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
});


router.post('/event-creation', async (req, res) => {
     
   // Extract the monument ID from the URL
    const {monumentId, eventName, totalTicketsAvailable, eventDate, eventTime, ticketPrice, description,audienceType,category} = req.body;
   
    try {
      // Find the agency (monument) by ID
      const monument = await Agency.findOne({_id:monumentId});
      if (!monument) {
        return res.status(404).json({ error: 'Agency (Monument) not found' });
      }
  
      // Create a new event linked to this agency
      const newEvent = new Event({
        eventName,
        MonumentId: monumentId, // Link the event to the monument
        eventTotalTicketsAvailable:totalTicketsAvailable,
        eventDate,
        eventTime,
        eventTicketPrice: ticketPrice,
        description,
        audience_type:audienceType,
        category
      });
  console.log(audienceType)
      // Save the event to the database
      const savedEvent = await newEvent.save();
  
      // Optionally, you can push the event ID to an events array in the monument if needed
      if (!monument.events) {
        monument.events = []; // Initialize if it doesn't exist
      }
      monument.events.push(savedEvent._id);
      await monument.save();
  
      res.status(201).json({
        message: 'Event created successfully',
        event: savedEvent,
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });


  
module.exports = router;
