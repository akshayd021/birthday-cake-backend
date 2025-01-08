
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./router/userRouter');
const phonepeRoute = require('./router/PhonePayRoute');

const cors =  require("cors")
// Load environment variables
dotenv.config();

const app = express();
app.use(cors())
app.use(express.json()); 

const PORT = process.env.PORT || 8000;

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit with failure if unable to connect
  }
})();

// Use the user routes
app.use('/api', userRoutes);
app.use("/api", phonepeRoute);
app.use("/pay", phonepeRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
