const express = require('express');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const dynamoSetup = require('../../dynamoSetup'); // Import DynamoDB setup
const bodyParser = require('body-parser');

// Initialize environment variables
dotenv.config();

const app = express();
app.use(express.json()); // Parse incoming JSON requests

// AWS SDK setup from .env
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,  
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Example endpoint for user registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the user in the database (replace this with your database logic)
    // Example: save user in a database (will add this later)

    // Respond with success
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Set server to listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
