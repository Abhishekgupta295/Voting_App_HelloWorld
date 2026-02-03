const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables from .env file
const mongoLocalURL = process.env.MONGO_LOCAL_URL; // Local MongoDB URLf

//const mongoatlasURL = process.env.MONGO_ATLAS_URL;

// if (!mongoatlasURL) {
//   console.warn('MONGO_ATLAS_URL not set; skipping mongoose.connect. Set MONGO_ATLAS_URL in .env or use a local MongoDB URL.');
// } else {
//   mongoose.connect(mongoatlasURL).catch((err) => {
//     console.error('Initial MongoDB connection error:', err);
//   });
// }

// mongoose.connect(mongoatlasURL, {
//   ssl: true,
//   retryWrites: true,
//   w: "majority"
// })
// .then(() => console.log("Connected to MongoDB successfully!"))
// .catch(err => console.error("MongoDB connection error:", err));

mongoose.connect(mongoLocalURL)


const db = mongoose.connection;

db.on('connected', () => {
  console.log('Connected to MongoDB successfully!');
});

db.on('error', (error) => {
  console.log('Error connecting to MongoDB', error);
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

module.exports = db;