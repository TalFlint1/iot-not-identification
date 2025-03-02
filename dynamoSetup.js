require('dotenv').config();  // Load environment variables from .env file

// Import necessary modules from AWS SDK
const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

// Initialize the DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Function to create the user table
const createUserTable = async () => {
  const params = {
    TableName: 'Users',  // Name of the table
    KeySchema: [
      { AttributeName: 'username', KeyType: 'HASH' }  // Partition key (username)
    ],
    AttributeDefinitions: [
      { AttributeName: 'username', AttributeType: 'S' }  // Define 'username' as a string
    ],
    BillingMode: 'PAY_PER_REQUEST'  // Use on-demand billing mode
  };

  try {
    // Create the table using DynamoDB SDK
    const command = new CreateTableCommand(params);
    const data = await client.send(command);
    console.log('Table created successfully:', data);
  } catch (err) {
    console.error('Error creating table:', err.message); // Show only the error message
    console.error(err);  // Full error details for debugging
  }
};

// Call the function to create the table
createUserTable();
