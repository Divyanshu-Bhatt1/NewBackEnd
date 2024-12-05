
const mongoose = require('mongoose');

const MonumentSchema = new mongoose.Schema({
  
  agencyName: {
    type: String,
    required: true
  },
  MonumentName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  desc:{
    type:String,
    // required:true
  }
  ,
  contactNumber: {
    type: String,
    required: true,
  },
  MonumentLogo: {
    type: String,
    default: '', // URL for the logo image
  },
  location: {
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
  },
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
totalAvailableTicket:{
   type:Number,
   default:1000
},
ticketPrice:{
  type:Number,
  default:100
},
totalRevenue:{
  type:Number,
  default:0
},
timing:{
  type: String
    // required: true,
},
  bookings: [
    {
      month: {
        type: String, // e.g., "2024-10" for October 2024
        required: true,
      },
      count: {
        type: Number,
        default: 0, // Default number of bookings for this month
      },
      monthlyRevenue:{
        type: Number,
        default: 0,
      }
    },
  ],
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket' // Reference to the Ticket model
  }],
  imageUrl:[
    {
      type:String
    }
  ],
  guides:[]
});

// Create a method to increment the booking count for a specific month
MonumentSchema.methods.incrementBookingCount = function(dateString, count) {
  // Extract year and month from the date string
  const date = new Date(dateString);
  const month = date.toLocaleString('default', { month: 'long' }); // e.g., "October"
  const year = date.getFullYear(); // e.g., 2024
  
  // Create the month string in "Month Year" format
  const monthYear = `${month} ${year}`;

  const existingBooking = this.bookings.find(booking => booking.month === monthYear);
  
  if (existingBooking) {
    existingBooking.count += count; // Increment the count by the specified number
  } else {
    this.bookings.push({ month: monthYear, count }); // Add a new entry for the month with the specified count
  }
  
  return this.save(); // Save the updated document
};

const Agency = mongoose.model('Monument1', MonumentSchema);

module.exports = Agency;
