// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  message: { type: String, required: true },
  customUrl: { type: String, unique: true } // New field for custom URL
});

module.exports = mongoose.model('User', userSchema);
